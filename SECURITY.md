# Security policy

## Reporting a vulnerability

Email **security@dmgo.in** with the details and steps to reproduce. Please don't
open a public issue for security problems.

We acknowledge reports within 2 business days and keep you updated until the fix
ships. Please give us a reasonable time to fix the issue before you disclose it
publicly.

## Scope

- The DMGO MCP server and OAuth endpoints: `https://api.dmgo.in/mcp`,
  `https://api.dmgo.in/oauth/*` and `https://api.dmgo.in/.well-known/*`
- The `@dmgo/ai` installer and the plugins and skills in this repository
- The consent screen at `https://portal.dmgo.in/connect/authorize`

## How the connector protects accounts

- Sign-in uses OAuth 2.1 with PKCE. Users never share a password or API key with an AI app.
- Access tokens are short-lived (1 hour), stored only as hashes, and bound to
  `https://api.dmgo.in/mcp`. Refresh tokens rotate on every use.
- A connection must be approved again at least every 90 days.
- AI apps can only save **drafts** of a bio page. They can never publish, delete,
  or read payments, payouts, DMs, followers or leads.
- Users can disconnect any app instantly in DMGO → Settings → AI connections.
