const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const PI_SECRET = process.env.PI_SECRET || "changeme";

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

let latest = { temp: null, timestamp: null };
const browsers = new Set();

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
    ws.on("message", (data) => {
      try {
        latest = JSON.parse(data);
        latest.timestamp = Date.now();
        for (const b of browsers) {
          if (b.readyState === 1) b.send(JSON.stringify(latest));
        }
      } catch {}
    });
    ws.on("close", () => console.log("Pi disconnected"));
  } else {
    browsers.add(ws);
    if (latest.temp !== null) ws.send(JSON.stringify(latest));
    ws.on("close", () => browsers.delete(ws));
  }
});

server.listen(PORT, () => console.log(`Monitor running on port ${PORT}`));
