import { readApiKeyFromConfig } from './utils/config-file.js';

export interface Config {
  serpApiKey: string;
  serpApiBaseUrl: string;
  logLevel: string;
}

export const getConfig = (): Config => {
  const serpApiKey = process.env.SERPAPI_API_KEY || readApiKeyFromConfig();

  if (!serpApiKey) {
    throw new Error(
      'SerpApi API key not found. Set SERPAPI_API_KEY environment variable or run: patentscope login'
    );
  }

  return {
    serpApiKey,
    serpApiBaseUrl: process.env.SERPAPI_BASE_URL || 'https://serpapi.com',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
};
