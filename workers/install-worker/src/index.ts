/**
 * solanaclawd-install — Cloudflare Worker
 *
 * Serves the openclawd installer at https://solanaclawd.com/install.sh.
 * The install.sh body is embedded in this worker (see ./install-script.ts)
 * so it works even when the openclawd repo is private.
 *
 * Deploy:
 *   cd workers/install-worker && npm install && npx wrangler deploy
 */

import { INSTALL_SCRIPT } from "./install-script";

export interface Env {}

const CACHE_TTL_SECONDS = 300;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    if (url.pathname.endsWith("/healthz")) {
      return new Response("ok\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(INSTALL_SCRIPT, {
      status: 200,
      headers: {
        "content-type": "text/x-shellscript; charset=utf-8",
        "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
        "content-disposition": 'inline; filename="install.sh"',
        "x-robots-tag": "noindex",
      },
    });
  },
} satisfies ExportedHandler<Env>;
