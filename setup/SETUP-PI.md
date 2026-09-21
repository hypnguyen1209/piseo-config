# SETUP-PI — Install pi from scratch using this backup (Windows / Linux / macOS)

Agent-facing guide. Do these steps in order; each one is required.

## 1. Prerequisites

- [Git](https://git-scm.com/) (on Windows this also provides Git Bash)
- [Bun](https://bun.sh):
  ```bash
  # macOS / Linux
  curl -fsSL https://bun.sh/install | bash
  ```
  ```powershell
  # Windows (PowerShell)
  irm bun.sh/install.ps1 | iex
  ```
- Node.js + npm (needed to install the pi CLI itself): https://nodejs.org

## 2. Install the pi CLI

```bash
npm i -g @earendil-works/pi-coding-agent
```

## 3. Restore configs from this repo

```bash
git clone https://github.com/hypnguyen1209/piseo-config.git
cd piseo-config
bun scripts/restore.ts
```

This writes:

| Repo file | Live location |
|---|---|
| `pi/settings.json` | `~/.pi/agent/settings.json` |
| `pi/models.json` | `~/.pi/agent/models.json` |
| `pi/models-store.json` | `~/.pi/agent/models-store.json` |
| `pi/packages/package.json` + lockfile + `node_modules` | `~/.pi/agent/npm/` (working plugin install) |

`pi/packages/<name>/` (git submodules of the pifydev source repos) are **not** restored to the live machine — they are a reference/customization playground inside this repo only. To materialize them after cloning:

```bash
git submodule update --init
```

## 4. Secrets (NOT in the repo — do manually)

1. **`NINE_ROUTER_KEY`** — `pi/models.json` references it as `$NINE_ROUTER_KEY`:
   ```bash
   # bash: add to ~/.bashrc / ~/.zshrc
   export NINE_ROUTER_KEY="<your-key>"
   ```
   ```powershell
   # Windows (persistent)
   setx NINE_ROUTER_KEY "<your-key>"
   ```
2. **pi auth** — start `pi` and log in again (`~/.pi/agent/auth.json` is intentionally not backed up).

## 5. Verify

```bash
pi
```

- Plugins load from `~/.pi/agent/npm/node_modules` (20 `@pify/*` + `pi-mcp-adapter` + `pi-web-access`; `ls ~/.pi/agent/npm/node_modules/@pify | wc -l` to confirm).
- `/model` shows the 9Router models from `pi/models.json` (default: `openrouter/z-ai/glm-5.3-flash`).
- If plugins are missing or stale, refresh in place:
  ```bash
  cd ~/.pi/agent/npm && bun install
  ```

## 6. Customizing a plugin (optional)

Every plugin's source is a git submodule in `pi/packages/<name>/`, pinned to the installed version. Full workflow (fork → edit → build into live pi) is in [`pi/packages/README.md`](../pi/packages/README.md).

## 7. Going the other way (backup)

After changing config/plugins on this machine:

```bash
cd piseo-config
bun scripts/backup.ts --push
```

The script syncs only `package.json`, `package-lock.json` and `node_modules` — the source submodules in `pi/packages/` stay untouched.
