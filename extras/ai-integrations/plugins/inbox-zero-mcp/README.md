# 十组邮件小助手 MCP plugin

Cursor plugin that connects to an 十组邮件小助手 MCP server.

此插件暂存于 `extras/ai-integrations/plugins/inbox-zero-mcp/`，当前未在仓库中启用。需要使用时再按下述方式手动安装，并设置自己的部署地址。

## Install

Copy or symlink this directory to `~/.cursor/plugins/local/inbox-zero-mcp`, then reload Cursor.

Set the URL in `mcp.json` to your 十组邮件小助手 origin, for example `https://www.getinboxzero.com/mcp` or `https://your-inbox-zero-host/mcp`.

Or connect without the plugin by adding that `mcp.json` into `~/.cursor/mcp.json`.

## Files

- `plugin.json` — Agent Plugins manifest
- `mcp.json` — remote Streamable HTTP MCP URL
- `skills/inbox-zero-mcp/SKILL.md` — how to search, read, and draft without sending

OAuth uses dynamic client registration.
