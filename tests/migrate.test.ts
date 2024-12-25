jest.mock('../db', () => ({
  query: mockQuery,
  getClient: jest.fn(),
}));

import { jest } from '@jest/globals';
import mockFs from 'mock-fs';
import { mockQuery, fakeQueryResult } from './dbMock';

import { migrate } from '../migrate';
import { QueryResult } from 'pg';

describe('Database Migrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs({
      'srNumbers.csv': `SR Number,Address,Requested Date,Number Of Trees,Description
123,456 Main St,2024-01-01,2,Parkway
456,789 Oak St,2024-01-02,1,Side of building`,
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should create required tables', async () => {
    mockQuery.mockResolvedValueOnce({ ...fakeQueryResult, rows: [] }); // migrations table check
    mockQuery.mockResolvedValueOnce(fakeQueryResult); // create migrations table
    mockQuery.mockResolvedValueOnce(fakeQueryResult); // create tree_requests table
    mockQuery.mockResolvedValueOnce(fakeQueryResult); // create index 1
    mockQuery.mockResolvedValueOnce(fakeQueryResult); // create index 2
    mockQuery.mockResolvedValueOnce(fakeQueryResult); // record migration

    await migrate();

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'),
      [],
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS tree_requests'),
      [],
    );
  });

  it('should import existing data from CSV', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as QueryResult); // migrations already done
    mockQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult); // no existing records

    await migrate();

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO tree_requests'), [
      '123',
      '456 Main St',
      2,
      'Parkway',
      expect.any(Date),
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO tree_requests'), [
      '456',
      '789 Oak St',
      1,
      'Side of building',
      expect.any(Date),
    ]);
  });

  it('should skip already executed migrations', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as QueryResult); // migration exists

    await migrate();

    expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE'), []);
  });
});
