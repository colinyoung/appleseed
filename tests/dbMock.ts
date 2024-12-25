import { jest } from '@jest/globals';
import type { QueryResult } from 'pg';

export const mockQuery = jest.fn();
export const mockGetClient = jest.fn();

jest.mock('../db.js', () => ({
  query: mockQuery,
  getClient: mockGetClient,
}));
