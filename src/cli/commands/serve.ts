import { command } from 'cmd-ts';
import { readFileSync } from 'fs';
import { getConfig } from '../../config.js';
import { createLogger } from '../../logger.js';
import { PatentScopeServer } from '../../server.js';
import { PatentService } from '../../services/patent.js';
import { SerpApiClient } from '../../services/serpapi.js';
import { createGetPatentTool, createSearchPatentsTool } from '../../tools/index.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8')
) as { version: string };

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

export const serve = command({
  name: 'serve',
  description: 'Start the MCP server on stdio',
  args: {},
  handler: async () => {
    const config = getConfig();
    const logger = createLogger(config.logLevel);

    logger.info('=== PatentScope Server started ===');
    logger.info('SERPAPI_API_KEY found.');

    setupProcessHandlers(logger);

    const serpApiClient = new SerpApiClient(
      config.serpApiKey,
      logger,
      30000,
      config.serpApiBaseUrl
    );
    const patentService = new PatentService(serpApiClient, logger);

    const tools = [
      createSearchPatentsTool(serpApiClient, logger),
      createGetPatentTool(patentService, logger),
    ];

    const server = new PatentScopeServer(packageJson.version, logger, tools);
    await server.run();
  },
});
