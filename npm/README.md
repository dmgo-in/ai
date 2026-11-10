# @dmgo/ai

Connect [DMGO](https://www.dmgo.in) to every AI tool on your computer in one command.

```bash
npx @dmgo/ai
```

It finds Claude Code, Codex CLI, Gemini CLI and Cursor, adds the DMGO connector
(`https://api.dmgo.in/mcp`) and three skills (`dmgo-bio-page`, `dmgo-instagram-automation`,
`dmgo-creator-commerce`), then helps you sign in
with your DMGO account. There are no API keys.

Then ask your AI: *"Design my DMGO bio page and put my best product first."* It saves a
**draft**. You review and publish it in DMGO. It can also set up paused automations, draft
products, coupons, booking pages and lead magnets, read your totals and make paused smart
links. The AI can never publish, delete, or see DMs, leads, buyers, orders or payouts.

| Option | What it does |
|---|---|
| `--dry-run` | Show what would change; change nothing |
| `--yes` | Don't ask before changing |
| `--only claude,codex` | Limit to some tools (`claude`, `codex`, `gemini`, `cursor`) |
| `--uninstall` | Remove DMGO from every tool |

For Claude (web/app) and ChatGPT, add a custom connector with the URL
`https://api.dmgo.in/mcp`.

Help: support@dmgo.in · Security: security@dmgo.in

Disconnect anytime: DMGO → Settings → AI connections. Full kit: https://github.com/dmgo-in/ai
