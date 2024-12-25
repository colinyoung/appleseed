import { jest } from '@jest/globals';
import { mockQuery } from './dbMock.js';

// Mock Playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn(),
          getByPlaceholder: jest.fn().mockReturnValue({
            click: jest.fn(),
            fill: jest.fn(),
          }),
          locator: jest.fn().mockReturnValue({
            getByText: jest.fn().mockReturnValue({
              click: jest.fn(),
            }),
          }),
          getByRole: jest.fn().mockReturnValue({
            click: jest.fn(),
          }),
          getByLabel: jest.fn().mockReturnValue({
            click: jest.fn(),
            fill: jest.fn(),
            innerText: jest
              .fn()
              .mockResolvedValue(
                'Your service request has been submitted, and your number is 12345.',
              ),
          }),
          getByText: jest.fn().mockReturnValue({
            innerText: jest
              .fn()
              .mockResolvedValue(
                'Your service request has been submitted, and your number is 12345.',
              ),
          }),
        }),
      }),
      close: jest.fn(),
    }),
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
    jest.mock('playwright', () => ({
      chromium: {
        launch: jest.fn().mockResolvedValue({
          newContext: jest.fn().mockResolvedValue({
            newPage: jest.fn().mockResolvedValue({
              goto: jest.fn(),
              getByPlaceholder: jest.fn().mockReturnValue({
                click: jest.fn(),
                fill: jest.fn(),
              }),
              locator: jest.fn().mockReturnValue({
                getByText: jest.fn().mockReturnValue({
                  click: mockClick,
                }),
              }),
              close: jest.fn(),
            }),
          }),
          close: jest.fn(),
        }),
      },
    }));

    const { plantTree } = await import('../plantTree.js');
    const result = await plantTree('Invalid Address');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid address');
  });
});
