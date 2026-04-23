#!/usr/bin/env node

/**
 * ╔═══════════════════════════════════════════════╗
 *   🦞  MAWD CLI  —  Lobster-Powered Agentic Terminal
 * ╚═══════════════════════════════════════════════╝
 */

import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import spinners from 'unicode-animations';
import readline from 'readline';
import { PrivyWalletService } from './services/privy.mjs';
import { HeliusService, BirdeyeService, TOKENS } from './services/solana.mjs';

// ─── Load .env (cwd → ~/.mawd/.env → fallback) ──────────────
const envPaths = [
    join(process.cwd(), '.env'),
    join(homedir(), '.mawd', '.env'),
];
for (const p of envPaths) {
    if (existsSync(p)) { loadEnv({ path: p }); break; }
}

// ─── Initialize Services ─────────────────────────────────────
const privy = new PrivyWalletService({
    appId: process.env.PRIVY_APP_ID,
    appSecret: process.env.PRIVY_APP_SECRET,
    authKeyId: process.env.PRIVY_AUTH_KEY_ID,
    privateKey: process.env.PRIVY_PRIVATE_KEY,
});

const helius = new HeliusService({
    apiKey: process.env.HELIUS_API_KEY,
    rpcUrl: process.env.HELIUS_RPC_URL,
    wssUrl: process.env.HELIUS_WSS_URL,
});

const birdeye = new BirdeyeService({
    apiKey: process.env.BIRDEYE_API_KEY,
});

// Global state
let agentWallet = null;

// ─── ANSI Color Helpers ───────────────────────────────────────
const E = '\x1b[';
const R = `${E}0m`, B = `${E}1m`, D = `${E}2m`;
const red = `${E}38;5;196m`, coral = `${E}38;5;209m`, salmon = `${E}38;5;210m`;
const crimson = `${E}38;5;160m`, rust = `${E}38;5;166m`;
const amber = `${E}38;5;214m`, gold = `${E}38;5;220m`;
const white = `${E}38;5;255m`, gray = `${E}38;5;240m`, darkGray = `${E}38;5;236m`;
const sea = `${E}38;5;38m`, deepSea = `${E}38;5;24m`, teal = `${E}38;5;30m`;
const green = `${E}38;5;82m`, yellow = `${E}38;5;226m`;
const bgDark = `${E}48;5;233m`;

// ─── Utility ──────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clearScreen = () => process.stdout.write(`${E}2J${E}H`);
const hideCursor = () => process.stdout.write(`${E}?25l`);
const showCursor = () => process.stdout.write(`${E}?25h`);
const moveTo = (row, col) => process.stdout.write(`${E}${row};${col}H`);
const cols = process.stdout.columns || 80;
const rows = process.stdout.rows || 24;
const centerText = (text, width = cols) => {
    const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
    const pad = Math.max(0, Math.floor((width - stripped.length) / 2));
    return ' '.repeat(pad) + text;
};
const shortAddr = (a) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : 'none';

