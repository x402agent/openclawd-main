import { logSafeConfig } from './config.js';
import { me } from './twitter.js';
import { runLoop } from './loop.js';
import { startHealthServer } from './health.js';
import { v1 } from './twitter.js';

async function main(): Promise<void> {
    logSafeConfig();

    const port = Number(process.env.PORT ?? 8080);
    startHealthServer(port);

    // v2 /users/me can 403 on Free tier or apps not in a Project.
    // Fall back to v1.1 verify_credentials — works on every tier that can post.
    try {
        const user = await me();
        console.log('[x-bot] authenticated (v2) as @%s (id=%s)', user.username, user.id);
    } catch (e) {
        console.warn('[x-bot] v2 /users/me failed (%s) — falling back to v1.1', (e as Error).message);
        const u = await v1.verifyCredentials();
        console.log('[x-bot] authenticated (v1.1) as @%s (id=%s)', u.screen_name, u.id_str);
    }

    await runLoop();
}

main().catch((err) => {
    console.error('[x-bot] fatal:', err);
    process.exit(1);
});
