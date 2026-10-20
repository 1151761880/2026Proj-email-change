# ClawHub / OpenClaw + Cursor

This folder is the **canonical** packaged skill for the 十组邮件小助手 API CLI (`@inbox-zero/api`, binary `inbox-zero-api`).

外部接入包暂存于 `extras/ai-integrations/`，当前没有仓库根目录的插件或技能发现入口。需要使用时再安装或恢复入口。

- **OpenClaw**: publish or install from here; see `inbox-zero-api/SKILL.md` frontmatter `metadata.openclaw`.
- **Cursor Directory**: the plugin manifest is stored at `../.cursor-plugin/plugin.json`, and `../skills/inbox-zero-api` points to this skill directory. To restore root discovery, move `clawhub/`, `skills/`, `agents/`, and `.cursor-plugin/` from this staging area back to the repository root. On Windows, recreate `skills/inbox-zero-api` as a directory symlink to `../clawhub/inbox-zero-api` if checkout produced a plain text file.

Edit content only under `inbox-zero-api/`; the Cursor plugin picks it up automatically.
