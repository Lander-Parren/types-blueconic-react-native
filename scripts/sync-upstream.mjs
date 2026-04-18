#!/usr/bin/env node
// Sync script: fetch the latest @blueconic/blueconic-react-native tarball,
// extract its public API surface, diff it against the committed snapshot,
// and print actionable output. Writes the new snapshot on --write.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = "@blueconic/blueconic-react-native";
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SNAPSHOT_PATH = join(ROOT, "upstream-api.snapshot.txt");
const PKG_PATH = join(ROOT, "package.json");

const write = process.argv.includes("--write");
const bump = process.argv.includes("--bump");

const latest = execFileSync("npm", ["view", UPSTREAM, "version"], { encoding: "utf8" }).trim();
console.log(`Latest upstream: ${UPSTREAM}@${latest}`);

const work = mkdtempSync(join(tmpdir(), "bc-sync-"));
execFileSync("npm", ["pack", `${UPSTREAM}@${latest}`], { cwd: work, stdio: "pipe" });
const tarball = readdirSync(work).find(f => f.endsWith(".tgz"));
if (!tarball) {
    console.error("Failed to download upstream tarball");
    process.exit(2);
}
execFileSync("tar", ["-xzf", tarball, "-C", work], { cwd: work });
const pkgDir = join(work, "package");

const indexJs = readFileSync(join(pkgDir, "index.js"), "utf8");
const iosSwift = readFileSync(join(pkgDir, "ios", "BlueConicClientModule.swift"), "utf8");

const jsExports = [...indexJs.matchAll(/export\s+(?:default\s+)?(?:\{([^}]+)\}|class\s+(\w+))/g)]
    .flatMap(m => (m[1] ? m[1].split(",").map(s => s.trim()) : [m[2]]))
    .filter(Boolean)
    .sort();

const objcMethods = [...iosSwift.matchAll(/@objc\s+func\s+(\w+)\s*\(([^)]*)\)/g)]
    .map(m => `${m[1]}(${m[2].replace(/\s+/g, " ").trim()})`)
    .sort();

const snapshot = [
    `# @blueconic/blueconic-react-native upstream API snapshot`,
    `# version: ${latest}`,
    ``,
    `## JS exports (index.js)`,
    ...jsExports.map(e => `- ${e}`),
    ``,
    `## Native @objc methods (ios/BlueConicClientModule.swift)`,
    ...objcMethods.map(m => `- ${m}`),
    ``,
].join("\n");

const prev = existsSync(SNAPSHOT_PATH) ? readFileSync(SNAPSHOT_PATH, "utf8") : "";

if (snapshot === prev) {
    console.log(`No upstream API changes. Snapshot is current.`);
    process.exit(0);
}

console.log(`\nUpstream API changed. Diff vs. committed snapshot:\n`);
const prevLines = new Set(prev.split("\n"));
const nextLines = new Set(snapshot.split("\n"));
const added = [...nextLines].filter(l => !prevLines.has(l) && l.startsWith("- "));
const removed = [...prevLines].filter(l => !nextLines.has(l) && l.startsWith("- "));
for (const l of added) console.log(`+ ${l.slice(2)}`);
for (const l of removed) console.log(`- ${l.slice(2)}`);

if (write) {
    writeFileSync(SNAPSHOT_PATH, snapshot);
    console.log(`\nWrote ${SNAPSHOT_PATH}`);
}

if (bump) {
    const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8"));
    pkg.version = latest;
    writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 4) + "\n");
    console.log(`Bumped package.json version -> ${latest}`);
}

if (!write && !bump) {
    console.log(`\nRe-run with --write to update the snapshot, --bump to match package.json to ${latest}.`);
    console.log(`Then update index.d.ts to reflect the diff above and run \`pnpm test\`.`);
    process.exit(1);
}
