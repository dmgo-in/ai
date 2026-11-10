# DMGO AI

Let your own AI design your Instagram link-in-bio page on [DMGO](https://www.dmgo.in).

You tell Claude, ChatGPT, Codex or Gemini something like *"make my DMGO page look premium
and put my course on top."* The AI reads your DMGO account, picks the look and
writes the text, then saves a **draft**. You open DMGO, check the preview and
press **Publish**.

This kit has two parts:

- **The DMGO connector** (MCP server `https://api.dmgo.in/mcp`) gives the AI
  access to your DMGO account. You sign in with your DMGO account. There are no
  API keys to copy.
- **The `dmgo-bio-page` skill** teaches the AI what a high-converting DMGO page
  looks like: layouts by niche, copy rules and block order.

## What the AI can and can't do

| Can | Can't |
|---|---|
| See your bio page, Instagram handles and product list | Publish anything without you |
| Read your public Instagram profile and recent reel captions | Delete anything |
| Save a draft of your bio page | See payments, payouts or billing |
| | Read your DMs, followers or leads |

You can disconnect any AI app anytime in **DMGO → Settings → AI connections**.

## Fastest setup: one command

```bash
npx @dmgo/ai
```

This finds Claude Code, Codex CLI, Gemini CLI and Cursor on your computer, adds
the DMGO connector and the skill to each one, and tells you how to sign in. It asks
before changing anything. Use `npx @dmgo/ai --uninstall` to remove everything.

Skill only (any agent that supports skills):

```bash
npx skills add dmgo-in/ai
```

## Setup by app

### Claude (claude.ai, desktop and mobile)
1. **Settings → Connectors → Add custom connector**
2. Name: `DMGO`. URL: `https://api.dmgo.in/mcp`
3. Click **Connect**, sign in to DMGO and press **Allow**.
4. Optional: upload `skills/dmgo-bio-page` as a skill (**Settings → Capabilities → Skills**).

### Claude Code
As a plugin (connector + skill):
```bash
claude plugin marketplace add dmgo-in/ai
claude plugin install dmgo@dmgo
```
Or the connector only:
```bash
claude mcp add --transport http dmgo https://api.dmgo.in/mcp
```
Then type `/mcp`, pick **dmgo**, choose **Authenticate** and press **Allow** in the browser.

### Codex (OpenAI Codex CLI)
As a plugin (connector + skill):
```bash
codex plugin marketplace add dmgo-in/ai
codex plugin add dmgo@dmgo
codex mcp login dmgo
```
Or the connector only:
```bash
codex mcp add dmgo --url https://api.dmgo.in/mcp
codex mcp login dmgo
```
The browser opens the DMGO sign-in page. Press **Allow**, then ask Codex:
*"Design my DMGO bio page."*

The skill alone (no connector) works too: inside Codex run
`$skill-installer install https://github.com/dmgo-in/ai/tree/main/skills/dmgo-bio-page`.

### ChatGPT
1. **Settings → Apps & Connectors → Create** (turn on developer mode if asked).
2. Name: `DMGO`. URL: `https://api.dmgo.in/mcp`. Authentication: **OAuth**.
3. Sign in to DMGO and press **Allow**.
4. Optional: paste `chatgpt/instructions.md` into a Custom GPT or Project.

### Gemini CLI
```bash
gemini extensions install https://github.com/dmgo-in/ai
```
Then run `/mcp auth dmgo` and press **Allow**. For the Gemini web app, paste
`chatgpt/instructions.md` into a Gem. It works without the connector and gives
you a page plan to paste.

### Cursor and other MCP apps
Add `cursor/mcp.json` (or the same URL) as a remote MCP server and sign in when asked.

## Try it

> Design my DMGO bio page. I'm a fitness coach. Make it bold and premium, put my
> best program first and add a WhatsApp button.

## Privacy

The AI app you choose (for example Anthropic or OpenAI) receives the account data
the tools return: page content, product titles and prices, Instagram handle and
public profile. DMGO never sends your followers' phone numbers or emails, your
payments or your messages. See the [DMGO privacy policy](https://www.dmgo.in/privacy-policy.html).

## Support and security

- Help: **support@dmgo.in** or [www.dmgo.in/support](https://www.dmgo.in/support)
- Security reports: **security@dmgo.in**. See [SECURITY.md](SECURITY.md)

MIT licensed.
