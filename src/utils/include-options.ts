import type { FetchPatentOptions } from '../types.js';

export const VALID_SECTIONS = [
  'metadata',
  'abstract',
  'claims',
  'description',
  'family_members',
  'citations',
] as const;

export function parseIncludeOptions(sections: string[]): FetchPatentOptions {
  return {
    includeMetadata: sections.includes('metadata'),
    includeAbstract: sections.includes('abstract'),
    includeClaims: sections.includes('claims'),
    includeDescription: sections.includes('description'),
    includeFamilyMembers: sections.includes('family_members'),
    includeCitations: sections.includes('citations'),
  };
}
