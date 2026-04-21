import { config } from './config.js';
import { loadState, saveState, markReplied, hasReplied } from './state.js';
import { fetchMentions, getAuthorUsername, postTweet, uploadMedia, uploadVideo, me } from './twitter.js';
import { imagine } from './image.js';
import { generateArt, generateVideo, falAvailable } from './fal.js';
import { grokReply, grokAvailable } from './grok.js';
import { parseCommand, type ParsedCommand } from './commands.js';
import { generateReply, generateAutoPost, generateImagineCaption } from './agent.js';

// Use util.format so %d / %s format specifiers work even with the [x-bot] prefix.
// (console.log('prefix', 'text %d', n) does NOT interpolate — the format string must be the first arg.)
import { format as fmt } from 'node:util';
const log = (...args: unknown[]) => console.log('[x-bot] ' + fmt(...(args as [string, ...unknown[]])));

async function handleCommand(cmd: ParsedCommand, tweet: { id: string; text: string }, authorHandle: string | null): Promise<boolean> {
    try {
        if (cmd.kind === 'imagine') {
            if (!config.loop.imagineEnabled) return false;
            log('/imagine from @%s: %s', authorHandle, cmd.prompt.slice(0, 80));
            const img = await imagine(cmd.prompt);
            const mediaId = await uploadMedia(img.buffer, 'image/png');
            const caption = await generateImagineCaption(cmd.prompt, authorHandle);
            const replyId = await postTweet(caption, { replyToId: tweet.id, mediaIds: [mediaId] });
            log('posted /imagine reply %s', replyId);
            return true;
        }

        if (cmd.kind === 'art') {
            if (!config.loop.artEnabled) return false;
            if (!falAvailable()) {
                log('/art requested but FAL_API_KEY missing');
                return false;
            }
            log('/art from @%s: %s', authorHandle, cmd.prompt.slice(0, 80));
            const art = await generateArt(cmd.prompt);
            const mediaId = await uploadMedia(art.buffer, 'image/png');
            const caption = await generateImagineCaption(cmd.prompt, authorHandle);
            const replyId = await postTweet(caption, { replyToId: tweet.id, mediaIds: [mediaId] });
            log('posted /art reply %s', replyId);
            return true;
        }

        if (cmd.kind === 'video') {
            if (!config.loop.videoEnabled) return false;
            if (!falAvailable()) {
                log('/video requested but FAL_API_KEY missing');
                return false;
            }
            log('/video from @%s: %s', authorHandle, cmd.prompt.slice(0, 80));
            const vid = await generateVideo(cmd.prompt);
            const mediaId = await uploadVideo(vid.buffer, 'video/mp4');
            const caption = await generateImagineCaption(cmd.prompt, authorHandle);
            const replyId = await postTweet(caption, { replyToId: tweet.id, mediaIds: [mediaId] });
            log('posted /video reply %s', replyId);
            return true;
        }

        if (cmd.kind === 'x') {
            if (!config.loop.xCommandEnabled) return false;
            if (!grokAvailable()) {
                log('/x requested but XAI_API_KEY missing');
                return false;
            }
            log('/x from @%s: %s', authorHandle, cmd.prompt.slice(0, 80));
            const answer = await grokReply(cmd.prompt, authorHandle);
            if (!answer) {
                log('/x: Grok chose SKIP');
                return true; // still mark as handled
            }
            const replyId = await postTweet(answer, { replyToId: tweet.id });
            log('posted /x reply %s', replyId);
            return true;
        }
    } catch (err) {
        log('command %s failed:', cmd.kind, (err as Error).message);
    }
    return false;
}

