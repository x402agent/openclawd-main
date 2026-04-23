#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readUtf8(relativePath) {
  try {
    return readFileSync(join(root, relativePath), "utf8");
  } catch {
    return null;
  }
}

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
}).split("\0").filter(Boolean);

const forbiddenTrackedFiles = [
  {
    matches: (file) => /(^|\/)\.env(\.[^.\/]+)?$/.test(file) && !/\.example$/.test(file),
    message: (file) => `tracked env file: ${file}`,
  },
  {
    matches: (file) => file.endsWith(".DS_Store"),
    message: (file) => `junk file should not be tracked: ${file}`,
  },
  {
    matches: (file) => /\.(pem|key)$/i.test(file),
    message: (file) => `sensitive key material should not be tracked: ${file}`,
  },
];

for (const file of trackedFiles) {
  for (const rule of forbiddenTrackedFiles) {
    if (rule.matches(file)) {
      error(rule.message(file));
    }
  }
  if (file.startsWith("tailclawd-backup/")) {
    warn(`backup directory still tracked: ${file}`);
  }
}

const topLevelDocs = ["README.md", "CONTRIBUTING.md", "SECURITY.md", "STACK.md"];
for (const doc of topLevelDocs) {
  const body = readUtf8(doc);
  if (!body) {
    error(`missing required doc: ${doc}`);
    continue;
  }
  if (body.includes("./agents/")) {
    error(`${doc} contains broken ./agents/ path references`);
  }
}

if (!existsSync(join(root, ".github/workflows/oss-readiness.yml"))) {
  error("missing CI workflow: .github/workflows/oss-readiness.yml");
}

const textLikeExtensions = new Set([
  ".cjs",
  ".css",
  ".env",
  ".go",
  ".html",
  ".ini",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sh",
  ".swift",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const textLikeBasenames = new Set([
  ".gitignore",
  ".npmrc",
  ".nvmrc",
  "CODEOWNERS",
  "Dockerfile",
  "LICENSE",
  "LICENSE.md",
  "package.json",
]);

const secretPatterns = [
  { name: "AWS access key", pattern: /\bA(?:K|S)IA[0-9A-Z]{16}\b/g },
  { name: "GitHub token", pattern: /\b(?:ghp|gho|ghu|ghs)_[A-Za-z0-9]{20,}\b/g },
  { name: "GitHub fine-grained token", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: "OpenAI project key", pattern: /\bsk-proj-[A-Za-z0-9_-]{20,}\b/g },
  { name: "OpenAI live key", pattern: /\bsk_live_[A-Za-z0-9]{16,}\b/g },
  { name: "OpenRouter key", pattern: /\bsk-or-v1-[A-Za-z0-9]{32,}\b/g },
  { name: "xAI key", pattern: /\bxai-[A-Za-z0-9]{24,}\b/g },
  { name: "Google API key", pattern: /\bAIza[0-9A-Za-z\-_]{35}\b/g },
  { name: "SendGrid API key", pattern: /\bSG\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}\b/g },
  { name: "Private key block", pattern: /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g },
];

for (const file of trackedFiles) {
  const extension = extname(file);
  const basename = file.split("/").at(-1) ?? file;
  if (!textLikeExtensions.has(extension) && !textLikeBasenames.has(basename)) {
    continue;
  }
  if (file.startsWith("legacy/") || file.startsWith("solana-go-main/")) {
    continue;
  }

  const body = readUtf8(file);
  if (body == null) continue;

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(body)) {
      error(`possible ${name} found in tracked file: ${file}`);
    }
  }
}

const packageMetadataChecks = [
  "clawdrouter/package.json",
  "api-registrar/package.json",
  "packages/agents-x402-solana/package.json",
  "packages/percolator/package.json",
  "openclawd-stack/package.json",
  "MCP/package.json",
];

for (const file of packageMetadataChecks) {
  const body = readUtf8(file);
  if (!body) {
    error(`missing package metadata file: ${file}`);
    continue;
  }
  const pkg = JSON.parse(body);
  if (!pkg.repository) error(`${file} is missing repository metadata`);
  if (!pkg.homepage) warn(`${file} is missing homepage metadata`);
  if (!pkg.bugs) warn(`${file} is missing bugs metadata`);
}

for (const warning of warnings) {
  console.log(`warn: ${warning}`);
}

for (const failure of errors) {
  console.log(`fail: ${failure}`);
}

console.log("");
if (errors.length > 0) {
  console.log(`release check failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`release check passed${warnings.length ? ` with ${warnings.length} warning(s)` : ""}.`);
