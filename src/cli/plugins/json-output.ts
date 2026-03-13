import { definePlugin } from 'clerc';

export const jsonOutputPlugin = definePlugin({
  setup: (cli) => {
    cli.globalFlag('json', 'Output as JSON', { type: Boolean });
  },
});
