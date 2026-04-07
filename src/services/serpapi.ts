import {
  SerpApiError,
  sanitizeErrorMessage,
  serpApiErrorMessage,
} from '../errors.js';
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
        const { errorDetail, rawBody } = await this.parseErrorBody(response);
        this.logger.error(
          `SerpApi request failed for ${label} with status ${response.status} ${response.statusText}. Detail: ${errorDetail}. Raw body: ${rawBody}`
        );
        const userMessage = serpApiErrorMessage(response.status);
        throw new SerpApiError(userMessage, { statusCode: response.status });
      }

      let data: T;
      try {
        data = (await response.json()) as T;
      } catch (parseError: unknown) {
        this.logger.error(
          `SerpApi returned non-JSON response for ${label} (status ${response.status})`
        );
        throw new SerpApiError(
          'SerpApi returned unexpected non-JSON response.',
          { statusCode: response.status, cause: parseError }
        );
      }

      this.logger.info(`SerpApi request successful for ${label}`);
      this.logger.debug(`SerpApi response status: ${response.status}`);

      return data;
    } catch (error: unknown) {
      if (error instanceof SerpApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          `SerpApi request timed out after ${this.timeoutMs}ms for ${label}`
        );
        throw new SerpApiError('SerpApi request timed out.');
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error during SerpApi fetch for ${label}: ${errorMessage}`
      );
      throw new SerpApiError(sanitizeErrorMessage(errorMessage), {
        cause: error,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parseErrorBody(
    response: Response
  ): Promise<{ errorDetail: string; rawBody: string }> {
    try {
      const text = await response.text();
      try {
        const json: unknown = JSON.parse(text);
        if (
          typeof json === 'object' &&
          json !== null &&
          'error' in json &&
          typeof (json as Record<string, unknown>).error === 'string'
        ) {
          return {
            errorDetail: (json as Record<string, unknown>).error as string,
            rawBody: text.slice(0, 500),
          };
        }
        return { errorDetail: text.slice(0, 200), rawBody: text.slice(0, 500) };
      } catch {
        return {
          errorDetail: '(non-JSON response)',
          rawBody: text.slice(0, 500),
        };
      }
    } catch (bodyError: unknown) {
      this.logger.warn(
        `Failed to read error response body: ${bodyError instanceof Error ? bodyError.message : String(bodyError)}`
      );
      return {
        errorDetail: 'Could not retrieve error body.',
        rawBody: '',
      };
    }
  }
}
