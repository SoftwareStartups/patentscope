const SERVICE = 'com.softwarestartups.patentscope';

export async function getSecret(name: string): Promise<string | null> {
  try {
    return await Bun.secrets.get({ service: SERVICE, name });
  } catch {
    return null;
  }
}

export async function setSecret(name: string, value: string): Promise<void> {
  await Bun.secrets.set({
    service: SERVICE,
    name,
    value,
    allowUnrestrictedAccess: true,
  });
}

export async function deleteSecret(name: string): Promise<boolean> {
  try {
    return await Bun.secrets.delete({ service: SERVICE, name });
  } catch {
    return false;
  }
}

// biome-ignore lint/complexity/useRegexLiterals: RegExp constructor avoids biome noControlCharactersInRegex false positive
const CONTROL_CHARS = new RegExp('[\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f]');

function hasControlCharacters(value: string): boolean {
  return CONTROL_CHARS.test(value);
}

export function sanitizeCredential(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Credential cannot be empty');
  if (trimmed.length > 4096)
    throw new Error('Credential exceeds maximum length');
  if (hasControlCharacters(trimmed))
    throw new Error('Credential contains invalid control characters');
  return trimmed;
}
