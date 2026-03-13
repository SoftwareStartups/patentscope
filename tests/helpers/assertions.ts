/**
 * Custom assertions for patent data validation
 */

import type { PatentData, SerpApiResponse } from '../../src/types.js';

export function assertValidSearchResponse(data: SerpApiResponse): void {
  if (!data.search_metadata) {
    throw new Error('Response missing search_metadata');
  }

  if (!data.search_parameters) {
    throw new Error('Response missing search_parameters');
  }

  if (
    data.search_metadata?.status &&
    data.search_metadata.status !== 'Success'
  ) {
    throw new Error(`SerpApi search status: ${data.search_metadata.status}`);
  }
}

export function assertValidPatentData(data: PatentData): void {
  if (!data.patent_id && !data.title && !data.publication_number) {
    throw new Error('Patent data missing identifying information');
  }
}

export function assertHasMetadata(data: PatentData): void {
  if (!data.title || !data.publication_number) {
    throw new Error('Patent data missing required metadata fields');
  }
}

export function assertHasAbstract(data: PatentData): void {
  if (!data.abstract) {
    throw new Error('Patent data missing abstract');
  }
}
