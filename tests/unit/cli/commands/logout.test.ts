import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

const mockDeleteSecret = mock(() => Promise.resolve(true));

await mock.module('clerc', () => ({
  defineCommand: (config: Record<string, unknown>, handler: unknown) => ({
    ...config,
    handler,
  }),
}));

await mock.module('../../../../src/auth/keychain.js', () => ({
  deleteSecret: mockDeleteSecret,
}));

const { logout } = await import('../../../../src/cli/commands/logout.js');
const handler = (logout as unknown as { handler: () => Promise<void> }).handler;

describe('logout command', () => {
  let stdoutOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    mockDeleteSecret.mockClear();
    mockDeleteSecret.mockResolvedValue(true);
    spyOn(process.stdout, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stdoutOutput.push(
          typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString()
        );
        return true;
      }
    );
  });

  afterEach(() => {
    mock.restore();
  });

  it('deletes from keychain and prints success', async () => {
    await handler();
    expect(mockDeleteSecret).toHaveBeenCalledWith('SERPAPI_API_KEY');
    const output = stdoutOutput.join('');
    expect(output).toContain('Credentials removed');
  });

  it('prints message when already logged out', async () => {
    mockDeleteSecret.mockResolvedValue(false);
    await handler();
    const output = stdoutOutput.join('');
    expect(output).toContain('Already logged out');
  });
});
