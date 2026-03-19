# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pi monitor — a real-time dashboard hosted on Render that displays Raspberry Pi CPU temperature and memory usage.

## Architecture

- **Pi 4** (hostname: `pi-nas`, user: `sandman`, IP: `192.168.0.62`) runs a Python script that reads CPU temp and memory every 5 seconds
- **Render** (free tier) hosts a Node.js WebSocket server + dashboard page — spins down after inactivity
- Pi connects **outbound** to Render via WebSocket — no ports opened on the home network
- Pi stores the full day's readings locally (`~/.pi-monitor/YYYY-MM-DD.json`) and re-sends history on every connect/reconnect, so Render restarts don't lose data
- Browser clients connect to Render and receive live updates + full history on connect
- Auth: `PI_SECRET` env var on Render, Pi sends it as a query param

## Structure

- `monitor/` — Node.js app deployed to Render (root dir for Render)
  - `server.js` — HTTP + WebSocket server, relays Pi data to browser clients
  - `index.html` — Full-screen dashboard with live temp, memory usage, color coding, and time-series chart (CET)
  - `package.json` — dependencies (ws)
- `scripts/` — Runs on the Pi (not deployed to Render)
  - `temp-monitor.py` — WebSocket client, reads `vcgencmd measure_temp` + `/proc/meminfo`, stores daily history, sends to Render. Requires `python3-websocket` (apt)
- `render.yaml` — Render blueprint (free tier doesn't support blueprints, used manual setup instead)

## Deployment

- **Render**: deployed as Web Service at `pi-monitor-cv3u.onrender.com`
  - Root dir: `monitor`, build: `npm install`, start: `npm start`
  - Env var: `PI_SECRET` set on Render
- **Pi**: `temp-monitor.py` copied via `scp` to `~/temp-monitor.py` on the Pi, run manually (systemd service not yet set up)

## Related

- The Pi NAS setup (Jellyfin, qBittorrent, Samba) is in a separate private repo (`pi-nas`)
