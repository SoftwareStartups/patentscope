import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFetchPatentData } = vi.hoisted(() => ({
  mockFetchPatentData: vi.fn(),
}));

vi.mock('cmd-ts', () => ({
  command: (config: Record<string, unknown>) => config,
  flag: () => undefined,
  option: () => undefined,
  positional: () => undefined,
  optional: (t: unknown) => t,
  string: {},
  number: {},
}));

vi.mock('../../../../src/config.js', () => ({
  getConfig: () => ({
    serpApiKey: 'test-key',
    serpApiBaseUrl: 'https://serpapi.com',
    logLevel: 'error',
  }),
}));

vi.mock('../../../../src/logger.js', () => ({
  createLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('../../../../src/services/serpapi.js', () => ({
  SerpApiClient: class {},
}));

vi.mock('../../../../src/services/patent.js', () => ({
  PatentService: class {
    fetchPatentData = mockFetchPatentData;
  },
}));

interface GetArgs {
  patentId: string;
  json: boolean;
  include?: string;
  maxLength?: number;
}

const defaultArgs: GetArgs = {
  patentId: 'US7654321B2',
  json: false,
  include: undefined,
  maxLength: undefined,
};

const { get } = await import('../../../../src/cli/commands/get.js');
const handler = (get as unknown as { handler: (args: GetArgs) => Promise<void> }).handler;

describe('get command', () => {
  let stdoutOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stdoutOutput.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
        return true;
      }
    );
    mockFetchPatentData.mockResolvedValue({
      patent_id: 'US7654321B2',
      title: 'Test Patent',
      abstract: 'A test abstract',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches patent with default includes', async () => {
    await handler({ ...defaultArgs });
    expect(mockFetchPatentData).toHaveBeenCalledWith('US7654321B2', {
      includeMetadata: true,
      includeAbstract: true,
      includeClaims: false,
      includeDescription: false,
      includeFamilyMembers: false,
      includeCitations: false,
      maxLength: undefined,
    });
  });

  it('outputs structured text by default', async () => {
    await handler({ ...defaultArgs });
    const output = stdoutOutput.join('');
    expect(output).toContain('Patent: US7654321B2');
    expect(output).toContain('Title:       Test Patent');
    expect(output).toContain('A test abstract');
  });

  it('outputs JSON with json flag', async () => {
    await handler({ ...defaultArgs, json: true });
    const output = JSON.parse(stdoutOutput.join('')) as Record<string, unknown>;
    expect(output.patent_id).toBe('US7654321B2');
    expect(output.title).toBe('Test Patent');
  });

  it('parses include option', async () => {
    await handler({ ...defaultArgs, patentId: 'US123', include: 'claims,description' });
    expect(mockFetchPatentData).toHaveBeenCalledWith('US123', {
      includeMetadata: false,
      includeAbstract: false,
      includeClaims: true,
      includeDescription: true,
      includeFamilyMembers: false,
      includeCitations: false,
      maxLength: undefined,
    });
  });

  it('passes max-length option', async () => {
    await handler({ ...defaultArgs, patentId: 'US123', maxLength: 5000 });
    expect(mockFetchPatentData).toHaveBeenCalledWith(
      'US123',
      expect.objectContaining({ maxLength: 5000 })
    );
  });

  it('throws on invalid include value', async () => {
    await expect(
      handler({ ...defaultArgs, patentId: 'US123', include: 'invalid' })
    ).rejects.toThrow('Invalid include value: "invalid"');
  });
});
