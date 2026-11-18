import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const project = fileURLToPath(new URL("../", import.meta.url));
const sdkName = "@blueconic/blueconic-react-native";
const sdkManifest = require.resolve(`${sdkName}/package.json`);
const reactNativeManifest = require.resolve("react-native/package.json");
const expectedSDK = require("../package.json").devDependencies[sdkName];
const consumer = mkdtempSync(join(tmpdir(), "blueconic-types-consumer-"));
// Windows ships an npm.cmd launcher. Run its CLI with Node to keep arguments out of a shell.
const [npm, ...npmArgs] = process.platform === "win32"
    ? [process.execPath, join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")]
    : ["npm"];

try {
    // Use the locked SDK and the actual npm tarball. The test can run offline.
    const npmOptions = {
        cwd: consumer,
        env: { ...process.env, npm_config_cache: join(consumer, ".npm"), npm_config_offline: "true" },
    };
    writeFileSync(join(consumer, "package.json"), '{"private":true,"type":"module"}\n');
    const [archive] = JSON.parse(execFileSync(npm, [...npmArgs, "pack", project, "--ignore-scripts", "--json"], {
        ...npmOptions,
        encoding: "utf8",
    }));
    execFileSync(npm, [
        ...npmArgs, "install", "--ignore-scripts", "--strict-peer-deps", "--install-links=false",
        "--no-audit", "--no-fund", "--no-package-lock",
        join(consumer, archive.filename), dirname(sdkManifest), dirname(reactNativeManifest),
    ], { ...npmOptions, stdio: "inherit" });
    const modules = join(consumer, "node_modules");
    assert.equal(require(join(modules, sdkName, "package.json")).version, expectedSDK);

    const readme = readFileSync(join(modules, archive.name, "README.md"), "utf8");
    const files = [];
    for (const [, info, source] of readme.matchAll(/^```(?:typescript|ts)\b([^\r\n]*)\r?\n([\s\S]*?)^```[ \t]*\r?$/gm)) {
        const title = /^title="([\w-]+(?:\.d)?\.ts)"$/.exec(info.trim());
        assert.ok(title, "Give each TypeScript example a filename so the consumer can compile it");
        writeFileSync(join(consumer, title[1]), source, { flag: "wx" });
        files.push(title[1]);
    }
    assert.ok(files.includes("env.d.ts"), "Missing README declaration reference example");
    assert.ok(files.some(file => !file.endsWith(".d.ts")), "Missing README application example");

    const compilerOptions = {
        strict: true,
        target: "ES2020",
        lib: ["ES2020"],
        module: "ESNext",
        moduleResolution: "bundler",
        verbatimModuleSyntax: true,
        types: [],
        outDir: "out",
    };
    writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions, files }));
    execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", consumer], { stdio: "inherit" });

    const output = join(consumer, "out");
    const imports = new Set();
    for (const file of readdirSync(output)) {
        const js = readFileSync(join(output, file), "utf8");
        for (const dependency of ts.preProcessFile(js, true, true).importedFiles) {
            imports.add(dependency.fileName);
        }
    }
    assert.deepEqual([...imports], [sdkName], "Emitted examples should import only the runtime SDK");
    console.log(`Packed ${archive.name}@${archive.version} passed the README checks against ${sdkName}@${expectedSDK}.`);
} finally {
    rmSync(consumer, { recursive: true, force: true });
}
