#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const mode = process.argv.includes("--staged")
  ? "staged"
  : process.argv.includes("--worktree")
    ? "worktree"
    : "tracked";

const textExtensions = new Set([
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

const textBasenames = new Set([
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
  {
    name: "AWS access key",
    pattern: /\bA(?:K|S)IA[0-9A-Z]{16}\b/g,
    allowExample: (match) => match.endsWith("EXAMPLE"),
  },
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

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function getFiles() {
  if (mode === "staged") {
    return git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
      .split("\0")
      .filter(Boolean);
  }

  if (mode === "worktree") {
    return git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
      .split("\0")
      .filter(Boolean);
  }

  return git(["ls-files", "-z"]).split("\0").filter(Boolean);
}

function shouldSkipFile(file) {
  return (
    file.startsWith("legacy/") ||
    file.startsWith("solana-go-main/") ||
    file.includes("/node_modules/") ||
    file.includes("/.next/") ||
    file.includes("/dist/") ||
    file.includes("/coverage/")
  );
}

function isTextLike(file) {
  return textExtensions.has(extname(file)) || textBasenames.has(basename(file));
}

function readFileContent(file) {
  try {
    if (mode === "staged") {
      return execFileSync("git", ["show", `:${file}`], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
      });
    }
    return readFileSync(join(root, file), "utf8");
  } catch {
    return null;
  }
}

const files = existsSync(join(root, ".git")) ? getFiles() : [];
const failures = [];

for (const file of files) {
  if (shouldSkipFile(file)) continue;

  if (/(^|\/)\.env(\.[^.\/]+)?$/.test(file) && !/\.example$/.test(file)) {
    failures.push(`env files must not be committed: ${file}`);
    continue;
  }

  if (/\.(pem|key)$/i.test(file)) {
    failures.push(`private key material must not be committed: ${file}`);
    continue;
  }

  if (!isTextLike(file)) continue;
  const content = readFileContent(file);
  if (content == null) continue;

  for (const { name, pattern, allowExample } of secretPatterns) {
    const matches = Array.from(content.matchAll(pattern));
    const suspicious = matches.some((match) => !allowExample?.(match[0]));
    if (suspicious) {
      failures.push(`possible ${name} found in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Secret guard blocked this change:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("");
  console.error("Move secrets to local .env files, keep placeholders in .env.example, and rotate any real key that was exposed.");
  process.exit(1);
}

console.log(`Secret guard passed (${mode}).`);
