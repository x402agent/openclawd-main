#!/usr/bin/env node
/**
 * Patches the Nitro 3.0 Netlify function handler to buffer all responses.
 * Netlify Functions v2 can't properly serialize streaming ReadableStream bodies,
 * causing "invalid character '\x00'" errors.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const serverDir = resolve('.netlify/functions-internal/server')
const entryPath = resolve(serverDir, 'server.mjs')

if (!existsSync(entryPath)) {
  console.warn(`[patch] Skipped: ${entryPath} not found`)
  process.exit(0)
}

let src = readFileSync(entryPath, 'utf8')

const MARKER = '/* PATCHED_NETLIFY_BUFFERED */'

if (src.includes(MARKER)) {
  console.log('[patch] Already patched')
  process.exit(0)
}

const wrapperCode = `
${MARKER}
import handler from "./main.mjs";
const __bufferedHandler = async (req) => {
  const response = await handler(req);
  try {
    const body = await response.arrayBuffer();
    const headers = {};
    response.headers.forEach((v, k) => { headers[k] = v; });
    // Keep content-encoding if present, as the arrayBuffer preserves raw bytes
    return new Response(body, {
      status: response.status,
      statusText: response.statusText || 'OK',
      headers,
    });
  } catch (e) {
    return response;
  }
};
`

src = src.replace(
  'export { default } from "./main.mjs";',
  `${wrapperCode}\nexport { __bufferedHandler as default };`,
)

const patched = src.includes(MARKER)
writeFileSync(entryPath, src, 'utf8')
console.log(`[patch] ${patched ? 'Patched' : 'FAILED to patch'} handler → buffered response wrapper`)
