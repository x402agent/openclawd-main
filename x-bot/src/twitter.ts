import { TwitterApi, type TweetV2, type UserV2 } from 'twitter-api-v2';
import { config } from './config.js';

const client = new TwitterApi({
    appKey: config.twitter.appKey,
    appSecret: config.twitter.appSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
});

export const rw = client.readWrite;
export const v2 = rw.v2;
export const v1 = rw.v1;

let _me: UserV2 | null = null;

export async function me(): Promise<UserV2> {
    if (_me) return _me;
    const res = await v2.me({ 'user.fields': ['id', 'username', 'name'] });
    _me = res.data;
    return _me;
}

export async function postTweet(text: string, opts: { replyToId?: string; mediaIds?: string[] } = {}): Promise<string> {
    const payload: Parameters<typeof v2.tweet>[0] = { text };
    if (opts.replyToId) {
        payload.reply = { in_reply_to_tweet_id: opts.replyToId };
    }
    if (opts.mediaIds && opts.mediaIds.length > 0) {
        // twitter-api-v2 types expect a tuple of up to 4
        payload.media = { media_ids: opts.mediaIds.slice(0, 4) as [string] };
    }
    const res = await v2.tweet(payload);
    return res.data.id;
}

/** Upload an image buffer as media. Returns media_id_string for use in tweets. */
export async function uploadMedia(buf: Buffer, mime: 'image/png' | 'image/jpeg' = 'image/png'): Promise<string> {
    return await v1.uploadMedia(buf, { mimeType: mime });
}

/**
 * Upload a video buffer via chunked upload (required by X for video/mp4).
 * twitter-api-v2 handles the INIT/APPEND/FINALIZE + STATUS polling when longVideo/mimeType is set.
 */
export async function uploadVideo(buf: Buffer, mime: 'video/mp4' = 'video/mp4'): Promise<string> {
    return await v1.uploadMedia(buf, { mimeType: mime, target: 'tweet', longVideo: true });
}

/** Fetch recent mentions newer than `sinceId`. Returns [] if none. */
export async function fetchMentions(sinceId: string | null): Promise<TweetV2[]> {
    const user = await me();
    const params: Parameters<typeof v2.userMentionTimeline>[1] = {
        max_results: 20,
        'tweet.fields': ['created_at', 'author_id', 'conversation_id', 'in_reply_to_user_id', 'referenced_tweets', 'text'],
        expansions: ['author_id'],
    };
    if (sinceId) params.since_id = sinceId;

    const page = await v2.userMentionTimeline(user.id, params);
    const tweets = page.data?.data ?? [];
    // Oldest first so we process in order
    return [...tweets].reverse();
}

export async function getAuthorUsername(authorId: string): Promise<string | null> {
    try {
        const res = await v2.user(authorId);
        return res.data?.username ?? null;
    } catch {
        return null;
    }
}
