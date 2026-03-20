const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const PI_SECRET = process.env.PI_SECRET || "changeme";

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

const history = [];
const browsers = new Set();
let piConnected = false;
let piSocket = null;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const params = new URL(req.url, `http://localhost`).searchParams;

  if (params.get("role") === "pi") {
    if (params.get("secret") !== PI_SECRET) {
      ws.close(4001, "Unauthorized");
      return;
    }
    console.log("Pi connected");
    if (piSocket && piSocket.readyState <= 1) piSocket.close();
    piSocket = ws;
    piConnected = true;
    const statusMsg = JSON.stringify({ type: "status", piConnected: true });
    for (const b of browsers) {
      if (b.readyState === 1) b.send(statusMsg);
    }
    ws.on("message", (data) => {
      try {
        const parsed = JSON.parse(data);

        // Pi sends full history on connect
        if (parsed.type === "history") {
          history.length = 0;
          for (const p of parsed.data) {
            history.push({ temp: p.temp, timestamp: p.timestamp });
          }
          console.log(`Received history: ${history.length} readings`);
          // Push history to all connected browsers
          const msg = JSON.stringify({ type: "history", data: history });
          for (const b of browsers) {
            if (b.readyState === 1) b.send(msg);
          }
          return;
        }

        // Individual reading
        const point = { temp: parsed.temp, timestamp: parsed.timestamp };
        history.push(point);
        const msg = JSON.stringify(parsed);
        for (const b of browsers) {
          if (b.readyState === 1) b.send(msg);
        }
      } catch {}
    });
    ws.on("close", () => {
      if (ws !== piSocket) return;
      console.log("Pi disconnected");
      piSocket = null;
      piConnected = false;
      const statusMsg = JSON.stringify({ type: "status", piConnected: false });
      for (const b of browsers) {
        if (b.readyState === 1) b.send(statusMsg);
      }
    });
  } else {
    browsers.add(ws);
    ws.send(JSON.stringify({ type: "status", piConnected }));
    if (history.length > 0) {
      ws.send(JSON.stringify({ type: "history", data: history }));
    }
    ws.on("close", () => browsers.delete(ws));
  }
});

server.listen(PORT, () => console.log(`Monitor running on port ${PORT}`));
