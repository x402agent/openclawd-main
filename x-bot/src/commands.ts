/**
 * Slash-command parser for tweets directed at @clawddevs.
 *
 * Recognised commands (case-insensitive, anywhere in the tweet body):
 *   /imagine <prompt>   → image via OpenAI gpt-image-1.5
 *   /art <prompt>       → image via FAL art model (faster, looser)
 *   /video <prompt>     → short video via FAL kling image-to-video
 *   /x <question>       → text reply authored by xAI Grok (web/x-search grounded)
 *
 * We strip the leading @mention so "@clawddevs /imagine cat" works.
 */

export type CommandKind = 'imagine' | 'art' | 'video' | 'x';

export interface ParsedCommand {
    kind: CommandKind;
    prompt: string;
}

const PATTERNS: Array<{ kind: CommandKind; re: RegExp }> = [
    { kind: 'imagine', re: /(?:^|\s)\/imagine\s+(.+)$/is },
    { kind: 'art', re: /(?:^|\s)\/art\s+(.+)$/is },
    { kind: 'video', re: /(?:^|\s)\/video\s+(.+)$/is },
    { kind: 'x', re: /(?:^|\s)\/x\s+(.+)$/is },
];

function stripMentions(text: string): string {
    return text.replace(/^(?:@\w+\s+)+/g, '').trim();
}

export function parseCommand(text: string): ParsedCommand | null {
    const cleaned = stripMentions(text);
    for (const { kind, re } of PATTERNS) {
        const m = cleaned.match(re);
        if (!m) continue;
        const prompt = m[1]?.trim();
        if (!prompt || prompt.length < 2) continue;
        return { kind, prompt: prompt.slice(0, 800) };
    }
    return null;
}
