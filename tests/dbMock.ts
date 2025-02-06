import { jest } from '@jest/globals';
import type { QueryResult } from 'pg';
import type { PoolClient } from 'pg';

export const mockQuery = jest.fn<(query: string, ...args: any[]) => Promise<QueryResult<any>>>();
export const mockGetClient = jest.fn<() => Promise<PoolClient>>();

export const fakeQueryResult: QueryResult = {
  rows: [],
  rowCount: 0,
  command: '',
  oid: 0,
  fields: [],
};

// Set default mock implementation for query
mockQuery.mockImplementation((query: string, ...args: any[]) => {
  // For checking existing addresses, return empty result
  if (query.includes('SELECT id FROM tree_requests WHERE street_address')) {
    return Promise.resolve({ ...fakeQueryResult, rows: [] });
  }
  // For other queries, return default empty result
  return Promise.resolve(fakeQueryResult);
});

export default { query: mockQuery, getClient: mockGetClient };
