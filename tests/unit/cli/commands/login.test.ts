import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

const mockWriteConfig = mock();
const mockGetConfigPath = mock(() => '/fake/config.json');
const mockSearchPatents = mock();

await mock.module('clerc', () => ({
  defineCommand: (config: Record<string, unknown>, handler: unknown) => ({
    ...config,
    handler,
  }),
}));

await mock.module('../../../../src/utils/config-file.js', () => ({
  writeConfig: mockWriteConfig,
  getConfigPath: mockGetConfigPath,
}));

await mock.module('../../../../src/logger.js', () => ({
  createLogger: () => ({
    error: mock(),
    info: mock(),
    debug: mock(),
    warn: mock(),
    close: mock(),
  }),
}));

await mock.module('../../../../src/services/serpapi.js', () => ({
  SerpApiClient: class {
    searchPatents = mockSearchPatents;
  },
}));

interface LoginContext {
  flags: {
    apiKey?: string;
    skipValidation?: boolean;
    json?: boolean;
  };
}

const { login } = await import('../../../../src/cli/commands/login.js');
const handler = (
  login as unknown as { handler: (ctx: LoginContext) => Promise<void> }
).handler;

describe('login command', () => {
  let stderrOutput: string[];
  let stdoutOutput: string[];

  beforeEach(() => {
    stderrOutput = [];
    stdoutOutput = [];
    mockWriteConfig.mockClear();
    mockSearchPatents.mockClear();
    spyOn(process.stderr, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stderrOutput.push(
          typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString()
        );
        return true;
      }
    );
    spyOn(process.stdout, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stdoutOutput.push(
          typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString()
        );
        return true;
      }
    );
    mockSearchPatents.mockResolvedValue({ organic_results: [] });
  });

  afterEach(() => {
    mock.restore();
  });

  it('saves API key from --api-key flag', async () => {
    await handler({ flags: { apiKey: 'test-key-123', skipValidation: true } });
    expect(mockWriteConfig).toHaveBeenCalledWith({ api_key: 'test-key-123' });
  });

  it('prints success message with config path', async () => {
    await handler({ flags: { apiKey: 'my-key', skipValidation: true } });
    const output = stdoutOutput.join('');
    expect(output).toContain('/fake/config.json');
  });

  it('validates API key by default', async () => {
    await handler({ flags: { apiKey: 'valid-key' } });
    expect(mockSearchPatents).toHaveBeenCalled();
    expect(mockWriteConfig).toHaveBeenCalledWith({ api_key: 'valid-key' });
  });

  it('skips validation with --skip-validation', async () => {
    await handler({ flags: { apiKey: 'any-key', skipValidation: true } });
    expect(mockSearchPatents).not.toHaveBeenCalled();
    expect(mockWriteConfig).toHaveBeenCalled();
  });

  it('warns but still saves on validation failure', async () => {
    mockSearchPatents.mockRejectedValue(new Error('401'));
    await handler({ flags: { apiKey: 'bad-key' } });
    const output = stderrOutput.join('');
    expect(output).toContain('Warning');
    expect(mockWriteConfig).toHaveBeenCalledWith({ api_key: 'bad-key' });
  });

  it('trims whitespace from API key', async () => {
    await handler({
      flags: { apiKey: '  spaced-key  ', skipValidation: true },
    });
    expect(mockWriteConfig).toHaveBeenCalledWith({ api_key: 'spaced-key' });
  });
});
