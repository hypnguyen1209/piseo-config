# piseo-config

Backup of my full **pi coding agent** setup (config + plugins/packages + models list) and **Paseo** (config), so I can restore everything on a new machine.

> ⚠️ **This repo contains NO secrets** (no API keys, no keypairs). See [Security](#security).

## Repository structure

```
piseo-config/
├── README.md
├── scripts/
│   ├── backup.ts          # Copy configs from this machine into the repo (bun)
│   └── restore.ts         # Restore configs from the repo onto this machine (bun)
├── pi/                    # ~/.pi/agent/
│   ├── settings.json      # Main config (theme, default provider/model, package list)
│   ├── models.json        # Custom providers & models (9Router, OpenRouter, ...)
│   ├── models-store.json  # pi models store
│   └── packages/          # FULL plugin packages (npm project: package.json + node_modules)
│                          # = ~/.pi/agent/npm (20 @pify/* plugins, committed as-is)
└── paseo/
    ├── config.json              # ~/.paseo/config.json (daemon config)
    ├── projects.json            # ~/.paseo/projects/projects.json
    ├── workspaces.json          # ~/.paseo/projects/workspaces.json
    └── desktop-settings.json    # Paseo desktop app settings
```

## What is backed up

**pi**
- `settings.json` — theme, default provider/model, package list.
- `models.json` / `models-store.json` — all custom providers and models (9Router local proxy, OpenRouter, CMC, MiniMax, ...).
- `packages/` — the **actual installed plugins**, committed as a full npm project (`~/.pi/agent/npm`): `package.json`, lockfile and `node_modules` with all 20 `@pify/*` packages (~2.4 MB). Restoring is instant — no reinstall needed. If you prefer a fresh install instead, run `bun install` (or `npm install`) inside the restored `npm` folder.

**paseo**
- `config.json` — daemon listen address, CORS, relay settings.
- `projects.json` / `workspaces.json` — known projects & workspaces.
- `desktop-settings.json` — desktop app settings (release channel, notifications, ...).

> Note: Paseo has no separate plugin/extension store of its own — its agent plugins are the pi packages above.

## Intentionally excluded

| File | Reason |
|---|---|
| `~/.pi/agent/auth.json` | Contains API keys / login tokens → secret |
| `~/.paseo/daemon-keypair.json` | Daemon keypair → secret |
| `~/.pi/agent/sessions/`, `memory/` | Per-machine personal data |
| `~/.paseo/daemon.log`, `*.pid`, `server-id`, `cli-client-id` | Runtime files |
| Electron caches (`~/AppData/Roaming/Paseo/Cache`, ...) | Regenerated automatically |

## Security

The repo is **public**, so it must stay secret-free:

- **pi auth**: log in again after restoring (run `pi` and login), or manage auth yourself.
- **`NINE_ROUTER_KEY`**: `pi/models.json` references the key via the `$NINE_ROUTER_KEY` environment variable (no real key in the file). On a new machine set it, e.g. in `~/.bashrc`:

  ```bash
  export NINE_ROUTER_KEY="<your-key>"
  ```

- **`daemon-keypair.json`**: Paseo generates a fresh keypair on first daemon start — no restore needed.

## Backup (old machine)

Requires [Bun](https://bun.sh) (works on Windows, Linux, macOS).

```bash
git clone https://github.com/hypnguyen1209/piseo-config.git
cd piseo-config
bun scripts/backup.ts          # copy current machine's configs into the repo
git add -A && git commit -m "backup" && git push
```

Or do everything in one step:

```bash
bun scripts/backup.ts --push   # copy + commit + push
```

## Restore (new machine)

1. Install the environment:
   - [Bun](https://bun.sh) + [Git](https://git-scm.com/) (on Windows: Git Bash)
   - [pi coding agent](https://github.com/earendil-works/pi-coding-agent)
   - [Paseo desktop](https://paseo.sh)

2. Restore configs:

   ```bash
   git clone https://github.com/hypnguyen1209/piseo-config.git
   cd piseo-config
   bun scripts/restore.ts
   ```

3. Finish manually:
   - Set `export NINE_ROUTER_KEY="<key>"` (see [Security](#security)).
   - Open `pi` — plugins are already in place; run `bun install` inside `~/.pi/agent/npm` only if you want to refresh them.
   - Log in to pi again if needed.
   - Open Paseo desktop — it generates a new `daemon-keypair.json` automatically.

## Keeping the backup up to date

Whenever you change config (add a plugin, edit models, ...):

```bash
bun scripts/backup.ts --push
```

The script only overwrites files that exist, so it is safe to run repeatedly. Commit diff before pushing if you want to review changes.
