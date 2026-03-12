import { readFileSync } from 'fs';
import { getConfig } from './config.js';
import { createLogger } from './logger.js';
import { GooglePatentsServer } from './server.js';
import { PatentService } from './services/patent.js';
import { SerpApiClient } from './services/serpapi.js';
import { createGetPatentTool, createSearchPatentsTool } from './tools/index.js';

interface ParsedArgs {
  command: string | null;
  flags: {
    help: boolean;
    version: boolean;
    json: boolean;
  };
}

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
) as { name: string; version: string };

export function parseArgs(argv: string[]): ParsedArgs {
  const flags = { help: false, version: false, json: false };
  let command: string | null = null;

  for (const arg of argv) {
    switch (arg) {
      case '--help':
      case '-h':
        flags.help = true;
        break;
      case '--version':
      case '-v':
        flags.version = true;
        break;
      case '--json':
        flags.json = true;
        break;
      default:
        if (!arg.startsWith('-') && command === null) {
          command = arg;
        }
    }
  }

  return { command, flags };
}

function printHelp(json: boolean): void {
  if (json) {
    process.stdout.write(
      JSON.stringify({
        commands: [{ name: 'serve', description: 'Start the MCP server on stdio' }],
        flags: [
          { name: '--help', aliases: ['-h'], description: 'Show this help message' },
          { name: '--version', aliases: ['-v'], description: 'Show version information' },
          { name: '--json', description: 'Output as JSON (use with --help or --version)' },
        ],
      }) + '\n'
    );
  } else {
    process.stderr.write(
      `Usage: google-patents-mcp <command> [flags]\n\nCommands:\n  serve    Start the MCP server on stdio\n\nFlags:\n  -h, --help      Show this help message\n  -v, --version   Show version information\n      --json      Output as JSON (use with --help or --version)\n`
    );
  }
}

function printVersion(json: boolean): void {
  if (json) {
    process.stdout.write(
      JSON.stringify({ name: packageJson.name, version: packageJson.version }) + '\n'
    );
  } else {
    process.stderr.write(`${packageJson.name}@${packageJson.version}\n`);
  }
}

function setupProcessHandlers(logger: ReturnType<typeof createLogger>): void {
  const flushLogs = () => {
    logger.debug('Flushing logs on process exit');
    try {
      logger.close();
    } catch {
      // Ignore errors during shutdown
    }
  };

  process.on('exit', flushLogs);

  process.on('SIGINT', () => {
    logger.info('Received SIGINT. Shutting down.');
    flushLogs();
    process.exit(0);
  });

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.message}`);
    if (err.stack) {
      logger.error(err.stack);
    }
    flushLogs();
    process.exit(1);
  });
}

async function startServer(): Promise<void> {
  const config = getConfig();
  const logger = createLogger(config.logLevel);

  logger.info('=== Google Patents Server started ===');
  logger.info('SERPAPI_API_KEY found.');

  setupProcessHandlers(logger);

  const serpApiClient = new SerpApiClient(config.serpApiKey, logger, 30000, config.serpApiBaseUrl);
  const patentService = new PatentService(serpApiClient, logger);

  const tools = [
    createSearchPatentsTool(serpApiClient, logger),
    createGetPatentTool(patentService, logger),
  ];

  const server = new GooglePatentsServer(packageJson.version, logger, tools);
  await server.run();
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
  const { command, flags } = parseArgs(argv);

  if (flags.help) {
    printHelp(flags.json);
    process.exit(0);
  }

  if (flags.version) {
    printVersion(flags.json);
    process.exit(0);
  }

  if (command === 'serve') {
    await startServer();
    return;
  }

  if (command === null) {
    printHelp(false);
    process.exit(1);
  }

  process.stderr.write(`Unknown command: ${command}\n\n`);
  printHelp(false);
  process.exit(1);
}
