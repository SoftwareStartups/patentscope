import { describe, expect, it } from 'bun:test';
import {
  CliError,
  SerpApiError,
  sanitizeErrorMessage,
  serpApiErrorMessage,
} from '../../src/errors.js';

describe('SerpApiError', () => {
  it('carries statusCode and userMessage', () => {
    const err = new SerpApiError('Auth failed', { statusCode: 401 });
    expect(err.statusCode).toBe(401);
    expect(err.userMessage).toBe('Auth failed');
    expect(err.message).toBe('Auth failed');
    expect(err.name).toBe('SerpApiError');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('CliError', () => {
  it('carries userMessage and default exitCode', () => {
    const err = new CliError('Bad input');
    expect(err.userMessage).toBe('Bad input');
    expect(err.exitCode).toBe(1);
    expect(err.name).toBe('CliError');
    expect(err).toBeInstanceOf(Error);
  });

  it('accepts custom exitCode', () => {
    const err = new CliError('Fatal', { exitCode: 2 });
    expect(err.exitCode).toBe(2);
  });
});

describe('sanitizeErrorMessage', () => {
  it('strips HTML error pages', () => {
    const html = '<!DOCTYPE html><html><body><h1>Error</h1></body></html>';
    const result = sanitizeErrorMessage(html);
    expect(result).not.toContain('<html');
    expect(result).toContain('HTML error page');
  });

  it('strips messages containing <body tag', () => {
    const msg = 'Error: <body>some content</body>';
    expect(sanitizeErrorMessage(msg)).toContain('HTML error page');
  });

  it('truncates long messages', () => {
    const long = 'a'.repeat(600);
    const result = sanitizeErrorMessage(long);
    expect(result.length).toBeLessThan(520);
    expect(result).toContain('(truncated)');
  });

  it('passes through normal messages unchanged', () => {
    expect(sanitizeErrorMessage('Something went wrong')).toBe(
      'Something went wrong'
    );
  });
});

describe('serpApiErrorMessage', () => {
  it('returns auth message for 401', () => {
    expect(serpApiErrorMessage(401)).toContain('Authentication failed');
  });

  it('returns auth message for 403', () => {
    expect(serpApiErrorMessage(403)).toContain('Authentication failed');
  });

  it('returns rate limit message for 429', () => {
    expect(serpApiErrorMessage(429)).toContain('Rate limit');
  });

  it('returns server error for 5xx', () => {
    expect(serpApiErrorMessage(500)).toContain('server error');
    expect(serpApiErrorMessage(503)).toContain('server error');
  });

  it('returns generic message for other codes', () => {
    const msg = serpApiErrorMessage(400);
    expect(msg).toContain('400');
    expect(msg).toContain('request failed');
  });
});
