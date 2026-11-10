#!/usr/bin/env node
/**
 * npx @dmgo/ai — connect DMGO to every AI tool on this computer in one go.
 *
 *   npx @dmgo/ai              install (asks before changing anything)
 *   npx @dmgo/ai --yes        install without asking
 *   npx @dmgo/ai --dry-run    show what would change, change nothing
 *   npx @dmgo/ai --only claude,codex
 *   npx @dmgo/ai --uninstall  remove DMGO from every tool
 *
 * It only ever touches the "dmgo" entry it owns: the DMGO MCP server
 * (https://api.dmgo.in/mcp, sign-in with your DMGO account; no keys) and the
 * dmgo-bio-page skill. JSON configs are backed up before they are edited.
 * Zero dependencies.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const SERVER_NAME = 'dmgo';
const SERVER_URL = process.env.DMGO_MCP_URL || 'https://api.dmgo.in/mcp';
const SKILL_NAMES = ['dmgo-bio-page', 'dmgo-instagram-automation'];
const HERE = path.dirname(fileURLToPath(import.meta.url));
const skillSrc = (name) => path.resolve(HERE, '..', 'skills', name);

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const DRY = flag('--dry-run');
const YES = flag('--yes') || flag('-y');
const UNINSTALL = flag('--uninstall');
const onlyArg = args.find((a) => a.startsWith('--only'));
const ONLY = onlyArg
  ? (onlyArg.includes('=') ? onlyArg.split('=')[1] : args[args.indexOf(onlyArg) + 1] || '').split(',').map((s) => s.trim()).filter(Boolean)
  : null;

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  violet: (s) => `\x1b[35m${s}\x1b[0m`,
};

if (flag('--help') || flag('-h')) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''));
  process.exit(0);
}

const HOME = os.homedir();

function which(cmd) {
  const probe = process.platform === 'win32' ? spawnSync('where', [cmd], { encoding: 'utf8' }) : spawnSync('sh', ['-c', `command -v ${cmd}`], { encoding: 'utf8' });
  return probe.status === 0 && String(probe.stdout || '').trim().length > 0;
}

// Windows CLIs are .cmd shims, which need a shell. Our arguments are fixed
// constants (no user input), quoted here so the shell sees them verbatim.
function spawn(cmd, cmdArgs, opts) {
  if (process.platform !== 'win32') return spawnSync(cmd, cmdArgs, opts);
  const line = [cmd, ...cmdArgs].map((a) => (/[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
  return spawnSync(line, { ...opts, shell: true });
}

function run(cmd, cmdArgs, { inherit = false } = {}) {
  if (DRY) {
    console.log(c.dim(`    would run: ${cmd} ${cmdArgs.join(' ')}`));
    return { status: 0, stdout: '', stderr: '' };
  }
  const r = spawn(cmd, cmdArgs, { encoding: 'utf8', stdio: inherit ? 'inherit' : 'pipe' });
  return { status: r.status ?? 1, stdout: String(r.stdout || ''), stderr: String(r.stderr || '') };
}

function quietRun(cmd, cmdArgs) {
  const r = spawn(cmd, cmdArgs, { encoding: 'utf8', cwd: HOME });
  return { status: r.status ?? 1, out: `${r.stdout || ''}${r.stderr || ''}` };
}

/** Is our server already configured (at user level) with the right URL? */
function existing(out) {
  if (!out) return 'none';
  return out.includes(SERVER_URL) ? 'same' : 'different';
}

function copySkill(destRoot) {
  const dests = [];
  for (const name of SKILL_NAMES) {
    const src = skillSrc(name);
    const dest = path.join(destRoot, name);
    if (!fs.existsSync(src)) throw new Error(`skill files missing in package (${src})`);
    if (DRY) {
      console.log(c.dim(`    would copy skill → ${dest}`));
    } else {
      fs.mkdirSync(destRoot, { recursive: true });
      fs.rmSync(dest, { recursive: true, force: true });
      fs.cpSync(src, dest, { recursive: true });
    }
    dests.push(dest);
  }
  return dests;
}

function removeSkill(destRoot) {
  let removed = false;
  for (const name of SKILL_NAMES) {
    const dest = path.join(destRoot, name);
    if (!fs.existsSync(dest)) continue;
    if (DRY) console.log(c.dim(`    would remove ${dest}`));
    else fs.rmSync(dest, { recursive: true, force: true });
    removed = true;
  }
  return removed;
}

