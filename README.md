# DMGO AI

Let your own AI design your Instagram link-in-bio page, set up your Instagram automations and draft the things you sell on [DMGO](https://www.dmgo.in).

You tell Claude, ChatGPT, Codex or Gemini something like *"make my DMGO page look premium
and put my course on top."* The AI reads your DMGO account, picks the look and
writes the text, then saves a **draft**. You open DMGO, check the preview and
press **Publish**.

Or ask *"set up a NOTES comment-to-DM automation on my latest reel with a follow gate."*
The AI picks the reel, writes the public reply, the DM and its button, and saves the
automation **paused**. Say "turn it on" and it goes live. It can also edit or pause your
existing automations; DMGO notifies you and every AI edit has a one-click **Undo**.

Or ask *"make a ₹99 PDF product called Interview Notes and add a coupon NOTES50 for 50% off,
first 50 people."* The AI saves the product as a **draft** and the coupon **paused**. You
upload the file, check the price, publish and switch the coupon on. It can also draft booking
pages and free lead magnets, tell you how your reels and products did (totals only), and make
smart links that open outside Instagram (saved paused until you turn them on).

This kit has two parts:

- **The DMGO connector** (MCP server `https://api.dmgo.in/mcp`) gives the AI
  access to your DMGO account. You sign in with your DMGO account. There are no
  API keys to copy.
- **Three skills**: `dmgo-bio-page` teaches the AI what a high-converting DMGO page
  looks like (layouts by niche, copy rules, block order),
  `dmgo-instagram-automation` teaches it good comment-to-DM automations (keywords,
  replies, DM buttons, follow gate), and `dmgo-creator-commerce` covers products,
  coupons, booking pages, lead magnets, insights, smart links and the one-line launch
  ("launch my ₹99 notes").

## What the AI can and can't do

| Can | Can't |
|---|---|
| See your bio page, Instagram handles and product list | Publish your bio page, products, booking pages or lead magnets without you |
| Read your public Instagram profile and recent reels, posts and captions | Delete anything you made, or change your live products and booking pages (it edits only its own drafts you have not published or edited) |
| Save a draft of your bio page | Turn on a coupon or a smart link |
| Create, edit, pause and (when you say so) turn on Instagram automations: comment → DM, story replies, DM keywords, follow gate, email, reminder | Read your DMs, followers, leads, buyers, bookings, orders or the emails people submit |
| Draft digital products, booking pages and free lead magnets, and add paused coupons | See payouts, bank or billing details |
| Read totals for up to 90 days: DMs, replies, follows, bio views and clicks, sales and ₹ revenue, sign-ups | Edit, pause or delete your smart links |
| Make https smart links (saved paused) and list them with click counts | See who clicked a link |

Products, coupons and booking pages are for India-based DMGO accounts, the same as
selling in the portal. Lead magnets, insights and smart links work everywhere. If you
connected before, reconnect once and press **Allow** for the new permissions.

You can disconnect any AI app anytime in **DMGO → Settings → AI connections**.

## Fastest setup: one command

```bash
npx @dmgo/ai
```

This finds Claude Code, Codex CLI, Gemini CLI and Cursor on your computer, adds
the DMGO connector and the three skills to each one, and tells you how to sign in. It asks
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

> Set up a ₹499 30-minute call, Mon to Fri 6 to 9 pm.

> How did my reels do this week compared to last week?

## Privacy

The AI app you choose (for example Anthropic or OpenAI) receives the account data
the tools return: page content, product titles and prices, Instagram handle and
public profile, and totals such as DM counts, sales count and ₹ revenue. DMGO never
sends your followers' or buyers' names, phone numbers or emails, your orders or payouts,
or your messages. See the [DMGO privacy policy](https://www.dmgo.in/privacy-policy.html).

## Support and security

- Help: **support@dmgo.in** or [www.dmgo.in/support](https://www.dmgo.in/support)
- Security reports: **security@dmgo.in**. See [SECURITY.md](SECURITY.md)

MIT licensed.
