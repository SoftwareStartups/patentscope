#!/usr/bin/env node
import { run } from './cli.js';

run().catch((err: unknown) => {
  process.stderr.write(
    `Failed to start: ${err instanceof Error ? err.message : String(err)}\n`
  );
  process.exit(1);
});
