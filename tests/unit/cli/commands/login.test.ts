import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';
import { SerpApiError } from '../../../../src/errors.js';

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

  it('throws on 401 validation failure (invalid key)', async () => {
    mockSearchPatents.mockRejectedValue(
      new SerpApiError('Authentication failed.', { statusCode: 401 })
    );
    await expect(handler({ flags: { apiKey: 'bad-key' } })).rejects.toThrow(
      'invalid'
    );
    expect(mockWriteConfig).not.toHaveBeenCalled();
  });

  it('warns but saves on network validation failure', async () => {
    mockSearchPatents.mockRejectedValue(new Error('fetch failed'));
    await handler({ flags: { apiKey: 'maybe-key' } });
    const output = stderrOutput.join('');
    expect(output).toContain('Warning');
    expect(output).toContain('Could not reach');
    expect(mockWriteConfig).toHaveBeenCalledWith({ api_key: 'maybe-key' });
  });

  it('trims whitespace from API key', async () => {
    await handler({
      flags: { apiKey: '  spaced-key  ', skipValidation: true },
    });
    expect(mockWriteConfig).toHaveBeenCalledWith({ api_key: 'spaced-key' });
  });

  it('throws on writeConfig failure', async () => {
    mockWriteConfig.mockImplementation(() => {
      throw new Error('EACCES: permission denied');
    });
    await expect(
      handler({ flags: { apiKey: 'good-key', skipValidation: true } })
    ).rejects.toThrow('Failed to save config');
  });
});
