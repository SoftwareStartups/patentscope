import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export interface PatentscopeConfig {
  api_key: string;
}

const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

function getConfigDir(): string {
  return (
    process.env.PATENTSCOPE_CONFIG_DIR ||
    path.join(os.homedir(), '.config', 'patentscope')
  );
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function readConfig(): PatentscopeConfig | null {
  const configFile = getConfigPath();
  try {
    if (!fs.existsSync(configFile)) {
      return null;
    }
    const raw = fs.readFileSync(configFile, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (isValidConfig(parsed)) {
      return parsed;
    }
    return null;
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      return null;
    }
    if (isNodeError(err) && err.code === 'EACCES') {
      throw new Error(
        `Cannot read config file: permission denied. Check permissions on ${configFile}`
      );
    }
    throw err;
  }
}

export function writeConfig(config: PatentscopeConfig): void {
  const configDir = getConfigDir();
  const configFile = getConfigPath();
  fs.mkdirSync(configDir, { recursive: true, mode: DIR_MODE });
  fs.writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, {
    mode: FILE_MODE,
  });
  fs.chmodSync(configFile, FILE_MODE);
  fs.chmodSync(configDir, DIR_MODE);
}

export function deleteConfig(): boolean {
  const configFile = getConfigPath();
  try {
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
      return true;
    }
    return false;
  } catch (err: unknown) {
    if (isNodeError(err) && err.code === 'EACCES') {
      throw new Error(
        `Cannot delete config file: permission denied. Check permissions on ${configFile}`
      );
    }
    return false;
  }
}

export function readApiKeyFromConfig(): string | null {
  const config = readConfig();
  return config?.api_key ?? null;
}

function isValidConfig(value: unknown): value is PatentscopeConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.api_key === 'string' && obj.api_key.length > 0;
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}
