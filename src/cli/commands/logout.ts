import { defineCommand } from 'clerc';
import {
  deleteConfig,
  getConfigPath,
  readConfig,
} from '../../utils/config-file.js';

export const logout = defineCommand(
  {
    name: 'logout',
    description: 'Remove saved API key',
  },
  async () => {
    const existing = readConfig();
    if (!existing) {
      process.stdout.write('No saved API key found. Already logged out.\n');
      return;
    }

    const deleted = deleteConfig();
    if (deleted) {
      process.stdout.write(`API key removed from ${getConfigPath()}\n`);
    } else {
      process.stderr.write('Error: Failed to remove config file.\n');
      process.exit(1);
    }
  }
);
