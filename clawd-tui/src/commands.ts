import type { AgentConfig } from './config.js';
import type { Session } from './session.js';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const ORANGE = '\x1b[38;5;215m';
const GRAY = '\x1b[90m';

export interface CommandContext {
  config: AgentConfig;
  session: Session;
  newSession: () => Session;
}

export interface CommandResult {
  handled: boolean;
  exit?: boolean;
}

interface Command {
  name: string;
  description: string;
  run(ctx: CommandContext, args: string[]): CommandResult | Promise<CommandResult>;
}

const COMMANDS: Command[] = [
  {
    name: '/help',
    description: 'List available slash commands',
    run() {
      console.log(`\n  ${BOLD}Commands${RESET}`);
      for (const cmd of COMMANDS) {
        console.log(`  ${ORANGE}${cmd.name.padEnd(12)}${RESET}${DIM}${cmd.description}${RESET}`);
      }
      console.log(`  ${ORANGE}${'exit'.padEnd(12)}${RESET}${DIM}Quit Clawd${RESET}\n`);
      return { handled: true };
    },
  },
  {
    name: '/model',
    description: 'Switch the active OpenRouter model (usage: /model <id>)',
    run(ctx, args) {
      if (args.length === 0) {
        console.log(`\n  ${DIM}current model:${RESET} ${ORANGE}${ctx.config.model}${RESET}`);
        console.log(`  ${DIM}usage: /model <id>  (e.g. anthropic/claude-opus-4.7)${RESET}\n`);
      } else {
        ctx.config.model = args[0];
        console.log(`\n  ${DIM}switched to${RESET} ${ORANGE}${ctx.config.model}${RESET}\n`);
      }
      return { handled: true };
    },
  },
  {
    name: '/new',
    description: 'Start a fresh conversation (clears history)',
    run(ctx) {
      ctx.newSession();
      console.log(`\n  ${DIM}started a new session${RESET}\n`);
      return { handled: true };
    },
  },
  {
    name: '/session',
    description: 'Show session id, message count, and token usage',
    run(ctx) {
      const usage = ctx.session.getUsage();
      const messages = ctx.session.getMessages().length;
      console.log(`\n  ${BOLD}Session${RESET}`);
      console.log(`  ${DIM}id       ${RESET}${GRAY}${ctx.session.id}${RESET}`);
      console.log(`  ${DIM}file     ${RESET}${GRAY}${ctx.session.path}${RESET}`);
      console.log(`  ${DIM}messages ${RESET}${messages}`);
      console.log(`  ${DIM}tokens   ${RESET}${usage.input} in · ${usage.output} out\n`);
      return { handled: true };
    },
  },
];

export async function handleCommand(
  input: string,
  ctx: CommandContext,
): Promise<CommandResult> {
  if (!input.startsWith('/')) return { handled: false };
  const [name, ...args] = input.split(/\s+/);
  const cmd = COMMANDS.find((c) => c.name === name);
  if (!cmd) {
    console.log(`\n  ${DIM}unknown command: ${name}. Try /help.${RESET}\n`);
    return { handled: true };
  }
  return cmd.run(ctx, args);
}

export function listCommands(): readonly { name: string; description: string }[] {
  return COMMANDS.map(({ name, description }) => ({ name, description }));
}
