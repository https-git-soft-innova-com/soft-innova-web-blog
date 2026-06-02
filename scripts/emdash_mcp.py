#!/usr/bin/env python3
"""Minimal EmDash MCP HTTP+SSE client for blog.soft-innova.com."""
import json
import sys
import urllib.request
from pathlib import Path

MCP_URL = "https://blog.soft-innova.com/_emdash/api/mcp"


def load_token() -> str:
    mcp_json = Path.home() / ".cursor" / "mcp.json"
    data = json.loads(mcp_json.read_text())
    auth = data["mcpServers"]["emdash-blog"]["headers"]["Authorization"]
    return auth.split(" ", 1)[1]


def call_tool(name: str, arguments: dict) -> dict:
    token = load_token()
    body = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments},
        }
    ).encode()
    req = urllib.request.Request(
        MCP_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode()
    for line in raw.splitlines():
        if line.startswith("data: "):
            payload = json.loads(line[6:])
            if "error" in payload:
                raise RuntimeError(payload["error"])
            return payload.get("result", payload)
    raise RuntimeError(f"No SSE data in response: {raw[:500]}")


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: emdash_mcp.py <tool> [json-args]")
        sys.exit(1)
    tool = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    result = call_tool(tool, args)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
