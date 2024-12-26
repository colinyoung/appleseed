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

export default { query: mockQuery, getClient: mockGetClient };