// ─── Lobster Art ──────────────────────────────────────────────
const lobsterFinal = [
    `${salmon}⠀⠀⠀⠈⠉⠉⠉⠉⠑⠒⠒⠀⠀⠀⠀⠒⠒⠑⠉⠉⠉⠉⠁⠀⠀⠀`,
    `${coral}⠀⠀⠀⠀⠀⣤⣤⡀⠀⠀⠀⠑⢆⡰⠊⠀⠀⠀⢀⣤⣤⠀⠀⠀⠀⠀`,
    `${crimson}⠀⠀⠀⠀⠘⠿⠿⠃⣠⣤⣤⣤⣼⣧⣤⣤⣤⣄⠘⠿⠿⠃⠀⠀⠀⠀`,
    `${red}⠀⠀⠀⠀⠀⠀⠀⠘⠛⠛⠛⣁⣼⣧⣁⠛⠛⠛⠃⠀⠀⠀⠀⠀⠀⠀`,
    `${red}⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
    `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠋⠙⠻⠟⠋⠙⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀`,
    `${rust}⠀⠀⠀⠀⠀⠀⠀⠐⠉⠀⠀⠀⠀⠀⠀⠀⠀⠉⠂⠀⠀⠀⠀⠀⠀⠀`,
];

const lobsterFrames = [
    [`${crimson}⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`],
    [`${coral}⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠁⠈⠀⠀⠀⠀⠀⠀⠀`, `${coral}⠀⠀⠀⠀⠀⠀⠀⠀⠈⠂⠀⠀⠀⠀⠀⠀⠂⠁⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`],
    [`${salmon}⠀⠀⠀⠀⠀⠀⠈⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠁⠉⠁⠀⠀⠀⠀⠀⠀`, `${coral}⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⠀⠀⠀⠀⠀⠀⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⠄⠀⠀⠠⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`, `${crimson}⠀⠀⠀⠀⠀⠀⠠⠤⠤⠤⠤⠼⠀⠀⠧⠤⠤⠤⠤⠄⠀⠀⠀⠀⠀⠀`, `${red}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`, `${red}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`],
    lobsterFinal,
];

const mawdLogo = [
    `${B}${red}███╗${coral}███╗${salmon} █████╗${amber} ██╗    ██╗${gold}██████╗ ${R}`,
    `${B}${red}████╗${coral}████║${salmon}██╔══██╗${amber}██║    ██║${gold}██╔══██╗${R}`,
    `${B}${red}██╔████╔${coral}██║${salmon}███████║${amber}██║ █╗ ██║${gold}██║  ██║${R}`,
    `${B}${red}██║╚██╔╝${coral}██║${salmon}██╔══██║${amber}██║███╗██║${gold}██║  ██║${R}`,
    `${B}${red}██║ ╚═╝ ${coral}██║${salmon}██║  ██║${amber}╚███╔███╔╝${gold}██████╔╝${R}`,
    `${B}${red}╚═╝     ${coral}╚═╝${salmon}╚═╝  ╚═╝${amber} ╚══╝╚══╝ ${gold}╚═════╝ ${R}`,
];

const waveFrames = [
    `${deepSea}~${sea}~${teal}~${sea}≈${deepSea}~${sea}~${teal}≈${sea}~${deepSea}~${sea}~${teal}~${sea}≈${deepSea}~${sea}~${teal}≈${sea}~${deepSea}~${sea}~${teal}~${sea}≈${deepSea}~${sea}~${teal}≈${sea}~${R}`,
    `${sea}≈${deepSea}~${sea}~${teal}~${sea}~${deepSea}≈${sea}~${teal}~${deepSea}≈${sea}~${sea}~${teal}~${sea}~${deepSea}≈${sea}~${teal}~${deepSea}≈${sea}~${sea}~${teal}~${sea}~${deepSea}≈${sea}~${R}`,
    `${teal}~${sea}≈${deepSea}~${sea}~${teal}~${sea}~${deepSea}≈${sea}~${teal}~${sea}≈${deepSea}~${sea}~${teal}~${sea}~${deepSea}≈${sea}~${teal}~${sea}≈${deepSea}~${sea}~${teal}~${sea}~${deepSea}≈${R}`,
];

// ─── Animation Phases ─────────────────────────────────────────
async function phaseParticleConverge() {
    const startRow = 3;
    for (let f = 0; f < lobsterFrames.length; f++) {
        const frame = lobsterFrames[f];
        for (let i = 0; i < frame.length; i++) {
            moveTo(startRow + i, 1);
            process.stdout.write(centerText(frame[i]));
        }
        if (frame.length < 7) {
            for (let i = frame.length; i < 7; i++) {
                moveTo(startRow + i, 1); process.stdout.write(' '.repeat(cols));
            }
        }
        await sleep(f < 2 ? 120 : 180);
    }
}

async function phaseWaterWave() {
    const waveRow = 11;
    for (let f = 0; f < 6; f++) {
        moveTo(waveRow, 1);
        process.stdout.write(centerText(waveFrames[f % waveFrames.length]));
        await sleep(200);
    }
}

async function phaseLogoReveal() {
    const logoStartRow = 12;
    for (let i = 0; i < mawdLogo.length; i++) {
        moveTo(logoStartRow + i, 1);
        process.stdout.write(centerText(mawdLogo[i]));
        await sleep(60);
    }
    await sleep(200);
    moveTo(logoStartRow + mawdLogo.length + 1, 1);
    process.stdout.write(centerText(`${D}${sea}🦞 lobster-powered agentic terminal${R}`));
    await sleep(150);
    moveTo(logoStartRow + mawdLogo.length + 2, 1);
    process.stdout.write(centerText(`${D}${gray}v1.1.0 — solana predictions CLI${R}`));
}

async function runSpinner(row, label, spinnerName, duration) {
    const { frames, interval } = spinners[spinnerName];
    let i = 0;
    const timer = setInterval(() => {
        moveTo(row, 1);
        process.stdout.write(`\x1b[2K`);
        process.stdout.write(centerText(`  ${coral}${frames[i++ % frames.length]}${R} ${D}${white}${label}...${R}`));
    }, interval);
    await sleep(duration);
    clearInterval(timer);
    moveTo(row, 1);
    process.stdout.write(`\x1b[2K`);
    process.stdout.write(centerText(`  ${B}${sea}✔${R} ${white}${label}${R}`));
    await sleep(80);
}

async function phaseBootSequence() {
    const bootRow = 22;
    const steps = [
        ['Initializing lobster core', 'braille', 500],
        ['Loading .env configuration', 'scan', 400],
        ['Connecting to Helius RPC', 'helix', 600],
        ['Querying Birdeye token data', 'cascade', 400],
    ];

    for (const [label, spinner, dur] of steps) {
        await runSpinner(bootRow, label, spinner, dur);
    }

    // Phase: Privy wallet init (real call)
    if (privy.isConfigured) {
        const { frames, interval } = spinners.dna;
        let i = 0;
        const timer = setInterval(() => {
            moveTo(bootRow, 1);
            process.stdout.write(`\x1b[2K`);
            process.stdout.write(centerText(`  ${coral}${frames[i++ % frames.length]}${R} ${D}${white}Provisioning Privy agentic wallet...${R}`));
        }, interval);

        try {
            agentWallet = await privy.getOrCreateWallet('solana');
            clearInterval(timer);
            moveTo(bootRow, 1);
            process.stdout.write(`\x1b[2K`);
            process.stdout.write(centerText(`  ${B}${green}✔${R} ${white}Wallet: ${sea}${shortAddr(agentWallet.address)}${R}`));
        } catch (err) {
            clearInterval(timer);
            moveTo(bootRow, 1);
            process.stdout.write(`\x1b[2K`);
            process.stdout.write(centerText(`  ${B}${yellow}⚠${R} ${gray}Wallet: ${err.message.slice(0, 50)}${R}`));
        }
        await sleep(200);
    } else {
        await runSpinner(bootRow, 'Privy not configured (run /setup)', 'orbit', 300);
    }

    await runSpinner(bootRow, 'Warming up the lobster pot', 'orbit', 300);
}

// ─── REPL Commands ────────────────────────────────────────────
function handleCommand(cmd, rl) {
    const args = cmd.trim().split(/\s+/);
    const c = args[0].toLowerCase();

    if (c === '/quit' || c === '/exit' || c === 'exit' || c === 'quit') {
        console.log(`\n${D}${sea}  🦞 See you in the deep...${R}\n`);
        showCursor(); process.exit(0);
    }

    if (c === '/help') {
        console.log(`
  ${B}${coral}MAWD CLI Commands${R}
  ${'─'.repeat(50)}
  ${B}${white}Agentic Wallet${R}
  ${white}/wallet${gray}             ${D}Show wallet address & balance${R}
  ${white}/wallet create${gray}      ${D}Create new Privy server wallet${R}
  ${white}/balance${gray}            ${D}Check SOL balance${R}
  ${white}/send${gray} <to> <amt>    ${D}Send SOL to address${R}

  ${B}${white}Market Data${R}
  ${white}/price${gray} <token>      ${D}Get live token price (Birdeye)${R}
  ${white}/search${gray} <query>     ${D}Search tokens${R}
  ${white}/trending${gray}           ${D}Trending tokens on Solana${R}

  ${B}${white}System${R}
  ${white}/status${gray}             ${D}Network, wallet & service status${R}
  ${white}/setup${gray}              ${D}Show .env setup instructions${R}
  ${white}/config${gray}             ${D}Show current configuration${R}
  ${white}/quit${gray}               ${D}Exit mawd${R}
`);
        return;
    }

    if (c === '/wallet') {
        if (args[1] === 'create') {
            if (!privy.isConfigured) {
                console.log(`  ${yellow}⚠${R} ${gray}Privy not configured. Run ${white}/setup${R}`);
                return;
            }
            console.log(`  ${coral}⏳${R} Creating Privy server wallet...`);
            privy.createWallet('solana').then(w => {
                agentWallet = w;
                console.log(`  ${green}✔${R} Wallet created: ${sea}${w.address}${R}`);
                console.log(`  ${gray}ID: ${w.id}${R}`);
                rl.prompt();
            }).catch(e => {
                console.log(`  ${red}✘${R} ${e.message}`);
                rl.prompt();
            });
            return 'async';
        }
        const status = privy.getStatus();
        console.log(`
  ${B}${coral}🦞 Agent Wallet${R}
  ${'─'.repeat(40)}
  ${white}Status:${R}    ${status.configured ? `${green}◉ Configured${R}` : `${yellow}○ Not configured${R}`}
  ${white}Address:${R}   ${status.address ? `${sea}${status.address}${R}` : `${gray}none${R}`}
  ${white}Wallet ID:${R} ${status.walletId ? `${gray}${status.walletId}${R}` : `${gray}none${R}`}
  ${white}Policies:${R}  ${status.policies}
`);
        return;
    }

    if (c === '/balance') {
        const addr = agentWallet?.address || args[1];
        if (!addr) { console.log(`  ${yellow}⚠${R} No wallet. Run ${white}/wallet create${R}`); return; }
        if (!helius.isConfigured) { console.log(`  ${yellow}⚠${R} Helius not configured. Run ${white}/setup${R}`); return; }
        console.log(`  ${coral}⏳${R} Fetching balance...`);
        helius.getBalance(addr).then(bal => {
            console.log(`  ${green}◉${R} ${white}${bal.toFixed(4)} SOL${R}  ${gray}(${addr})${R}`);
            rl.prompt();
        }).catch(e => {
            console.log(`  ${red}✘${R} ${e.message}`);
            rl.prompt();
        });
        return 'async';
    }

    if (c === '/price') {
        const token = (args[1] || 'SOL').toUpperCase();
        const addr = TOKENS[token] || args[1];
        if (!birdeye.isConfigured) { console.log(`  ${yellow}⚠${R} Birdeye not configured. Run ${white}/setup${R}`); return; }
        console.log(`  ${coral}⏳${R} Fetching ${token} price...`);
        birdeye.getTokenPrice(addr).then(data => {
            if (!data) { console.log(`  ${red}✘${R} Token not found`); rl.prompt(); return; }
            console.log(`\n  ${B}${coral}🦞 ${white}${token}${R}`);
            console.log(`  ${gray}${'─'.repeat(35)}${R}`);
            console.log(`  ${white}Price:${R}     ${sea}$${data.value?.toFixed(6) || '?'}${R}`);
            if (data.updateUnixTime) console.log(`  ${white}Updated:${R}   ${gray}${new Date(data.updateUnixTime * 1000).toLocaleTimeString()}${R}`);
            console.log('');
            rl.prompt();
        }).catch(e => {
            console.log(`  ${red}✘${R} ${e.message}`);
            rl.prompt();
        });
        return 'async';
    }

    if (c === '/search') {
        const query = args.slice(1).join(' ');
        if (!query) { console.log(`  ${gray}Usage: /search <token name>${R}`); return; }
        if (!birdeye.isConfigured) { console.log(`  ${yellow}⚠${R} Birdeye not configured${R}`); return; }
        console.log(`  ${coral}⏳${R} Searching "${query}"...`);
        birdeye.searchToken(query).then(items => {
            if (!items.length) { console.log(`  ${gray}No results${R}`); rl.prompt(); return; }
            console.log(`\n  ${B}${coral}Search Results${R}`);
            console.log(`  ${gray}${'─'.repeat(50)}${R}`);
            for (const t of items.slice(0, 5)) {
                const sym = t.symbol || '?';
                const name = t.name || '';
                const addr = t.address ? shortAddr(t.address) : '';
                console.log(`  ${white}${sym}${R} ${gray}${name}${R}  ${D}${sea}${addr}${R}`);
            }
            console.log('');
            rl.prompt();
        }).catch(e => {
            console.log(`  ${red}✘${R} ${e.message}`);
            rl.prompt();
        });
        return 'async';
    }

    if (c === '/trending') {
        if (!birdeye.isConfigured) { console.log(`  ${yellow}⚠${R} Birdeye not configured${R}`); return; }
        console.log(`  ${coral}⏳${R} Fetching trending...`);
        birdeye.getTrending().then(tokens => {
            console.log(`\n  ${B}${coral}🔥 Trending on Solana${R}`);
            console.log(`  ${gray}${'─'.repeat(50)}${R}`);
            for (const t of tokens.slice(0, 10)) {
                console.log(`  ${white}${t.symbol || '?'}${R}  ${sea}$${t.price?.toFixed(4) || '?'}${R}  ${gray}${t.name || ''}${R}`);
            }
            console.log('');
            rl.prompt();
        }).catch(e => {
            console.log(`  ${red}✘${R} ${e.message}`);
            rl.prompt();
        });
        return 'async';
    }

    if (c === '/send') {
        const to = args[1], amt = parseFloat(args[2]);
        if (!to || isNaN(amt)) { console.log(`  ${gray}Usage: /send <address> <amount>${R}`); return; }
        if (!privy.isConfigured || !agentWallet) { console.log(`  ${yellow}⚠${R} No wallet. Run ${white}/wallet create${R}`); return; }
        console.log(`  ${coral}⏳${R} Sending ${amt} SOL to ${shortAddr(to)}...`);
        privy.sendTransaction(agentWallet.id, { to, value: amt * 1e9 }).then(res => {
            console.log(`  ${green}✔${R} TX sent: ${sea}${res.hash || JSON.stringify(res).slice(0, 60)}${R}`);
            rl.prompt();
        }).catch(e => {
            console.log(`  ${red}✘${R} ${e.message}`);
            rl.prompt();
        });
        return 'async';
    }

    if (c === '/status') {
        console.log(`
  ${B}${sea}System Status${R}
  ${gray}${'─'.repeat(45)}${R}
  ${white}Privy:${R}     ${privy.isConfigured ? `${green}◉${R} Connected` : `${yellow}○${R} Not configured`}${agentWallet ? `  ${sea}${shortAddr(agentWallet.address)}${R}` : ''}
  ${white}Helius:${R}    ${helius.isConfigured ? `${green}◉${R} Connected` : `${yellow}○${R} Not configured`}
  ${white}Birdeye:${R}   ${birdeye.isConfigured ? `${green}◉${R} Connected` : `${yellow}○${R} Not configured`}
  ${white}Engine:${R}    ${coral}🦞${R} Lobster Core v1.1
  ${white}Runtime:${R}   Node ${process.version}
`);
        if (helius.isConfigured) {
            helius.getHealth().then(h => {
                console.log(`  ${white}Solana:${R}    ${h.healthy ? `${green}◉${R} Healthy (slot ${h.slot})` : `${red}✘${R} Unhealthy`}`);
                rl.prompt();
            }).catch(() => rl.prompt());
            return 'async';
        }
        return;
    }

    if (c === '/config') {
        const mask = (v) => v ? `${green}✔ set${R}` : `${yellow}○ missing${R}`;
        console.log(`
  ${B}${coral}Configuration${R}
  ${gray}${'─'.repeat(45)}${R}
  ${white}PRIVY_APP_ID${R}       ${mask(process.env.PRIVY_APP_ID)}
  ${white}PRIVY_APP_SECRET${R}   ${mask(process.env.PRIVY_APP_SECRET)}
  ${white}PRIVY_AUTH_KEY_ID${R}  ${mask(process.env.PRIVY_AUTH_KEY_ID)}
  ${white}PRIVY_PRIVATE_KEY${R}  ${mask(process.env.PRIVY_PRIVATE_KEY)}
  ${white}HELIUS_API_KEY${R}     ${mask(process.env.HELIUS_API_KEY)}
  ${white}HELIUS_RPC_URL${R}     ${mask(process.env.HELIUS_RPC_URL)}
  ${white}BIRDEYE_API_KEY${R}    ${mask(process.env.BIRDEYE_API_KEY)}
  ${gray}${'─'.repeat(45)}${R}
  ${D}${gray}Loaded from: .env or ~/.mawd/.env${R}
`);
        return;
    }

    if (c === '/setup') {
        console.log(`
  ${B}${coral}🦞 MAWD Setup${R}
  ${'─'.repeat(50)}

  ${white}1.${R} Create ${sea}~/.mawd/.env${R} with your credentials:

     ${gray}# Privy Agentic Wallet${R}
     ${white}PRIVY_APP_ID${R}=${D}your-app-id${R}
     ${white}PRIVY_APP_SECRET${R}=${D}your-app-secret${R}

     ${gray}# Helius (Solana RPC)${R}
     ${white}HELIUS_API_KEY${R}=${D}your-key${R}
     ${white}HELIUS_RPC_URL${R}=${D}https://mainnet.helius-rpc.com/?api-key=YOUR_KEY${R}

     ${gray}# Birdeye (Token Data)${R}
     ${white}BIRDEYE_API_KEY${R}=${D}your-key${R}

  ${white}2.${R} Restart mawd:  ${sea}mawd${R}
  ${white}3.${R} Create wallet: ${sea}/wallet create${R}

  ${D}${gray}Get keys: dashboard.privy.io • helius.dev • birdeye.so${R}
`);
        return;
    }

    if (c !== '') {
        console.log(`  ${D}${gray}Unknown command. Type ${white}/help${gray} for available commands.${R}`);
    }
}

// ─── REPL ─────────────────────────────────────────────────────
function startRepl() {
    showCursor();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `${B}${coral}🦞 mawd${R}${gray} ❯ ${R}`,
    });

    rl.prompt();

    rl.on('line', (input) => {
        const result = handleCommand(input, rl);
        if (result !== 'async') rl.prompt();
    });

    rl.on('close', () => {
        console.log(`\n${D}${sea}  🦞 See you in the deep...${R}\n`);
        showCursor(); process.exit(0);
    });
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
    process.on('SIGINT', () => {
        showCursor();
        console.log(`\n${D}${sea}  🦞 See you in the deep...${R}\n`);
        process.exit(0);
    });

    hideCursor();
    clearScreen();

    moveTo(1, 1);
    const hl = `${bgDark}${B}${coral} 🦞 MAWD ${R}${bgDark}${D}${gray} Agentic Terminal ${R}`;
    const hr = `${bgDark}${D}${gray} v1.1.0 ${R}`;
    process.stdout.write(hl + ' '.repeat(Math.max(0, cols - 35)) + hr);

    moveTo(2, 1);
    process.stdout.write(`${darkGray}${'━'.repeat(cols)}${R}`);

    await phaseParticleConverge();
    await phaseWaterWave();
    await phaseLogoReveal();
    await phaseBootSequence();

    // Ready line
    const readyRow = 24;
    moveTo(readyRow, 1);
    process.stdout.write(`\x1b[2K`);
    const walletInfo = agentWallet ? `  ${sea}wallet: ${shortAddr(agentWallet.address)}${R}` : '';
    process.stdout.write(centerText(`${B}${coral}🦞 mawd${R} ${D}${gray}ready${R}${walletInfo} ${D}${gray}— type ${white}/help${R}`));

    await sleep(400);
    moveTo(readyRow + 2, 1);
    startRepl();
}

main().catch(err => {
    showCursor();
    console.error('Fatal error:', err);
    process.exit(1);
});
