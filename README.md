# Pi Monitor

Real-time dashboard for Raspberry Pi CPU temperature and memory usage, hosted on Render.

https://pi-monitor-cv3u.onrender.com/

## How it works

The Pi runs a Python script that reads CPU temperature and memory usage every 5 seconds and sends it to a Node.js WebSocket server on Render. Browser clients connect to Render and see a live full-screen chart with time (CET) and temperature axes.

The Pi stores the full day's readings locally, so when Render's free tier spins down and back up, the Pi reconnects and re-sends all of today's data — no gaps in the chart.
