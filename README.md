# Pi Monitor

Real-time dashboard for Raspberry Pi CPU temperature and memory usage, hosted on Render.

## How it works

The Pi runs a Python script that reads CPU temperature and memory usage every 5 seconds and sends it to a Node.js WebSocket server on Render. Browser clients connect to Render and see a live full-screen chart with time (CET) and temperature axes.

The Pi stores the full day's readings locally, so when Render's free tier spins down and back up, the Pi reconnects and re-sends all of today's data — no gaps in the chart.

## Setup

### Render (server)

1. Create a new **Web Service** on Render
2. Connect this repo and set:
   - **Root Directory**: `monitor`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add environment variable `PI_SECRET` with a secret value

### Raspberry Pi (client)

1. Install the websocket dependency:

   ```bash
   sudo apt install python3-websocket
   ```

2. Copy `scripts/temp-monitor.py` to the Pi and update the `SERVER_URL`:

   ```python
   SERVER_URL = "wss://<your-render-url>?role=pi&secret=<your-secret>"
   ```

3. Run:

   ```bash
   python3 temp-monitor.py
   ```

4. Open `https://<your-render-url>` in a browser to see the dashboard.

## Structure

```
monitor/          # Deployed to Render
  server.js       # HTTP + WebSocket server
  index.html      # Dashboard UI
  package.json
scripts/          # Runs on the Pi (not deployed)
  temp-monitor.py # Reads temp + memory, sends via WebSocket
render.yaml       # Render blueprint (reference only)
```
