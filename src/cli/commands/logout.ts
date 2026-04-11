import { defineCommand } from 'clerc';
import { deleteSecret } from '../../auth/keychain.js';

export const logout = defineCommand(
  {
    name: 'logout',
    description: 'Remove saved API key',
  },
  async () => {
    const deleted = await deleteSecret('SERPAPI_API_KEY');

    if (!deleted) {
      process.stdout.write(
        'No stored credentials found. Already logged out.\n'
      );
      return;
    }

    process.stdout.write('Credentials removed.\n');

    if (process.env.SERPAPI_API_KEY) {
      process.stdout.write(
        'Note: SERPAPI_API_KEY environment variable is still set.\n'
      );
    }
  }
);
