import * as readline from 'node:readline';
import { Writable } from 'node:stream';
import { defineCommand } from 'clerc';
import { CliError, SerpApiError } from '../../errors.js';
import type { Logger } from '../../logger.js';
import { SerpApiClient } from '../../services/serpapi.js';
import { getConfigPath, writeConfig } from '../../utils/config-file.js';

interface ValidationResult {
  valid: boolean;
  reason?: 'invalid' | 'network';
}

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
      throw new CliError('API key cannot be empty.');
    }

    const trimmedKey = apiKey.trim();

    if (!ctx.flags.skipValidation) {
      const result = await validateApiKey(trimmedKey);
      if (!result.valid) {
        if (result.reason === 'invalid') {
          throw new CliError(
            'API key is invalid. Check your key and try again.'
          );
        }
        process.stderr.write(
          'Warning: Could not reach SerpApi to validate key. Saving anyway.\n'
        );
      }
    }

    try {
      writeConfig({ api_key: trimmedKey });
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'unknown error';
      throw new CliError(`Failed to save config: ${detail}`, { cause: err });
    }

    process.stdout.write(`API key saved to ${getConfigPath()}\n`);
  }
);

async function promptForApiKey(): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new CliError(
      'No TTY detected. Use --api-key to provide the key non-interactively.'
    );
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

  return new Promise<string>((resolve, reject) => {
    process.stderr.write('Enter your SerpApi API key: ');

    rl.on('close', () => {
      process.stderr.write('\n');
      reject(new CliError('Login cancelled.'));
    });

    rl.on('SIGINT', () => {
      rl.close();
    });

    rl.question('', (answer) => {
      rl.removeAllListeners('close');
      rl.close();
      process.stderr.write('\n');
      resolve(answer);
    });
  });
}

const silentLogger: Logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
};

async function validateApiKey(apiKey: string): Promise<ValidationResult> {
  try {
    const client = new SerpApiClient(apiKey, silentLogger);
    await client.searchPatents({ q: 'test', num: 10 });
    return { valid: true };
  } catch (err: unknown) {
    if (
      err instanceof SerpApiError &&
      err.statusCode !== undefined &&
      (err.statusCode === 401 || err.statusCode === 403)
    ) {
      return { valid: false, reason: 'invalid' };
    }
    return { valid: false, reason: 'network' };
  }
}
