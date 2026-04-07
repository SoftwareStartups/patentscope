export class SerpApiError extends Error {
  readonly statusCode: number | undefined;
  readonly userMessage: string;

  constructor(
    userMessage: string,
    options?: { statusCode?: number; cause?: unknown }
  ) {
    super(userMessage);
    this.name = 'SerpApiError';
    this.userMessage = userMessage;
    this.statusCode = options?.statusCode;
    this.cause = options?.cause;
  }
}

export class CliError extends Error {
  readonly userMessage: string;
  readonly exitCode: number;

  constructor(
    userMessage: string,
    options?: { exitCode?: number; cause?: unknown }
  ) {
    super(userMessage);
    this.name = 'CliError';
    this.userMessage = userMessage;
    this.exitCode = options?.exitCode ?? 1;
    this.cause = options?.cause;
  }
}

export function sanitizeErrorMessage(message: string): string {
  if (/<(!DOCTYPE|html|head|body)/i.test(message)) {
    return 'Server returned an HTML error page. Check your API key and network connection.';
  }
  if (message.length > 500) {
    return `${message.slice(0, 500)}... (truncated)`;
  }
  return message;
}

export function serpApiErrorMessage(statusCode: number): string {
  if (statusCode === 401 || statusCode === 403) {
    return 'Authentication failed. Check your API key or run: patentscope login';
  }
  if (statusCode === 429) {
    return 'Rate limit exceeded. Try again later.';
  }
  if (statusCode >= 500) {
    return `SerpApi server error (HTTP ${statusCode}). Try again later.`;
  }
  return `SerpApi request failed (HTTP ${statusCode}).`;
}
