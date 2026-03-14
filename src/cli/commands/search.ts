import { defineCommand } from 'clerc';
import { getConfig } from '../../config.js';
import { createLogger } from '../../logger.js';
import { SerpApiClient } from '../../services/serpapi.js';
import type { SearchPatentsArgs } from '../../types.js';
import { formatSearchResults } from '../format.js';

export const search = defineCommand(
  {
    name: 'search',
    description: 'Search Google Patents',
    parameters: ['[query]'] as const,
    flags: {
      page: { type: Number, description: 'Page number', short: 'p' },
      num: { type: Number, description: 'Number of results', short: 'n' },
      sort: { type: String, description: 'Sort order (new/old)' },
      before: { type: String, description: 'Before date' },
      after: { type: String, description: 'After date' },
      inventor: { type: String, description: 'Inventor name' },
      assignee: { type: String, description: 'Assignee name' },
      country: { type: String, description: 'Country code' },
      language: { type: String, description: 'Language code' },
      status: {
        type: String,
        description: 'Patent status (GRANT/APPLICATION)',
      },
      type: { type: String, description: 'Patent type (PATENT/DESIGN)' },
      scholar: { type: Boolean, description: 'Include Google Scholar results' },
    },
  },
  async (ctx) => {
    const config = getConfig();
    const logger = createLogger('error');
    const serpApiClient = new SerpApiClient(
      config.serpApiKey,
      logger,
      30000,
      config.serpApiBaseUrl
    );

    const searchArgs: SearchPatentsArgs = {};
    if (ctx.parameters.query) searchArgs.q = ctx.parameters.query;
    if (ctx.flags.page !== undefined) searchArgs.page = ctx.flags.page;
    if (ctx.flags.num !== undefined) searchArgs.num = ctx.flags.num;
    if (ctx.flags.sort) searchArgs.sort = ctx.flags.sort as 'new' | 'old';
    if (ctx.flags.before) searchArgs.before = ctx.flags.before;
    if (ctx.flags.after) searchArgs.after = ctx.flags.after;
    if (ctx.flags.inventor) searchArgs.inventor = ctx.flags.inventor;
    if (ctx.flags.assignee) searchArgs.assignee = ctx.flags.assignee;
    if (ctx.flags.country) searchArgs.country = ctx.flags.country;
    if (ctx.flags.language) searchArgs.language = ctx.flags.language;
    if (ctx.flags.status)
      searchArgs.status = ctx.flags.status as 'GRANT' | 'APPLICATION';
    if (ctx.flags.type) searchArgs.type = ctx.flags.type as 'PATENT' | 'DESIGN';
    if (ctx.flags.scholar) searchArgs.scholar = true;

    const response = await serpApiClient.searchPatents(searchArgs);
    const results = response.organic_results ?? [];

    if (ctx.flags.json) {
      process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    } else {
      process.stdout.write(`${formatSearchResults(results)}\n`);
    }
  }
);
