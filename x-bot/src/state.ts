import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { config } from './config.js';

export interface State {
    lastMentionId: string | null;
    lastAutoPostAt: number;
    repliedTo: string[]; // ring buffer of last N tweet IDs we've replied to
}

const DEFAULT: State = {
    lastMentionId: null,
    lastAutoPostAt: 0,
    repliedTo: [],
};

const RING_SIZE = 500;

let cached: State | null = null;

export async function loadState(): Promise<State> {
    if (cached) return cached;
    try {
        const raw = await readFile(config.stateFile, 'utf8');
        const parsed = JSON.parse(raw);
        cached = { ...DEFAULT, ...parsed };
        return cached!;
    } catch {
        cached = { ...DEFAULT };
        return cached;
    }
}

export async function saveState(s: State): Promise<void> {
    cached = s;
    await mkdir(dirname(config.stateFile), { recursive: true });
    await writeFile(config.stateFile, JSON.stringify(s, null, 2));
}

export function markReplied(s: State, id: string): void {
    if (s.repliedTo.includes(id)) return;
    s.repliedTo.push(id);
    if (s.repliedTo.length > RING_SIZE) {
        s.repliedTo.splice(0, s.repliedTo.length - RING_SIZE);
    }
}

export function hasReplied(s: State, id: string): boolean {
    return s.repliedTo.includes(id);
}
