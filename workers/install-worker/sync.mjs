#!/usr/bin/env node
/**
 * Embeds ../../install.sh as a TypeScript template literal in src/install-script.ts.
 * Run automatically before `wrangler deploy` via the `predeploy` script.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "..", "..", "install.sh");
const dst = resolve(here, "src", "install-script.ts");

const sh = readFileSync(src, "utf8");
const escaped = sh
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const out =
  `// AUTO-GENERATED from /install.sh — do not edit by hand.\n` +
  `// Regenerate with: npm run sync (in workers/install-worker).\n` +
  `export const INSTALL_SCRIPT = \`${escaped}\`;\n`;

writeFileSync(dst, out);
console.log(`✓ wrote ${dst} (${out.length} bytes, from ${sh.length}-byte install.sh)`);
