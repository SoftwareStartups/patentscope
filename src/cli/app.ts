import { Cli } from 'clerc';
import packageJson from '../../package.json' with { type: 'json' };
import { CliError, SerpApiError, sanitizeErrorMessage } from '../errors.js';
import { get } from './commands/get.js';
import { login } from './commands/login.js';
import { logout } from './commands/logout.js';
import { search } from './commands/search.js';
import { serve } from './commands/serve.js';
import { jsonOutputPlugin } from './plugins/json-output.js';

function resolveArgv(argv: string[]): string[] {
  if (argv.length === 0) return ['--help'];
  if (argv[0] === 'get' && !argv.slice(1).some((a) => !a.startsWith('-'))) {
    return ['get', '--help'];
  }
  return argv;
}

export async function run(
  argv: string[] = process.argv.slice(2)
): Promise<void> {
  await Cli()
    .scriptName('patentscope')
    .version(packageJson.version)
    .errorHandler((error: unknown) => {
      if (error instanceof SerpApiError || error instanceof CliError) {
        process.stderr.write(`Error: ${error.userMessage}\n`);
      } else {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Error: ${sanitizeErrorMessage(message)}\n`);
      }
      process.exit(error instanceof CliError ? error.exitCode : 1);
    })
    .use(jsonOutputPlugin)
    .command(serve)
    .command(search)
    .command(get)
    .command(login)
    .command(logout)
    .parse(resolveArgv(argv));
}
