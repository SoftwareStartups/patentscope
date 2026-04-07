import { defineCommand } from 'clerc';
import packageJson from '../../../package.json' with { type: 'json' };
import { getConfig } from '../../config.js';
import { createLogger } from '../../logger.js';
import { PatentScopeServer } from '../../server.js';
import { PatentService } from '../../services/patent.js';
import { SerpApiClient } from '../../services/serpapi.js';
import {
  createGetPatentTool,
  createSearchPatentsTool,
} from '../../tools/index.js';

export const serve = defineCommand(
  { name: 'serve', description: 'Start the MCP server on stdio' },
  async () => {
    const config = getConfig();
    const logger = createLogger(config.logLevel);

    logger.info('=== PatentScope Server started ===');
    logger.info('SERPAPI_API_KEY found.');

    process.on('SIGINT', () => {
      logger.info('Received SIGINT. Shutting down.');
      process.exit(0);
    });

    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught exception: ${err.message}`);
      if (err.stack) logger.error(err.stack);
      process.exit(1);
    });

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
  }
);
