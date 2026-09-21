#!/usr/bin/env bun
/**
 * backup.ts — Copy live configs from THIS machine into the repo.
 * Run:  bun scripts/backup.ts [--push]
 *   --push : also stage, commit and push automatically
 */
import { cpSync, existsSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";

const home = homedir();
const isWin = platform() === "win32";
const repoDir = join(import.meta.dir, "..");

const desktopSettings = isWin
  ? join(home, "AppData", "Roaming", "Paseo", "desktop-settings.json")
  : join(home, ".config", "Paseo", "desktop-settings.json");

// [source on this machine, destination inside the repo]
const mappings: Array<[string, string]> = [
  // pi
  [join(home, ".pi", "agent", "settings.json"), join(repoDir, "pi", "settings.json")],
  [join(home, ".pi", "agent", "models.json"), join(repoDir, "pi", "models.json")],
  [join(home, ".pi", "agent", "models-store.json"), join(repoDir, "pi", "models-store.json")],
  [join(home, ".pi", "agent", "npm"), join(repoDir, "pi", "packages")],
  // paseo
  [join(home, ".paseo", "config.json"), join(repoDir, "paseo", "config.json")],
  [join(home, ".paseo", "projects", "projects.json"), join(repoDir, "paseo", "projects.json")],
  [join(home, ".paseo", "projects", "workspaces.json"), join(repoDir, "paseo", "workspaces.json")],
  [desktopSettings, join(repoDir, "paseo", "desktop-settings.json")],
];

console.log("Backing up configs into repo...\n");
let ok = 0;
for (const [src, dest] of mappings) {
  if (!existsSync(src)) {
    console.log(`  ✗ missing: ${src}`);
    continue;
  }
  cpSync(src, dest, { recursive: true, force: true });
  // The source npm folder ships its own ignore-all .gitignore which would
  // prevent node_modules from being committed — drop it from the repo copy.
  const innerGitignore = join(dest, ".gitignore");
  if (statSync(src).isDirectory() && existsSync(innerGitignore)) rmSync(innerGitignore);
  const kind = statSync(src).isDirectory() ? "dir " : "file";
  console.log(`  ✓ [${kind}] ${src} -> ${dest.replace(repoDir + "\\", "").replace(repoDir + "/", "")}`);
  ok++;
}
console.log(`\n${ok}/${mappings.length} items copied.`);

if (process.argv.includes("--push")) {
  const msg = `backup ${new Date().toISOString().slice(0, 10)}`;
  const run = (cmd: string, args: string[]) => {
    const r = Bun.spawnSync(cmd, args, { cwd: repoDir, stdout: "inherit", stderr: "inherit" });
    if (r.exitCode !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
  };
  run("git", ["add", "-A"]);
  const status = Bun.spawnSync(["git", "status", "--porcelain"], { cwd: repoDir });
  if (status.stdout.toString().trim() === "") {
    console.log("Nothing changed — nothing to commit.");
  } else {
    run("git", ["commit", "-m", msg]);
    run("git", ["push"]);
    console.log(`\nPushed: "${msg}"`);
  }
} else {
  console.log("\nNext: git add -A && git commit -m 'backup' && git push  (or run with --push)");
}
