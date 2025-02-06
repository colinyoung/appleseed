import { jest } from '@jest/globals';
import dbMock, { mockQuery } from './dbMock';
import { QueryResult } from 'pg';

import { plantTree, PlantTreeResult } from '../plantTree';
import { PlantTreeRequest } from '../server';
import { BrowserType } from 'playwright';
import { getRandomValidAddress } from './util';

const plantTreeMock = jest.fn<(request: PlantTreeRequest) => Promise<PlantTreeResult>>();

const LAT = 41.8781;
const LNG = -87.6298;

jest.mock('../plantTree', () => ({
  plantTree: plantTreeMock,
}));

// Mock Playwright
const mockLocator = {
  click: jest.fn<any>(),
  first: jest.fn<any>().mockReturnValue({
    click: jest.fn<any>(),
  }),
  fill: jest.fn<any>(),
  innerText: jest
    .fn<any>()
    .mockResolvedValue('Your service request has been submitted, and your number is 12345.'),
};

const mockPage = {
  goto: jest.fn(),
  getByPlaceholder: jest.fn().mockReturnValue(mockLocator),
  locator: jest.fn().mockReturnValue({
    getByText: jest.fn().mockReturnValue(mockLocator),
  }),
  getByRole: jest.fn().mockReturnValue(mockLocator),
  getByLabel: jest.fn().mockReturnValue(mockLocator),
  getByText: jest.fn().mockReturnValue(mockLocator),
};

const mockContext = {
  newPage: jest.fn<any>().mockResolvedValue(mockPage),
};

const mockBrowser = {
  newContext: jest.fn<any>().mockResolvedValue(mockContext),
  close: jest.fn(),
};

const chromiumMock: BrowserType<{}> = {
  launch: jest.fn<any>().mockResolvedValue(mockBrowser),
} as unknown as BrowserType<{}>;

describe('Plant Tree Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check for existing address', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 1 }] } as QueryResult);

    const result = await plantTree(chromiumMock, dbMock, {
      address: '333 S Shields Ave',
      lat: LAT,
      lng: LNG,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id FROM tree_requests'),
      ['333 S Shields Ave'],
    );
  });

  it('should plant a tree successfully', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult); // no existing address
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as QueryResult); // successful insert

    const address = getRandomValidAddress();

    const result = await plantTree(chromiumMock, dbMock, {
      address,
      numTrees: 2,
      location: 'Side of building',
      lat: LAT,
      lng: LNG,
    });

    expect(result.success).toBe(true);
    expect(result.srNumber).toBe('12345');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO tree_requests'), [
      '12345',
      address,
      2,
      'Side of building',
      LAT,
      LNG,
    ]);
  });

  it('should handle invalid addresses', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult); // no existing address

    // Mock Playwright to simulate address not found
    const mockClick = jest.fn<any>().mockRejectedValue(new Error('Address not found'));
    mockPage.locator = jest.fn<any>().mockReturnValue({
      getByText: jest.fn<any>().mockReturnValue({
        click: mockClick,
      }),
    });

    try {
      await plantTree(chromiumMock, dbMock, {
        address: 'Invalid address',
        lat: LAT,
        lng: LNG,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Address must be in the format of');
    }
  });
});
