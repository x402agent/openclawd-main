import { me, v1 } from './twitter.js';
import { logSafeConfig } from './config.js';

async function main() {
    logSafeConfig();

    // 1. Try v2 /users/me first (requires Basic+ tier OR Project attachment).
    try {
        const user = await me();
        console.log('[verify] v2 OK — @%s (id=%s, name=%s)', user.username, user.id, user.name);
        return;
    } catch (e) {
        console.warn('[verify] v2 /users/me failed: %s', (e as Error).message);
        console.warn('[verify] falling back to v1.1 verify_credentials (works on Free tier)...');
    }

    // 2. Fall back to v1.1 account/verify_credentials — available on Free tier.
    try {
        const user = await v1.verifyCredentials();
        console.log('[verify] v1.1 OK — @%s (id=%s, name=%s)', user.screen_name, user.id_str, user.name);
        console.log('[verify] NOTE: v2 /users/me is blocked on your tier. Mention polling uses v2 userMentionTimeline and will likely also 403.');
        console.log('[verify] For a full bot you need Basic tier ($100/mo) or your app attached to a Project.');
    } catch (e) {
        console.error('[verify] v1.1 also FAILED:', (e as Error).message);
        process.exit(1);
    }
}

main().catch(e => {
    console.error('[verify] FATAL:', e);
    process.exit(1);
});
