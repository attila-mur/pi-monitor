# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pi monitor — a real-time dashboard hosted on Render that displays Raspberry Pi CPU temperature.

## Architecture

- **Pi 4** (hostname: `pi-nas`, user: `sandman`, IP: `192.168.0.62`) runs a Python script that reads CPU temp every 5 seconds
- **Render** hosts a Node.js WebSocket server + dashboard page
- Pi connects **outbound** to Render via WebSocket — no ports opened on the home network
- Browser clients connect to Render and receive live temp updates
- Auth: `PI_SECRET` env var on Render, Pi sends it as a query param

## Structure

- `monitor/` — Node.js app deployed to Render
  - `server.js` — HTTP + WebSocket server, relays Pi data to browser clients
  - `index.html` — Dashboard with live temp, color coding (cool < 60°C, warm < 75°C, hot), mini chart (last 60 readings)
  - `package.json` — dependencies (ws)
- `scripts/` — Runs on the Pi
  - `temp-monitor.py` — WebSocket client, reads `vcgencmd measure_temp`, sends every 5 seconds. Requires `pip install websocket-client`

## Deployment Status

- **Not yet deployed** — next steps:
  1. Deploy `monitor/` to Render as a Web Service (root dir: `monitor`, build: `npm install`, start: `npm start`)
  2. Set `PI_SECRET` env var on Render
  3. Update `SERVER_URL` in `scripts/temp-monitor.py` with the Render URL and secret
  4. Run `temp-monitor.py` on the Pi (then set up as systemd service for auto-start)

## Related

- The Pi NAS setup (Jellyfin, qBittorrent, Samba) is in a separate private repo (`pi-nas`)
