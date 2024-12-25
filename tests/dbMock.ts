import { jest } from '@jest/globals';
import type { QueryResult } from 'pg';

export const mockQuery = jest.fn<() => Promise<QueryResult<any>>>();
export const mockGetClient = jest.fn();

export const fakeQueryResult: QueryResult = {
  rows: [],
  rowCount: 0,
  command: '',
  oid: 0,
  fields: [],
};
