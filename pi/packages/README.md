# pi/packages — plugin packages + sources

This folder is the npm project pi uses for its plugins (`~/.pi/agent/npm` on the live machine), **plus** the plugin source code as git submodules.

```
pi/packages/
├── package.json          # npm project ("pi-extensions") — synced with ~/.pi/agent/npm
├── package-lock.json     # pins exact published versions — synced
├── node_modules/         # COMMITTED working install (20 @pify/* packages) — synced
└── <name>/               # git submodule of github.com/pifydev/<name> — REPO ONLY,
                          #   pinned to the tag matching the installed version
                          #   (todo @ v0.3.0, memory @ v0.10.0, ...). NOT synced.
```

- `scripts/backup.ts` / `scripts/restore.ts` sync **only** `package.json`, `package-lock.json` and `node_modules` with the live folder. The submodule checkouts never leave this repo.
- After cloning this repo on a new machine, materialize the sources:

  ```bash
  git submodule update --init
  ```

## Browsing & customizing a plugin

Each `<name>/` is a full checkout of the upstream repo at the installed version — read it, run its tests (`bun test` inside), or hack on it.

To keep customizations:

1. **Fork** `pifydev/<name>` to your GitHub account.
2. Point the submodule at your fork and branch:
   ```bash
   cd pi/packages/<name>
   git remote set-url origin https://github.com/<you>/<name>.git
   git switch -c my-custom
   # ... edit, commit, push ...
   ```
3. Commit the submodule pointer here (`git add pi/packages/<name>`).

## Using a customized build in live pi

Point the npm dependency at the local source instead of the registry, then reinstall:

```bash
cd pi/packages
# package.json: "@pify/todo": "file:./todo"
bun install
cd scripts && bun backup.ts --push   # node_modules now contains your build
```

## Updating pins

```bash
# bump a single plugin to its newest tag
cd pi/packages/<name> && git fetch --tags && git checkout v<new> && cd ../..
git add pi/packages/<name>

# or move everything to upstream main (may drift from the published versions)
git submodule update --remote
```

Keep `package.json` / lockfile in sync with what you actually install — pi's live folder is driven by the npm project here.
