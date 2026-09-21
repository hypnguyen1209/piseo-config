#!/usr/bin/env bun
/**
 * restore.ts — Restore configs from the repo onto THIS machine (new machine).
 * Run:  bun scripts/restore.ts
 *
 * Note: pi/packages/<name>/ are git submodules (pifydev plugin sources) kept
 * for reference/customization — restore only copies the npm-project bits
 * (package.json, lockfile, node_modules) to the live folder.
 */
import { cpSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";

const home = homedir();
const isWin = platform() === "win32";
const repoDir = join(import.meta.dir, "..");

const desktopSettings = isWin
  ? join(home, "AppData", "Roaming", "Paseo", "desktop-settings.json")
  : join(home, ".config", "Paseo", "desktop-settings.json");

// [source inside the repo, destination on this machine]
const mappings: Array<[string, string]> = [
  // pi
  [join(repoDir, "pi", "settings.json"), join(home, ".pi", "agent", "settings.json")],
  [join(repoDir, "pi", "models.json"), join(home, ".pi", "agent", "models.json")],
  [join(repoDir, "pi", "models-store.json"), join(home, ".pi", "agent", "models-store.json")],
  // pi packages — npm-project bits only; submodule sources stay in the repo
  [join(repoDir, "pi", "packages", "package.json"), join(home, ".pi", "agent", "npm", "package.json")],
  [join(repoDir, "pi", "packages", "package-lock.json"), join(home, ".pi", "agent", "npm", "package-lock.json")],
  [join(repoDir, "pi", "packages", "node_modules"), join(home, ".pi", "agent", "npm", "node_modules")],
  // paseo
  [join(repoDir, "paseo", "config.json"), join(home, ".paseo", "config.json")],
  [join(repoDir, "paseo", "projects.json"), join(home, ".paseo", "projects", "projects.json")],
  [join(repoDir, "paseo", "workspaces.json"), join(home, ".paseo", "projects", "workspaces.json")],
  [join(repoDir, "paseo", "desktop-settings.json"), desktopSettings],
];

console.log("Restoring configs from repo...\n");
let ok = 0;
for (const [src, dest] of mappings) {
  if (!existsSync(src)) {
    console.log(`  ✗ not in repo: ${src}`);
    continue;
  }
  cpSync(src, dest, { recursive: true, force: true });
  const kind = statSync(src).isDirectory() ? "dir " : "file";
  console.log(`  ✓ [${kind}] ${src.replace(repoDir, ".")} -> ${dest.replace(home, "~")}`);
  ok++;
}
console.log(`\n${ok}/${mappings.length} items restored.`);

console.log(`
Finish manually (see README.md):
  1. pi auto-installs plugins from the packages/ folder on next start.
  2. Re-login pi auth and set the NINE_ROUTER_KEY environment variable.
  3. Paseo generates a fresh daemon-keypair.json on first run — nothing to do.
  4. Want to hack on plugin sources? They are git submodules in pi/packages/`);
