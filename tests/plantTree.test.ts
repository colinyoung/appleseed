import { jest } from '@jest/globals';
import { mockQuery } from './dbMock';
import type { Browser, BrowserContext, Page, Locator } from 'playwright';

// Mock Playwright
const mockLocator = {
  click: jest.fn(),
  fill: jest.fn(),
  innerText: jest.fn().mockResolvedValue(
    'Your service request has been submitted, and your number is 12345.',
  ),
} as jest.Mocked<Locator>;

const mockPage = {
  goto: jest.fn(),
  getByPlaceholder: jest.fn().mockReturnValue(mockLocator),
  locator: jest.fn().mockReturnValue({
    getByText: jest.fn().mockReturnValue(mockLocator),
  }),
  getByRole: jest.fn().mockReturnValue(mockLocator),
  getByLabel: jest.fn().mockReturnValue(mockLocator),
  getByText: jest.fn().mockReturnValue(mockLocator),
} as jest.Mocked<Page>;

const mockContext = {
  newPage: jest.fn().mockResolvedValue(mockPage),
} as jest.Mocked<BrowserContext>;

const mockBrowser = {
  newContext: jest.fn().mockResolvedValue(mockContext),
  close: jest.fn(),
} as jest.Mocked<Browser>;

jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue(mockBrowser),
  },
}));

describe('Plant Tree Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check for existing address', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const { plantTree } = await import('../plantTree.js');
    const result = await plantTree('123 Main St');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id FROM tree_requests'),
      ['123 Main St'],
    );
  });

  it('should plant a tree successfully', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // no existing address
    mockQuery.mockResolvedValueOnce({}); // successful insert

    const { plantTree } = await import('../plantTree.js');
    const result = await plantTree('123 Main St', 2, 'Side of building');

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
    mockQuery.mockResolvedValueOnce({ rows: [] }); // no existing address

    // Mock Playwright to simulate address not found
    const mockClick = jest.fn().mockRejectedValue(new Error('Address not found'));
    mockPage.locator = jest.fn().mockReturnValue({
      getByText: jest.fn().mockReturnValue({
        click: mockClick,
      }),
    });

    const { plantTree } = await import('../plantTree.js');
    const result = await plantTree('Invalid Address');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid address');
  });
});
