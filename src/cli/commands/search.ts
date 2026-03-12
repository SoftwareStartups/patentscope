import { command, flag, option, positional, optional, string, number } from 'cmd-ts';
import { getConfig } from '../../config.js';
import { createLogger } from '../../logger.js';
import { SerpApiClient } from '../../services/serpapi.js';
import type { SearchPatentsArgs } from '../../types.js';
import { formatSearchResults } from '../format.js';

export const search = command({
  name: 'search',
  description: 'Search Google Patents',
  args: {
    query: positional({
      type: optional(string),
      displayName: 'query',
      description: 'Search query',
    }),
    json: flag({ long: 'json', description: 'Output as JSON' }),
    page: option({
      type: optional(number),
      long: 'page',
      short: 'p',
      description: 'Page number',
    }),
    num: option({
      type: optional(number),
      long: 'num',
      short: 'n',
      description: 'Number of results',
    }),
    sort: option({
      type: optional(string),
      long: 'sort',
      description: 'Sort order (new/old)',
    }),
    before: option({
      type: optional(string),
      long: 'before',
      description: 'Before date',
    }),
    after: option({
      type: optional(string),
      long: 'after',
      description: 'After date',
    }),
    inventor: option({
      type: optional(string),
      long: 'inventor',
      description: 'Inventor name',
    }),
    assignee: option({
      type: optional(string),
      long: 'assignee',
      description: 'Assignee name',
    }),
    country: option({
      type: optional(string),
      long: 'country',
      description: 'Country code',
    }),
    language: option({
      type: optional(string),
      long: 'language',
      description: 'Language code',
    }),
    status: option({
      type: optional(string),
      long: 'status',
      description: 'Patent status (GRANT/APPLICATION)',
    }),
    type: option({
      type: optional(string),
      long: 'type',
      description: 'Patent type (PATENT/DESIGN)',
    }),
    scholar: flag({ long: 'scholar', description: 'Include Google Scholar results' }),
  },
  handler: async (args) => {
    const config = getConfig();
    const logger = createLogger('error');
    const serpApiClient = new SerpApiClient(
      config.serpApiKey,
      logger,
      30000,
      config.serpApiBaseUrl
    );

    const searchArgs: SearchPatentsArgs = {};
    if (args.query) searchArgs.q = args.query;
    if (args.page !== undefined) searchArgs.page = args.page;
    if (args.num !== undefined) searchArgs.num = args.num;
    if (args.sort) searchArgs.sort = args.sort as 'new' | 'old';
    if (args.before) searchArgs.before = args.before;
    if (args.after) searchArgs.after = args.after;
    if (args.inventor) searchArgs.inventor = args.inventor;
    if (args.assignee) searchArgs.assignee = args.assignee;
    if (args.country) searchArgs.country = args.country;
    if (args.language) searchArgs.language = args.language;
    if (args.status) searchArgs.status = args.status as 'GRANT' | 'APPLICATION';
    if (args.type) searchArgs.type = args.type as 'PATENT' | 'DESIGN';
    if (args.scholar) searchArgs.scholar = true;

    const response = await serpApiClient.searchPatents(searchArgs);
    const results = response.organic_results ?? [];

    if (args.json) {
      process.stdout.write(JSON.stringify(results, null, 2) + '\n');
    } else {
      process.stdout.write(formatSearchResults(results) + '\n');
    }
  },
});
