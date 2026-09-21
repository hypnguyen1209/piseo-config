# SETUP-PASEO — Install Paseo from scratch using this backup (Windows / Linux / macOS)

Agent-facing guide. Paseo has no plugin store of its own — its agent plugins are the pi packages restored by [SETUP-PI.md](SETUP-PI.md). Do that guide first if you also want the agent side.

## 1. Install Paseo desktop

Download the **stable** channel build for your OS from https://paseo.sh and install it. Do not open it yet if you want the restored settings to apply from the first launch.

## 2. Restore configs from this repo

```bash
git clone https://github.com/hypnguyen1209/piseo-config.git
cd piseo-config
bun scripts/restore.ts
```

Paseo-related files this writes:

| Repo file | Live location |
|---|---|
| `paseo/config.json` | `~/.paseo/config.json` — daemon listens on `127.0.0.1:6767`, CORS allows `https://app.paseo.sh`, relay **disabled** |
| `paseo/projects.json` | `~/.paseo/projects/projects.json` — known projects |
| `paseo/workspaces.json` | `~/.paseo/projects/workspaces.json` — known workspaces |
| `paseo/desktop-settings.json` | Windows: `%APPDATA%\Paseo\desktop-settings.json` · Linux: `~/.config/Paseo/desktop-settings.json` |

`projects.json` / `workspaces.json` contain absolute paths from the old machine (`rootPath`, `cwd`). Paseo tolerates stale entries — remove or reopen the projects you actually have.

## 3. First launch

- The desktop app starts the built-in daemon. On first run it generates a **fresh** `~/.paseo/daemon-keypair.json` and `server-id` — these are secrets and are deliberately not backed up. Nothing to do.
- Verify the daemon is up: it should listen on `127.0.0.1:6767` (from `config.json`).

## 4. Verify

- Open the app: notification sound enabled, daemon "keep running after quit" enabled (from `desktop-settings.json`).
- Open the restored project; agent sessions should use the pi setup from [SETUP-PI.md](SETUP-PI.md).

## 5. Going the other way (backup)

```bash
cd piseo-config
bun scripts/backup.ts --push
```

Excluded on purpose: `daemon-keypair.json`, `daemon.log`, `*.pid`, `server-id`, `cli-client-id`, Electron caches — runtime/secret files that regenerate per machine.
