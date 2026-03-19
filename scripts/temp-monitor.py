#!/usr/bin/env python3
"""Sends Pi temperature to the Render monitor via WebSocket."""

import json
import subprocess
import time
import sys

try:
    import websocket
except ImportError:
    print("Install websocket-client: pip install websocket-client")
    sys.exit(1)

# Configure these
SERVER_URL = "wss://YOUR_RENDER_URL/ws?role=pi&secret=YOUR_SECRET"
INTERVAL = 5  # seconds


def get_temp():
    result = subprocess.run(
        ["vcgencmd", "measure_temp"], capture_output=True, text=True
    )
    # Output: temp=45.0'C
    return float(result.stdout.strip().split("=")[1].replace("'C", ""))


def main():
    while True:
        try:
            print(f"Connecting to {SERVER_URL.split('?')[0]}...")
            ws = websocket.create_connection(SERVER_URL, timeout=10)
            print("Connected!")
            while True:
                temp = get_temp()
                ws.send(json.dumps({"temp": temp}))
                print(f"Sent: {temp}°C")
                time.sleep(INTERVAL)
        except (ConnectionError, websocket.WebSocketException, OSError) as e:
            print(f"Connection lost: {e}. Retrying in 10s...")
            time.sleep(10)
        except KeyboardInterrupt:
            print("Stopped.")
            break


if __name__ == "__main__":
    main()
