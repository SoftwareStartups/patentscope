import type { Logger } from '../logger.js';
import type {
  SearchPatentsArgs,
  SerpApiPatentDetailsResponse,
  SerpApiResponse,
} from '../types.js';

export class SerpApiClient {
  private readonly apiKey: string;
  private readonly logger: Logger;
  private readonly timeoutMs: number;
  private readonly baseUrl: string;

  constructor(
    apiKey: string,
    logger: Logger,
    timeoutMs = 30000,
    baseUrl = 'https://serpapi.com'
  ) {
    this.apiKey = apiKey;
    this.logger = logger;
    this.timeoutMs = timeoutMs;
    this.baseUrl = baseUrl;
  }

  async searchPatents(args: SearchPatentsArgs): Promise<SerpApiResponse> {
    const { q, ...otherParams } = args;
    const query = q || '';

    const params = new URLSearchParams({ engine: 'google_patents', q: query });
    for (const [key, value] of Object.entries(otherParams)) {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    }

    return this.fetchJson<SerpApiResponse>(params, `query "${query}"`);
  }

  async getPatentDetails(
    patentId: string
  ): Promise<SerpApiPatentDetailsResponse> {
    const params = new URLSearchParams({
      engine: 'google_patents_details',
      patent_id: patentId,
    });

    return this.fetchJson<SerpApiPatentDetailsResponse>(
      params,
      `patent "${patentId}"`
    );
  }

  private async fetchJson<T>(
    params: URLSearchParams,
    label: string
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const logUrl = `${this.baseUrl}/search.json?${params.toString()}`;
      this.logger.info(`Calling SerpApi for ${label}: ${logUrl}`);

      params.set('api_key', this.apiKey);
      const apiUrl = `${this.baseUrl}/search.json?${params.toString()}`;

      const response = await fetch(apiUrl, { signal: controller.signal });

      if (!response.ok) {
        const errorBody = await this.getErrorBody(response);
        this.logger.error(
          `SerpApi request failed for ${label} with status ${response.status} ${response.statusText}. Response body: ${errorBody}`
        );
        throw new Error(
          `SerpApi request failed: ${response.statusText}. Body: ${errorBody}`
        );
      }

      const data = (await response.json()) as T;
      this.logger.info(`SerpApi request successful for ${label}`);
      this.logger.debug(`SerpApi response status: ${response.status}`);

      clearTimeout(timeoutId);
      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          `SerpApi request timed out after ${this.timeoutMs}ms for ${label}`
        );
        throw new Error('SerpApi request timed out');
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error during SerpApi fetch for ${label}: ${errorMessage}`
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      throw new Error(`An unexpected error occurred: ${errorMessage}`);
    }
  }

  private async getErrorBody(response: Response): Promise<string> {
    try {
      return await response.text();
    } catch (bodyError) {
      this.logger.warn(
        `Failed to read error response body: ${bodyError instanceof Error ? bodyError.message : String(bodyError)}`
      );
      return 'Could not retrieve error body.';
    }
  }
}
