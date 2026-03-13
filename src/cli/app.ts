import { subcommands, run as cmdRun } from 'cmd-ts';
import { readFileSync } from 'fs';
import { get } from './commands/get.js';
import { search } from './commands/search.js';
import { serve } from './commands/serve.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
) as { version: string };

const app = subcommands({
  name: 'patentscope',
  version: packageJson.version,
  cmds: { serve, search, get },
});

export async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
  await cmdRun(app, argv);
}
