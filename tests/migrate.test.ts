import { jest } from '@jest/globals';
import dbMock, { fakeQueryResult } from './dbMock';
import mockFs from 'mock-fs';
import { migrate } from '../migrate';
import { QueryResult } from 'pg';
import { Console } from 'console';

describe('Database Migrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // https://stackoverflow.com/a/77035848
    console = new Console(process.stdout, process.stderr);

    mockFs({
      'srNumbers.csv': `SR Number,Address,Zip Code,Requested Date,Request Time,Number Of Trees,Location,Confirmed Planted
    123,456 Main St,60647,2024-01-01,5:08:45 PM,2,Parkway,Yes
    456,789 Oak St,60647,2024-01-02,5:08:45 PM,1,Side of building,No`,
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should create required tables', async () => {
    dbMock.query.mockResolvedValue(fakeQueryResult); // record migration

    await migrate(dbMock);

    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'),
      [],
    );
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS tree_requests'),
      [],
    );
  });

  it('should import existing data from CSV', async () => {
    dbMock.query.mockImplementation((query: string, ...args: any[]) => {
      if (query.includes('SELECT id FROM migrations')) {
        return Promise.resolve({ rows: [{ id: 1 }] } as QueryResult); // migrations already done
      }
      return Promise.resolve({ rows: [] } as unknown as QueryResult); // default response
    });

    const numMigrations = await migrate(dbMock);

    const firstInsert = dbMock.query.mock.calls[numMigrations + 1];
    expect(firstInsert).toEqual(
      expect.arrayContaining([
        expect.stringContaining('INSERT INTO tree_requests'),
        expect.arrayContaining(['123', '456 Main St', undefined, 2, 'Parkway']),
      ]),
    );
    const secondInsert = dbMock.query.mock.calls[numMigrations + 3];
    expect(secondInsert).toEqual(
      expect.arrayContaining([
        expect.stringContaining('INSERT INTO tree_requests'),
        expect.arrayContaining(['456', '789 Oak St', undefined, 1, 'Side of building']),
      ]),
    );
  });

  it('should skip already executed migrations', async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [{ id: 1 }] } as QueryResult); // migration exists

    await migrate(dbMock);

    expect(dbMock.query).not.toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE'), []);
  });
});
