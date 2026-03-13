import { describe, expect, it } from 'bun:test';
import {
  formatPatentData,
  formatSearchResults,
} from '../../../src/cli/format.js';
import type { PatentData, PatentResult } from '../../../src/types.js';

describe('formatSearchResults', () => {
  it('returns count for empty results', () => {
    expect(formatSearchResults([])).toBe('0 result(s)');
  });

  it('formats a single result', () => {
    const results: PatentResult[] = [
      {
        title: 'Method for Quantum Computing',
        patent_id: 'US7654321B2',
        assignee: 'Tech Corporation',
        inventor: 'John Doe',
        filing_date: '2020-02-01',
        snippet: 'A method for implementing quantum computing...',
      },
    ];
    const output = formatSearchResults(results);
    expect(output).toContain('Title:     Method for Quantum Computing');
    expect(output).toContain('ID:        US7654321B2');
    expect(output).toContain('Assignee:  Tech Corporation');
    expect(output).toContain('Inventor:  John Doe');
    expect(output).toContain('Filed:     2020-02-01');
    expect(output).toContain(
      'Snippet:   A method for implementing quantum computing...'
    );
    expect(output).toContain('1 result(s)');
  });

  it('separates multiple results with ---', () => {
    const results: PatentResult[] = [
      { title: 'Patent A', patent_id: 'US111' },
      { title: 'Patent B', patent_id: 'US222' },
    ];
    const output = formatSearchResults(results);
    expect(output).toContain('---');
    expect(output).toContain('2 result(s)');
  });

  it('omits missing fields', () => {
    const results: PatentResult[] = [{ title: 'Only Title' }];
    const output = formatSearchResults(results);
    expect(output).toContain('Title:     Only Title');
    expect(output).not.toContain('ID:');
    expect(output).not.toContain('Assignee:');
  });
});

describe('formatPatentData', () => {
  it('formats metadata fields', () => {
    const data: PatentData = {
      patent_id: 'US7654321B2',
      title: 'Test Patent',
      publication_number: 'US7654321B2',
      assignee: 'Tech Corp',
      inventor: 'Jane Doe',
      priority_date: '2020-01-01',
      filing_date: '2020-02-01',
    };
    const output = formatPatentData(data);
    expect(output).toContain('Patent: US7654321B2');
    expect(output).toContain('Title:       Test Patent');
    expect(output).toContain('Pub Number:  US7654321B2');
    expect(output).toContain('Assignee:    Tech Corp');
    expect(output).toContain('Inventor:    Jane Doe');
    expect(output).toContain('Priority:    2020-01-01');
    expect(output).toContain('Filed:       2020-02-01');
  });

  it('formats abstract section', () => {
    const data: PatentData = {
      patent_id: 'US123',
      abstract: 'This patent describes a novel method...',
    };
    const output = formatPatentData(data);
    expect(output).toContain('Abstract');
    expect(output).toContain('--------');
    expect(output).toContain('This patent describes a novel method...');
  });

  it('formats claims section', () => {
    const data: PatentData = {
      patent_id: 'US123',
      claims: ['A method for implementing...', 'The method of claim 1...'],
    };
    const output = formatPatentData(data);
    expect(output).toContain('Claims (2)');
    expect(output).toContain('1. A method for implementing...');
    expect(output).toContain('2. The method of claim 1...');
  });

  it('formats description section', () => {
    const data: PatentData = {
      patent_id: 'US123',
      description: 'Detailed description...',
    };
    const output = formatPatentData(data);
    expect(output).toContain('Description');
    expect(output).toContain('-----------');
    expect(output).toContain('Detailed description...');
  });

  it('formats family members section', () => {
    const data: PatentData = {
      patent_id: 'US123',
      family_members: [
        { patent_id: 'EP1234567A1', region: 'EP', status: 'Pending' },
        { patent_id: 'WO2020123456', region: 'WO', status: 'Active' },
      ],
    };
    const output = formatPatentData(data);
    expect(output).toContain('Family Members (2)');
    expect(output).toContain('EP1234567A1  EP  Pending');
    expect(output).toContain('WO2020123456  WO  Active');
  });

  it('formats citations section', () => {
    const data: PatentData = {
      patent_id: 'US123',
      citations: {
        forward_citations: 10,
        backward_citations: 5,
        family_to_family_citations: 2,
      },
    };
    const output = formatPatentData(data);
    expect(output).toContain('Citations');
    expect(output).toContain('Forward: 10');
    expect(output).toContain('Backward: 5');
    expect(output).toContain('Family-to-Family: 2');
  });

  it('omits family_to_family when undefined', () => {
    const data: PatentData = {
      patent_id: 'US123',
      citations: { forward_citations: 3, backward_citations: 1 },
    };
    const output = formatPatentData(data);
    expect(output).toContain('Forward: 3');
    expect(output).not.toContain('Family-to-Family');
  });

  it('omits sections with no data', () => {
    const data: PatentData = { patent_id: 'US123' };
    const output = formatPatentData(data);
    expect(output).toContain('Patent: US123');
    expect(output).not.toContain('Abstract');
    expect(output).not.toContain('Claims');
    expect(output).not.toContain('Description');
    expect(output).not.toContain('Family Members');
    expect(output).not.toContain('Citations');
  });
});
