# pi/packages — plugin packages + sources

This folder is the npm project pi uses for its plugins (`~/.pi/agent/npm` on the live machine), **plus** the plugin source code as git submodules.

```
pi/packages/
├── package.json          # npm project ("pi-extensions") — synced with ~/.pi/agent/npm
├── package-lock.json     # pins exact published versions — synced
├── <name>/               # git submodule of the plugin's source repo (pifydev/<name>
│                         #   or nicobailon/<name>), pinned to the tag matching the
│                         #   installed version. REPO ONLY — not synced to live.
└── node_modules/         # local working install — NOT committed; recreated by
                          #   `bun install --frozen-lockfile` (restore.ts runs it)
```

- `scripts/backup.ts` / `scripts/restore.ts` sync **only** `package.json` + `package-lock.json` with the live folder. `node_modules` is rebuilt from the lockfile (`bun install`), and the submodule checkouts never leave this repo.
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
bun install          # updates package-lock.json too — commit it
cd scripts && bun backup.ts --push
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
