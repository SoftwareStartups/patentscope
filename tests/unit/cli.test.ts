import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseArgs, run } from '../../src/cli.js';

describe('parseArgs', () => {
  it('returns null command and no flags for empty args', () => {
    expect(parseArgs([])).toEqual({
      command: null,
      flags: { help: false, version: false, json: false },
    });
  });

  it('parses serve command', () => {
    expect(parseArgs(['serve'])).toEqual({
      command: 'serve',
      flags: { help: false, version: false, json: false },
    });
  });

  it('parses --version flag', () => {
    expect(parseArgs(['--version'])).toEqual({
      command: null,
      flags: { help: false, version: true, json: false },
    });
  });

  it('parses -v flag', () => {
    expect(parseArgs(['-v'])).toEqual({
      command: null,
      flags: { help: false, version: true, json: false },
    });
  });

  it('parses --help flag', () => {
    expect(parseArgs(['--help'])).toEqual({
      command: null,
      flags: { help: true, version: false, json: false },
    });
  });

  it('parses -h flag', () => {
    expect(parseArgs(['-h'])).toEqual({
      command: null,
      flags: { help: true, version: false, json: false },
    });
  });

  it('parses --json flag', () => {
    expect(parseArgs(['--json'])).toEqual({
      command: null,
      flags: { help: false, version: false, json: true },
    });
  });

  it('parses unknown command', () => {
    expect(parseArgs(['unknown'])).toEqual({
      command: 'unknown',
      flags: { help: false, version: false, json: false },
    });
  });

  it('parses --version --json together', () => {
    expect(parseArgs(['--version', '--json'])).toEqual({
      command: null,
      flags: { help: false, version: true, json: true },
    });
  });

  it('parses --help --json together', () => {
    expect(parseArgs(['--help', '--json'])).toEqual({
      command: null,
      flags: { help: true, version: false, json: true },
    });
  });

  it('parses flags after command', () => {
    const result = parseArgs(['serve', '--json']);
    expect(result.command).toBe('serve');
    expect(result.flags.json).toBe(true);
  });

  it('only captures first positional as command', () => {
    const result = parseArgs(['serve', 'extra']);
    expect(result.command).toBe('serve');
  });
});

describe('run', () => {
  let stderrOutput: string[];
  let stdoutOutput: string[];

  beforeEach(() => {
    stderrOutput = [];
    stdoutOutput = [];

    vi.spyOn(process, 'exit').mockImplementation((_code?: string | number | null) => {
      throw new Error(`process.exit:${_code}`);
    });

    vi.spyOn(process.stderr, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stderrOutput.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
        return true;
      }
    );

    vi.spyOn(process.stdout, 'write').mockImplementation(
      (chunk: string | Uint8Array<ArrayBufferLike>) => {
        stdoutOutput.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
        return true;
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('--help prints help to stderr and exits 0', async () => {
    await expect(run(['--help'])).rejects.toThrow('process.exit:0');
    const output = stderrOutput.join('');
    expect(output).toContain('serve');
    expect(output).toContain('--help');
    expect(stdoutOutput).toHaveLength(0);
  });

  it('-h prints help to stderr and exits 0', async () => {
    await expect(run(['-h'])).rejects.toThrow('process.exit:0');
    expect(stderrOutput.join('')).toContain('serve');
  });

  it('--version prints version to stderr and exits 0', async () => {
    await expect(run(['--version'])).rejects.toThrow('process.exit:0');
    const output = stderrOutput.join('');
    expect(output).toContain('google-patents-mcp');
    expect(stdoutOutput).toHaveLength(0);
  });

  it('-v prints version to stderr and exits 0', async () => {
    await expect(run(['-v'])).rejects.toThrow('process.exit:0');
    expect(stderrOutput.join('')).toContain('google-patents-mcp');
  });

  it('--version --json outputs valid JSON to stdout, not stderr', async () => {
    await expect(run(['--version', '--json'])).rejects.toThrow('process.exit:0');
    const output = stdoutOutput.join('');
    const parsed = JSON.parse(output) as Record<string, unknown>;
    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('version');
    expect(typeof parsed.name).toBe('string');
    expect(typeof parsed.version).toBe('string');
    expect(stderrOutput).toHaveLength(0);
  });

  it('--help --json outputs valid JSON to stdout, not stderr', async () => {
    await expect(run(['--help', '--json'])).rejects.toThrow('process.exit:0');
    const output = stdoutOutput.join('');
    const parsed = JSON.parse(output) as Record<string, unknown>;
    expect(parsed).toHaveProperty('commands');
    expect(Array.isArray(parsed.commands)).toBe(true);
    expect(parsed).toHaveProperty('flags');
    expect(Array.isArray(parsed.flags)).toBe(true);
    expect(stderrOutput).toHaveLength(0);
  });

  it('no command prints help to stderr and exits 1', async () => {
    await expect(run([])).rejects.toThrow('process.exit:1');
    expect(stderrOutput.join('')).toContain('serve');
  });

  it('unknown command prints error and exits 1', async () => {
    await expect(run(['foobar'])).rejects.toThrow('process.exit:1');
    const output = stderrOutput.join('');
    expect(output).toContain('Unknown command');
    expect(output).toContain('foobar');
  });
});
