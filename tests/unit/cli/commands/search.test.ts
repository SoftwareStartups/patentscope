import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSearchPatents } = vi.hoisted(() => ({
  mockSearchPatents: vi.fn(),
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
  SerpApiClient: class {
    searchPatents = mockSearchPatents;
  },
}));

interface SearchArgs {
  query?: string;
  json: boolean;
  page?: number;
  num?: number;
  sort?: string;
  before?: string;
  after?: string;
  inventor?: string;
  assignee?: string;
  country?: string;
  language?: string;
  status?: string;
  type?: string;
  scholar: boolean;
}

const defaultArgs: SearchArgs = {
  query: undefined,
  json: false,
  page: undefined,
  num: undefined,
  sort: undefined,
  before: undefined,
  after: undefined,
  inventor: undefined,
  assignee: undefined,
  country: undefined,
  language: undefined,
  status: undefined,
  type: undefined,
  scholar: false,
};

// Import after mocks are set up
const { search } = await import('../../../../src/cli/commands/search.js');
const handler = (search as unknown as { handler: (args: SearchArgs) => Promise<void> }).handler;

describe('search command', () => {
  let stdoutOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stdoutOutput.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
        return true;
      }
    );
    mockSearchPatents.mockResolvedValue({
      organic_results: [{ title: 'Test Patent', patent_id: 'US123', assignee: 'TestCo' }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('searches with positional query', async () => {
    await handler({ ...defaultArgs, query: 'quantum computing' });
    expect(mockSearchPatents).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'quantum computing' })
    );
  });

  it('outputs structured text by default', async () => {
    await handler({ ...defaultArgs, query: 'test' });
    const output = stdoutOutput.join('');
    expect(output).toContain('Title:');
    expect(output).toContain('Test Patent');
    expect(output).toContain('1 result(s)');
  });

  it('outputs JSON with json flag', async () => {
    await handler({ ...defaultArgs, query: 'test', json: true });
    const output = JSON.parse(stdoutOutput.join('')) as unknown[];
    expect(Array.isArray(output)).toBe(true);
    expect(output).toHaveLength(1);
  });

  it('passes filter options to searchPatents', async () => {
    await handler({
      ...defaultArgs,
      query: 'test',
      num: 5,
      sort: 'new',
      assignee: 'Google',
    });
    expect(mockSearchPatents).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'test',
        num: 5,
        sort: 'new',
        assignee: 'Google',
      })
    );
  });

  it('handles empty results', async () => {
    mockSearchPatents.mockResolvedValue({ organic_results: [] });
    await handler({ ...defaultArgs, query: 'nothing' });
    const output = stdoutOutput.join('');
    expect(output).toContain('0 result(s)');
  });

  it('searches without query using filters only', async () => {
    await handler({ ...defaultArgs, assignee: 'Samsung', status: 'GRANT' });
    expect(mockSearchPatents).toHaveBeenCalledWith(
      expect.objectContaining({
        assignee: 'Samsung',
        status: 'GRANT',
      })
    );
  });
});
