# piseo-config

[![ci](https://github.com/hypnguyen1209/piseo-config/actions/workflows/ci.yml/badge.svg)](https://github.com/hypnguyen1209/piseo-config/actions/workflows/ci.yml)

> **⚠️ Secret-free repo:** contains **NO** API keys or keypairs (`auth.json`, `daemon-keypair.json` are deliberately excluded). Repo is public — keep it that way. See [Security](#security).

Backup of a full **pi coding agent** setup (config + plugins/packages + models list) and **Paseo** (config), restorable on any machine (Windows / Linux / macOS).

- **Fresh machine, from zero?** Read [`setup/SETUP-PI.md`](setup/SETUP-PI.md) then [`setup/SETUP-PASEO.md`](setup/SETUP-PASEO.md) — agent-facing, step-by-step.
- **Just syncing config changes?** Use [`scripts/backup.ts`](scripts/backup.ts) / [`scripts/restore.ts`](scripts/restore.ts) (Bun).

## Repository structure

```
piseo-config/
├── README.md
├── setup/
│   ├── SETUP-PI.md            # install-from-scratch guide: pi side (cross-OS)
│   └── SETUP-PASEO.md         # install-from-scratch guide: Paseo side (cross-OS)
├── scripts/
│   ├── backup.ts              # copy configs from this machine into the repo (bun)
│   └── restore.ts             # restore configs from the repo onto this machine (bun)
├── pi/                        # ~/.pi/agent/
│   ├── settings.json          # main config (theme, default provider/model, package list)
│   ├── models.json            # custom providers & models (9Router, OpenRouter, ...)
│   ├── models-store.json      # pi models store
│   └── packages/              # npm project (package.json + lockfile = ~/.pi/agent/npm;
│                              #   node_modules NOT committed — restored via `bun install`)
│                              #   + git submodules pi/packages/<name> = plugin sources
│                              #   pinned to installed versions (repo-only) — see
│                              #   pi/packages/README.md
└── paseo/
    ├── config.json            # ~/.paseo/config.json (daemon config)
    ├── projects.json          # ~/.paseo/projects/projects.json
    ├── workspaces.json        # ~/.paseo/projects/workspaces.json
    └── desktop-settings.json  # Paseo desktop app settings
```

## What is backed up

**pi**
- `settings.json` — theme, default provider/model, package list.
- `models.json` / `models-store.json` — all custom providers and models (9Router local proxy, OpenRouter, CMC, MiniMax, ...).
- `packages/` — the plugin set as an npm project: `package.json` + `package-lock.json` (22 plugins: 20 `@pify/*` + `pi-mcp-adapter` + `pi-web-access`). **`node_modules` is not committed** (~140 MB) — `restore.ts` runs `bun install --frozen-lockfile` to rebuild it exactly. Submodule sources below are excluded from that sync.
- `packages/<name>/` — **git submodules** of `github.com/pifydev/<name>`, pinned to the tag matching each installed version. Source reference + customization playground; never synced to the live machine. See [`pi/packages/README.md`](pi/packages/README.md).

**paseo**
- `config.json` — daemon listen address, CORS, relay settings.
- `projects.json` / `workspaces.json` — known projects & workspaces.
- `desktop-settings.json` — desktop app settings (release channel, notifications, ...).

> Note: Paseo has no separate plugin/extension store — its agent plugins are the pi packages above.

## Intentionally excluded

| File | Reason |
|---|---|
| `~/.pi/agent/auth.json` | Contains API keys / login tokens → secret |
| `~/.paseo/daemon-keypair.json` | Daemon keypair → secret |
| `~/.pi/agent/sessions/`, `memory/` | Per-machine personal data |
| `~/.paseo/daemon.log`, `*.pid`, `server-id`, `cli-client-id` | Runtime files |
| Electron caches (`~/AppData/Roaming/Paseo/Cache`, ...) | Regenerated automatically |

## Security

- **pi auth**: log in again after restoring (see [`setup/SETUP-PI.md`](setup/SETUP-PI.md#4-secrets-not-in-the-repo--do-manually)).
- **`NINE_ROUTER_KEY`**: `pi/models.json` references the key via the `$NINE_ROUTER_KEY` environment variable (no real key committed). Set it on each machine:
  ```bash
  export NINE_ROUTER_KEY="<your-key>"        # bash
  setx NINE_ROUTER_KEY "<your-key>"          # Windows (persistent)
  ```
- **`daemon-keypair.json`**: Paseo generates a fresh keypair on first daemon start — no restore needed.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) gates every push/PR:

- **validate-json** — every committed JSON config must parse; every plugin source submodule must be a valid package matching its dependency.
- **restore-smoke** — fresh clone on a cold runner, run `bun scripts/restore.ts` (which reinstalls plugins from the lockfile), verify the restored tree is complete (20 `@pify` + `pi-mcp-adapter` + `pi-web-access`, config files in place).

## Quick reference

```bash
# backup this machine → repo (copies, commits, pushes)
bun scripts/backup.ts --push

# restore repo → this machine
bun scripts/restore.ts
```

`backup.ts` / `restore.ts` sync only the npm manifest (`package.json` + lockfile) with the live folder — submodule sources stay repo-only, and `node_modules` is never committed (reinstalled from the lockfile).
