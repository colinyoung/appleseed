export const mockQuery = jest.fn();
export const mockGetClient = jest.fn();

jest.mock('../db.js', () => ({
  query: (...args) => mockQuery(...args),
  getClient: (...args) => mockGetClient(...args)
}));