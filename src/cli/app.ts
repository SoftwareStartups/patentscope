import { Cli } from 'clerc';
import { readFileSync } from 'fs';
import { get } from './commands/get.js';
import { search } from './commands/search.js';
import { serve } from './commands/serve.js';
import { jsonOutputPlugin } from './plugins/json-output.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
) as { version: string };

export async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
  await Cli()
    .scriptName('patentscope')
    .version(packageJson.version)
    .use(jsonOutputPlugin)
    .command(serve)
    .command(search)
    .command(get)
    .parse(argv);
}
