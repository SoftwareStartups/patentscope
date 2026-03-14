import { defineCommand } from 'clerc';
import { getConfig } from '../../config.js';
import { createLogger } from '../../logger.js';
import { PatentService } from '../../services/patent.js';
import { SerpApiClient } from '../../services/serpapi.js';
import type { FetchPatentOptions } from '../../types.js';
import { formatPatentData } from '../format.js';

const VALID_SECTIONS = [
  'metadata',
  'abstract',
  'claims',
  'description',
  'family_members',
  'citations',
];

function parseIncludeOptions(sections: string[]): FetchPatentOptions {
  return {
    includeMetadata: sections.includes('metadata'),
    includeAbstract: sections.includes('abstract'),
    includeClaims: sections.includes('claims'),
    includeDescription: sections.includes('description'),
    includeFamilyMembers: sections.includes('family_members'),
    includeCitations: sections.includes('citations'),
  };
}

export const get = defineCommand(
  {
    name: 'get',
    description: 'Get patent details',
    parameters: ['<patentId>'] as const,
    flags: {
      include: {
        type: String,
        description:
          'Comma-separated sections (metadata,abstract,claims,description,family_members,citations)',
        short: 'i',
      },
      maxLength: { type: Number, description: 'Maximum content length' },
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
    const patentService = new PatentService(serpApiClient, logger);

    const sections = ctx.flags.include
      ? ctx.flags.include.split(',').map((s) => s.trim().toLowerCase())
      : ['metadata', 'abstract'];

    for (const section of sections) {
      if (!VALID_SECTIONS.includes(section)) {
        throw new Error(
          `Invalid include value: "${section}". Valid values are: ${VALID_SECTIONS.join(', ')}`
        );
      }
    }

    const options: FetchPatentOptions = {
      ...parseIncludeOptions(sections),
      maxLength: ctx.flags.maxLength,
    };

    const data = await patentService.fetchPatentData(
      ctx.parameters.patentId,
      options
    );

    if (ctx.flags.json) {
      process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    } else {
      process.stdout.write(`${formatPatentData(data)}\n`);
    }
  }
);
