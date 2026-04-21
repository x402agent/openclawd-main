import 'dotenv/config';

function must(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var: ${name}`);
    return v;
}

function num(name: string, fallback: number): number {
    const v = process.env[name];
    if (!v) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function bool(name: string, fallback: boolean): boolean {
    const v = process.env[name];
    if (v == null) return fallback;
    return /^(1|true|yes|on)$/i.test(v);
}

export const config = {
    twitter: {
        appKey: must('CONSUMER_API_KEY'),
        appSecret: must('CONSUMER_API_SECRET'),
        accessToken: must('CONSUMER_ACCESS_TOKEN'),
        accessSecret: must('CONSUMER_ACCESS_SECRET'),
        bearerToken: process.env.CONSUMER_BEARER_TOKEN ?? '',
        handle: (process.env.X_HANDLE ?? 'clawddevs').replace(/^@/, ''),
    },
    openai: {
        apiKey: must('OPENAI_API_KEY'),
        chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-5',
        imageModel: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1.5',
        imageQuality: (process.env.IMAGE_QUALITY ?? 'medium') as 'low' | 'medium' | 'high' | 'auto',
        imageSize: (process.env.IMAGE_SIZE ?? '1024x1024') as '1024x1024' | '1024x1536' | '1536x1024' | 'auto',
    },
    xai: {
        apiKey: process.env.XAI_API_KEY ?? '',
        baseURL: process.env.XAI_BASE_URL ?? 'https://api.x.ai/v1',
        model: process.env.XAI_MODEL ?? 'grok-4.20-reasoning',
    },
    fal: {
        apiKey: process.env.FAL_API_KEY ?? '',
        videoModel: process.env.FAL_VIDEO_MODEL ?? 'fal-ai/kling-video/v3/pro/image-to-video',
        artModel: process.env.FAL_ART_MODEL ?? 'fal-ai/flux/schnell',
    },
    clawd: {
        mint: process.env.CLAWD_MINT ?? '',
        ticker: process.env.CLAWD_TICKER ?? '$CLAWD',
    },
    loop: {
        pollMs: num('POLL_INTERVAL_MS', 60_000),
        autoPostMs: num('AUTO_POST_INTERVAL_MS', 2 * 60 * 60 * 1000),
        replyEnabled: bool('REPLY_ENABLED', true),
        autoPostEnabled: bool('AUTO_POST_ENABLED', true),
        imagineEnabled: bool('IMAGINE_ENABLED', true),
        artEnabled: bool('ART_ENABLED', true),
        videoEnabled: bool('VIDEO_ENABLED', true),
        xCommandEnabled: bool('X_COMMAND_ENABLED', true),
        maxRepliesPerPoll: num('MAX_REPLIES_PER_POLL', 5),
    },
    stateFile: process.env.STATE_FILE ?? './data/state.json',
};

export function logSafeConfig(): void {
    // eslint-disable-next-line no-console
    console.log('[x-bot] handle=@%s imageModel=%s chatModel=%s pollMs=%d autoPostMs=%d',
        config.twitter.handle,
        config.openai.imageModel,
        config.openai.chatModel,
        config.loop.pollMs,
        config.loop.autoPostMs,
    );
}
