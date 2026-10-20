---
name: inbox-zero-mcp
description: Search 十组邮件小助手 mail, read threads, create mailbox drafts, and manage automation rules through a remote MCP server. Use when the user wants ChatGPT, Claude, or Cursor to work with their Gmail or Outlook inbox.
---

# 十组邮件小助手 MCP

Connect to the 十组邮件小助手 MCP server configured in `mcp.json` (OAuth, Streamable HTTP). Hosted URL: `https://www.getinboxzero.com/mcp`.

## Tools

- `list_email_accounts` first when the user has more than one inbox. Pass `emailAccountId` or `emailAddress` on later calls.
- `search_inbox` for message metadata and snippets. Do not treat snippets as full bodies.
- `read_thread` for truncated plain-text bodies after you have a `threadId`.
- `create_draft` to save a mailbox draft. This does not send. Never invent a send tool.
- Rule tools (`list_rules`, `get_rule`, `create_rule`, `update_rule`, `delete_rule`) and stats tools manage automation and analytics, not mail delivery.

## Safety

- Do not send email. Drafts stay in the mailbox until the user sends them.
- Do not dump full thread bodies into follow-up tool arguments; summarize.
- Disconnect and MCP access are controlled in 十组邮件小助手 Settings → Account → MCP, not by this skill.
