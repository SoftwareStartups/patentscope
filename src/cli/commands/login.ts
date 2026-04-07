import * as readline from 'node:readline';
import { Writable } from 'node:stream';
import { defineCommand } from 'clerc';
import { createLogger } from '../../logger.js';
import { SerpApiClient } from '../../services/serpapi.js';
import { getConfigPath, writeConfig } from '../../utils/config-file.js';

export const login = defineCommand(
  {
    name: 'login',
    description: 'Save your SerpApi API key',
    flags: {
      apiKey: {
        type: String,
        description: 'SerpApi API key (or enter interactively)',
      },
      skipValidation: {
        type: Boolean,
        description: 'Skip API key validation',
      },
    },
  },
  async (ctx) => {
    const apiKey = ctx.flags.apiKey || (await promptForApiKey());

    if (!apiKey || apiKey.trim().length === 0) {
      process.stderr.write('Error: API key cannot be empty.\n');
      process.exit(1);
    }

    const trimmedKey = apiKey.trim();

    if (!ctx.flags.skipValidation) {
      const valid = await validateApiKey(trimmedKey);
      if (!valid) {
        process.stderr.write(
          'Warning: Could not validate API key. Storing anyway.\n'
        );
      }
    }

    writeConfig({ api_key: trimmedKey });
    process.stdout.write(`API key saved to ${getConfigPath()}\n`);
  }
);

async function promptForApiKey(): Promise<string> {
  if (!process.stdin.isTTY) {
    process.stderr.write(
      'Error: No TTY detected. Use --api-key to provide the key non-interactively.\n'
    );
    process.exit(1);
  }

  const mutableOutput = new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableOutput,
    terminal: true,
  });

  return new Promise<string>((resolve) => {
    process.stderr.write('Enter your SerpApi API key: ');
    rl.question('', (answer) => {
      rl.close();
      process.stderr.write('\n');
      resolve(answer);
    });
  });
}

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const logger = createLogger('error');
    const client = new SerpApiClient(apiKey, logger);
    await client.searchPatents({ q: 'test', num: 1 });
    return true;
  } catch {
    return false;
  }
}
