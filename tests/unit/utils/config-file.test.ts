import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  deleteConfig,
  getConfigPath,
  readApiKeyFromConfig,
  readConfig,
  writeConfig,
} from '../../../src/utils/config-file.js';

describe('config-file', () => {
  let tempDir: string;
  let originalConfigDir: string | undefined;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patentscope-test-'));
    originalConfigDir = process.env.PATENTSCOPE_CONFIG_DIR;
    process.env.PATENTSCOPE_CONFIG_DIR = tempDir;
  });

  afterEach(() => {
    if (originalConfigDir !== undefined) {
      process.env.PATENTSCOPE_CONFIG_DIR = originalConfigDir;
    } else {
      delete process.env.PATENTSCOPE_CONFIG_DIR;
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('getConfigPath', () => {
    it('returns path under PATENTSCOPE_CONFIG_DIR', () => {
      expect(getConfigPath()).toBe(path.join(tempDir, 'config.json'));
    });
  });

  describe('readConfig', () => {
    it('returns null when config file does not exist', () => {
      expect(readConfig()).toBeNull();
    });

    it('returns parsed config when valid', () => {
      fs.writeFileSync(
        path.join(tempDir, 'config.json'),
        JSON.stringify({ api_key: 'test-key-123' })
      );
      expect(readConfig()).toEqual({ api_key: 'test-key-123' });
    });

    it('returns null for invalid JSON', () => {
      fs.writeFileSync(path.join(tempDir, 'config.json'), 'not json');
      expect(readConfig()).toBeNull();
    });

    it('returns null for missing api_key', () => {
      fs.writeFileSync(
        path.join(tempDir, 'config.json'),
        JSON.stringify({ other: 'value' })
      );
      expect(readConfig()).toBeNull();
    });

    it('returns null for empty api_key', () => {
      fs.writeFileSync(
        path.join(tempDir, 'config.json'),
        JSON.stringify({ api_key: '' })
      );
      expect(readConfig()).toBeNull();
    });
  });

  describe('writeConfig', () => {
    it('creates config file with correct content', () => {
      writeConfig({ api_key: 'my-key' });
      const raw = fs.readFileSync(path.join(tempDir, 'config.json'), 'utf-8');
      expect(JSON.parse(raw)).toEqual({ api_key: 'my-key' });
    });

    it('sets secure file permissions', () => {
      writeConfig({ api_key: 'my-key' });
      const fileStat = fs.statSync(path.join(tempDir, 'config.json'));
      const dirStat = fs.statSync(tempDir);
      expect(fileStat.mode & 0o777).toBe(0o600);
      expect(dirStat.mode & 0o777).toBe(0o700);
    });

    it('creates nested directories', () => {
      const nested = path.join(tempDir, 'sub', 'dir');
      process.env.PATENTSCOPE_CONFIG_DIR = nested;
      writeConfig({ api_key: 'nested-key' });
      const raw = fs.readFileSync(path.join(nested, 'config.json'), 'utf-8');
      expect(JSON.parse(raw)).toEqual({ api_key: 'nested-key' });
    });
  });

  describe('deleteConfig', () => {
    it('returns true when config file exists', () => {
      fs.writeFileSync(
        path.join(tempDir, 'config.json'),
        JSON.stringify({ api_key: 'key' })
      );
      expect(deleteConfig()).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'config.json'))).toBe(false);
    });

    it('returns false when config file does not exist', () => {
      expect(deleteConfig()).toBe(false);
    });
  });

  describe('readApiKeyFromConfig', () => {
    it('returns api key when config exists', () => {
      fs.writeFileSync(
        path.join(tempDir, 'config.json'),
        JSON.stringify({ api_key: 'the-key' })
      );
      expect(readApiKeyFromConfig()).toBe('the-key');
    });

    it('returns null when no config', () => {
      expect(readApiKeyFromConfig()).toBeNull();
    });
  });
});
