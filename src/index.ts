#!/usr/bin/env bun
import { run } from './cli/app.js';
import { sanitizeErrorMessage } from './errors.js';

run().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Error: ${sanitizeErrorMessage(message)}\n`);
  process.exit(1);
});
