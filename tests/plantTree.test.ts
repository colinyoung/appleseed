import { jest } from '@jest/globals';
import dbMock, { mockQuery } from './dbMock';
import { QueryResult } from 'pg';

import { plantTree, PlantTreeResult } from '../plantTree';
import { PlantTreeRequest } from '../server';
import { BrowserType } from 'playwright';

const plantTreeMock = jest.fn<(request: PlantTreeRequest) => Promise<PlantTreeResult>>();

jest.mock('../plantTree', () => ({
  plantTree: plantTreeMock,
}));

// Mock Playwright
const mockLocator = {
  click: jest.fn<any>(),
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

    const result = await plantTree(chromiumMock, dbMock, { address: '123 Main St' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id FROM tree_requests'),
      ['123 Main St'],
    );
  });

  it('should plant a tree successfully', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult); // no existing address
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as QueryResult); // successful insert

    const result = await plantTree(chromiumMock, dbMock, {
      address: '123 Main St',
      numTrees: 2,
      location: 'Side of building',
    });

    expect(result.success).toBe(true);
    expect(result.srNumber).toBe('12345');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO tree_requests'), [
      '12345',
      '123 Main St',
      2,
      'Side of building',
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

    const result = await plantTree(chromiumMock, dbMock, { address: 'Invalid address' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid address');
  });
});
