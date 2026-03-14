import type { PatentData, PatentResult } from '../types.js';

export function formatSearchResults(results: PatentResult[]): string {
  if (results.length === 0) {
    return '0 result(s)';
  }

  const entries = results.map((r) => {
    const lines: string[] = [];
    if (r.title) lines.push(`Title:     ${r.title}`);
    if (r.patent_id) lines.push(`ID:        ${r.patent_id}`);
    if (r.assignee) lines.push(`Assignee:  ${r.assignee}`);
    if (r.inventor) lines.push(`Inventor:  ${r.inventor}`);
    if (r.filing_date) lines.push(`Filed:     ${r.filing_date}`);
    if (r.snippet) lines.push(`Snippet:   ${r.snippet}`);
    return lines.join('\n');
  });

  return `${entries.join('\n---\n')}\n\n${results.length} result(s)`;
}

export function formatPatentData(data: PatentData): string {
  const lines: string[] = [];

  if (data.patent_id) lines.push(`Patent: ${data.patent_id}`);
  if (data.title) lines.push(`Title:       ${data.title}`);
  if (data.publication_number)
    lines.push(`Pub Number:  ${data.publication_number}`);
  if (data.assignee) lines.push(`Assignee:    ${data.assignee}`);
  if (data.inventor) lines.push(`Inventor:    ${data.inventor}`);
  if (data.priority_date) lines.push(`Priority:    ${data.priority_date}`);
  if (data.filing_date) lines.push(`Filed:       ${data.filing_date}`);

  if (data.abstract) {
    lines.push('');
    lines.push('Abstract');
    lines.push('--------');
    lines.push(data.abstract);
  }

  if (data.claims && data.claims.length > 0) {
    lines.push('');
    lines.push(`Claims (${data.claims.length})`);
    lines.push('----------');
    data.claims.forEach((claim, i) => {
      lines.push(`${i + 1}. ${claim}`);
    });
  }

  if (data.description) {
    lines.push('');
    lines.push('Description');
    lines.push('-----------');
    lines.push(data.description);
  }

  if (data.family_members && data.family_members.length > 0) {
    lines.push('');
    lines.push(`Family Members (${data.family_members.length})`);
    lines.push('------------------');
    data.family_members.forEach((m) => {
      lines.push(`${m.patent_id}  ${m.region}  ${m.status}`);
    });
  }

  if (data.citations) {
    lines.push('');
    lines.push('Citations');
    lines.push('---------');
    const parts: string[] = [];
    parts.push(`Forward: ${data.citations.forward_citations}`);
    parts.push(`Backward: ${data.citations.backward_citations}`);
    if (data.citations.family_to_family_citations !== undefined) {
      parts.push(
        `Family-to-Family: ${data.citations.family_to_family_citations}`
      );
    }
    lines.push(parts.join('  '));
  }

  return lines.join('\n');
}
