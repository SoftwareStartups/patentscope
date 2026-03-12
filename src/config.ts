import * as dotenv from 'dotenv';

dotenv.config();

export interface Config {
  serpApiKey: string;
  serpApiBaseUrl: string;
  logLevel: string;
}

export const getConfig = (): Config => {
  const serpApiKey = process.env.SERPAPI_API_KEY;

  if (!serpApiKey) {
    throw new Error('SERPAPI_API_KEY environment variable is not set.');
  }

  return {
    serpApiKey,
    serpApiBaseUrl: process.env.SERPAPI_BASE_URL || 'https://serpapi.com',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
};