async function handleMention(tweet: { id: string; text: string; author_id?: string }): Promise<void> {
    const state = await loadState();
    if (hasReplied(state, tweet.id)) return;

    const authorHandle = tweet.author_id ? await getAuthorUsername(tweet.author_id) : null;

    // Skip self-mentions
    const self = await me();
    if (authorHandle && authorHandle.toLowerCase() === self.username.toLowerCase()) return;

    const cmd = parseCommand(tweet.text);

    if (cmd) {
        await handleCommand(cmd, tweet, authorHandle);
        markReplied(state, tweet.id);
        await saveState(state);
        return;
    }

    if (!config.loop.replyEnabled) {
        markReplied(state, tweet.id);
        await saveState(state);
        return;
    }

    try {
        const reply = await generateReply({ authorHandle, tweetText: tweet.text });
        if (!reply) {
            log('skip reply to %s (model chose SKIP)', tweet.id);
        } else {
            const replyId = await postTweet(reply, { replyToId: tweet.id });
            log('replied %s -> %s', tweet.id, replyId);
        }
    } catch (err) {
        log('reply failed for %s:', tweet.id, (err as Error).message);
    }
    markReplied(state, tweet.id);
    await saveState(state);
}

async function pollMentions(): Promise<void> {
    const state = await loadState();
    let mentions;
    try {
        mentions = await fetchMentions(state.lastMentionId);
    } catch (err) {
        log('fetchMentions error:', (err as Error).message);
        return;
    }

    if (mentions.length === 0) return;
    log('received %d new mentions', mentions.length);

    const budget = Math.min(mentions.length, config.loop.maxRepliesPerPoll);
    for (let i = 0; i < budget; i++) {
        const m = mentions[i];
        await handleMention({ id: m.id, text: m.text, author_id: m.author_id });
    }

    const newest = mentions[mentions.length - 1];
    const fresh = await loadState();
    fresh.lastMentionId = newest.id;
    await saveState(fresh);
}

// Backoff for repeated auto-post failures so a bad key doesn't hammer the APIs.
const AUTOPOST_FAIL_BACKOFF_MS = 5 * 60 * 1000; // 5m
let lastAutoPostFailAt = 0;

async function maybeAutoPost(): Promise<void> {
    if (!config.loop.autoPostEnabled) return;
    const state = await loadState();
    const now = Date.now();

    // Regular cadence gate — only counts SUCCESSFUL posts toward the cooldown.
    if (state.lastAutoPostAt > 0 && now - state.lastAutoPostAt < config.loop.autoPostMs) return;

    // If we recently failed, back off for a few minutes so we don't spam a broken provider.
    if (lastAutoPostFailAt > 0 && now - lastAutoPostFailAt < AUTOPOST_FAIL_BACKOFF_MS) return;

    let posted = false;
    let skipped = false;
    try {
        const text = await generateAutoPost();
        if (!text) {
            log('auto-post: model chose SKIP, staying silent');
            skipped = true;
        } else {
            const id = await postTweet(text);
            log('auto-posted %s: %s', id, text.slice(0, 80));
            posted = true;
        }
    } catch (err) {
        log('auto-post failed: %s', (err as Error).message);
        lastAutoPostFailAt = now;
        return; // don't burn the 2h cooldown on failure
    }

    // Only advance the persistent cooldown on a real event (sent or deliberate SKIP).
    if (posted || skipped) {
        const fresh = await loadState();
        fresh.lastAutoPostAt = now;
        await saveState(fresh);
        lastAutoPostFailAt = 0;
    }
}

export async function runLoop(): Promise<void> {
    log('loop started. mention poll=%dms, auto-post=%dms', config.loop.pollMs, config.loop.autoPostMs);
    log('commands: imagine=%s art=%s video=%s x=%s',
        config.loop.imagineEnabled, config.loop.artEnabled && falAvailable(),
        config.loop.videoEnabled && falAvailable(), config.loop.xCommandEnabled && grokAvailable());

    await pollMentions().catch(e => log('initial poll error:', (e as Error).message));
    await maybeAutoPost().catch(e => log('initial auto-post error:', (e as Error).message));

    setInterval(() => {
        pollMentions().catch(e => log('poll error:', (e as Error).message));
    }, config.loop.pollMs);

    setInterval(() => {
        maybeAutoPost().catch(e => log('auto-post error:', (e as Error).message));
    }, Math.max(config.loop.pollMs, 60_000));
}
