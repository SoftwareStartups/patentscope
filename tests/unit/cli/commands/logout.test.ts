import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

const mockReadConfig = mock();
const mockDeleteConfig = mock();
const mockGetConfigPath = mock(() => '/fake/config.json');

await mock.module('clerc', () => ({
  defineCommand: (config: Record<string, unknown>, handler: unknown) => ({
    ...config,
    handler,
  }),
}));

await mock.module('../../../../src/utils/config-file.js', () => ({
  readConfig: mockReadConfig,
  deleteConfig: mockDeleteConfig,
  getConfigPath: mockGetConfigPath,
}));

const { logout } = await import('../../../../src/cli/commands/logout.js');
const handler = (logout as unknown as { handler: () => Promise<void> }).handler;

describe('logout command', () => {
  let stdoutOutput: string[];
  let stderrOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    stderrOutput = [];
    mockReadConfig.mockClear();
    mockDeleteConfig.mockClear();
    spyOn(process.stdout, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stdoutOutput.push(
          typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString()
        );
        return true;
      }
    );
    spyOn(process.stderr, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stderrOutput.push(
          typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString()
        );
        return true;
      }
    );
  });

  afterEach(() => {
    mock.restore();
  });

  it('deletes config and prints success', async () => {
    mockReadConfig.mockReturnValue({ api_key: 'existing-key' });
    mockDeleteConfig.mockReturnValue(true);
    await handler();
    expect(mockDeleteConfig).toHaveBeenCalled();
    const output = stdoutOutput.join('');
    expect(output).toContain('API key removed');
    expect(output).toContain('/fake/config.json');
  });

  it('prints message when already logged out', async () => {
    mockReadConfig.mockReturnValue(null);
    await handler();
    expect(mockDeleteConfig).not.toHaveBeenCalled();
    const output = stdoutOutput.join('');
    expect(output).toContain('Already logged out');
  });
});