/** Edit one key of a JSON config safely: parse, back up, write. Never clobbers a file it can't parse. */
function editJson(file, mutate) {
  let data = {};
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, 'utf8');
    try {
      data = raw.trim() ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`${file} is not plain JSON (comments?). Add this by hand: "${SERVER_NAME}": ${JSON.stringify(mutate.snippet)}`);
    }
  }
  const before = JSON.stringify(data);
  mutate(data);
  if (JSON.stringify(data) === before) return 'unchanged';
  if (DRY) {
    console.log(c.dim(`    would update ${file}`));
    return 'changed';
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, `${file}.bak-dmgo`);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return 'changed';
}

/** Append `[mcp_servers.dmgo]` to Codex's config.toml (backed up first). */
function appendCodexServer(file) {
  const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (new RegExp(`^\\[mcp_servers\\.${SERVER_NAME}\\]`, 'm').test(raw)) return;
  const block = `${raw && !raw.endsWith('\n') ? '\n' : ''}\n[mcp_servers.${SERVER_NAME}]\nurl = "${SERVER_URL}"\n`;
  if (DRY) {
    console.log(c.dim(`    would add [mcp_servers.${SERVER_NAME}] to ${file}`));
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (raw) fs.copyFileSync(file, `${file}.bak-dmgo`);
  fs.appendFileSync(file, block);
}

function mcpEntryMutator(entry) {
  const m = (data) => {
    data.mcpServers = data.mcpServers && typeof data.mcpServers === 'object' ? data.mcpServers : {};
    if (UNINSTALL) delete data.mcpServers[SERVER_NAME];
    else data.mcpServers[SERVER_NAME] = entry;
  };
  m.snippet = entry;
  return m;
}

// ───────────────────────────── targets ─────────────────────────────

const codexHome = process.env.CODEX_HOME || path.join(HOME, '.codex');

const TARGETS = [
  {
    id: 'claude',
    name: 'Claude Code',
    skill: true,
    detect: () => which('claude'),
    install() {
      // Run from HOME so a project .mcp.json elsewhere can't masquerade as installed.
      const got = quietRun('claude', ['mcp', 'get', SERVER_NAME]);
      const state = got.status === 0 && /scope:\s*user/i.test(got.out) ? existing(got.out) : 'none';
      if (state === 'different') throw new Error(`a different "${SERVER_NAME}" server is already configured. Remove it first: claude mcp remove ${SERVER_NAME} -s user`);
      if (state === 'same') console.log(c.dim('    connector already added'));
      else {
        const r = run('claude', ['mcp', 'add', '--transport', 'http', '--scope', 'user', SERVER_NAME, SERVER_URL]);
        if (r.status !== 0) throw new Error((r.stderr || r.stdout).trim() || 'claude mcp add failed');
      }
      copySkill(path.join(HOME, '.claude', 'skills'));
      return 'In Claude Code type /mcp → dmgo → Authenticate, then press Allow in the browser.';
    },
    uninstall() {
      if (quietRun('claude', ['mcp', 'get', SERVER_NAME]).status === 0) run('claude', ['mcp', 'remove', '--scope', 'user', SERVER_NAME]);
      removeSkill(path.join(HOME, '.claude', 'skills'));
    },
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    skill: true,
    detect: () => which('codex'),
    install() {
      const got = quietRun('codex', ['mcp', 'get', SERVER_NAME]);
      const state = got.status === 0 ? existing(got.out) : 'none';
      if (state === 'different') throw new Error(`a different "${SERVER_NAME}" server is already configured. Remove it first: codex mcp remove ${SERVER_NAME}`);
      if (state === 'same') console.log(c.dim('    connector already added'));
      else {
        // `codex mcp add` starts a browser sign-in on its own for OAuth servers,
        // so write the same two-line entry it would write instead.
        appendCodexServer(path.join(codexHome, 'config.toml'));
      }
      copySkill(path.join(codexHome, 'skills'));
      return { login: ['codex', ['mcp', 'login', SERVER_NAME]], hint: 'Run: codex mcp login dmgo' };
    },
    uninstall() {
      if (quietRun('codex', ['mcp', 'get', SERVER_NAME]).status === 0) run('codex', ['mcp', 'remove', SERVER_NAME]);
      removeSkill(path.join(codexHome, 'skills'));
    },
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    detect: () => which('gemini') || fs.existsSync(path.join(HOME, '.gemini')),
    install() {
      editJson(path.join(HOME, '.gemini', 'settings.json'), mcpEntryMutator({ httpUrl: SERVER_URL }));
      return 'In Gemini CLI run /mcp auth dmgo, then press Allow in the browser.';
    },
    uninstall() {
      editJson(path.join(HOME, '.gemini', 'settings.json'), mcpEntryMutator({ httpUrl: SERVER_URL }));
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    detect: () => fs.existsSync(path.join(HOME, '.cursor')),
    install() {
      editJson(path.join(HOME, '.cursor', 'mcp.json'), mcpEntryMutator({ url: SERVER_URL }));
      return 'In Cursor open Settings → MCP → dmgo → Connect, then press Allow in the browser.';
    },
    uninstall() {
      editJson(path.join(HOME, '.cursor', 'mcp.json'), mcpEntryMutator({ url: SERVER_URL }));
    },
  },
];

// ───────────────────────────── main ─────────────────────────────

async function ask(question) {
  if (YES || DRY || !process.stdin.isTTY) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const a = (await rl.question(question)).trim().toLowerCase();
  rl.close();
  return a === '' || a === 'y' || a === 'yes';
}

async function main() {
  console.log(`\n${c.violet(c.bold('DMGO'))} ${c.bold('AI connector')} ${c.dim(`→ ${SERVER_URL}`)}`);
  console.log(c.dim('Your AI designs your bio page and saves a draft. You publish. It can never publish, delete,'));
  console.log(c.dim('or see payments, DMs or leads.\n'));

  const found = TARGETS.filter((t) => (!ONLY || ONLY.includes(t.id)) && t.detect());
  if (!found.length) {
    console.log(c.yellow('No supported AI tool found on this computer (Claude Code, Codex CLI, Gemini CLI, Cursor).'));
  } else {
    console.log(`${UNINSTALL ? 'Will remove DMGO from' : 'Found'}: ${found.map((t) => c.bold(t.name)).join(', ')}`);
    if (!(await ask(UNINSTALL ? 'Remove DMGO from these? (Y/n) ' : 'Add DMGO to these? (Y/n) '))) {
      console.log('Nothing changed.');
      return;
    }
  }

  const next = [];
  for (const t of found) {
    process.stdout.write(`\n${c.bold(t.name)}\n`);
    try {
      if (UNINSTALL) {
        t.uninstall();
        console.log(`  ${c.green('✓')} removed`);
      } else {
        const result = t.install();
        console.log(`  ${c.green('✓')} ${t.skill ? 'connector + skills ready' : 'connector ready'}`);
        next.push({ t, result });
      }
    } catch (e) {
      console.log(`  ${c.red('✗')} ${String(e?.message || e)}`);
    }
  }

  if (UNINSTALL) {
    console.log(`\n${c.green('Done.')} To also cut access from DMGO's side: DMGO → Settings → AI connections → Disconnect.\n`);
    return;
  }

  // Sign-in: Codex can do it from here; the others start it from inside the app.
  for (const { t, result } of next) {
    if (result && typeof result === 'object' && result.login) {
      // A browser sign-in is never opened automatically: it is only offered to
      // a person at an interactive terminal (not with --yes / --dry-run / CI).
      const interactive = process.stdin.isTTY && process.stdout.isTTY && !YES && !DRY;
      if (interactive && (await ask(`\nSign in to DMGO for ${t.name} now? A browser window opens. (Y/n) `))) {
        run(result.login[0], result.login[1], { inherit: true });
        result.done = true;
      }
    }
  }

  console.log(`\n${c.bold('Next')}`);
  for (const { t, result } of next) {
    const hint = typeof result === 'string' ? result : result?.done ? '' : result?.hint;
    if (hint) console.log(`  • ${t.name}: ${hint}`);
  }
  console.log('  • Claude (web/app) or ChatGPT: Settings → Connectors → add custom connector → ' + SERVER_URL);
  console.log(`\nThen ask your AI: ${c.bold('"Design my DMGO bio page"')} or ${c.bold('"Set up a NOTES auto-DM on my latest reel"')}`);
  console.log(c.dim('Manage or disconnect anytime: DMGO → Settings → AI connections\n'));
}

main().catch((e) => {
  console.error(c.red(`\nSomething went wrong: ${String(e?.message || e)}`));
  process.exit(1);
});
