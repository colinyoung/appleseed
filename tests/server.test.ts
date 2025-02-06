import request from 'supertest';
import { jest } from '@jest/globals';
import { createApp, PlantTreeRequest } from '../server';
import { getRandomValidAddress } from './util';
import dbMock, { fakeQueryResult } from './dbMock';
import type { BrowserType, Browser, BrowserContext, Page, Locator } from 'playwright';
import type { Express } from 'express';
import type { DB } from '../db';
import { PlantTreeResult } from '../plantTree';

const plantTreeMock =
  jest.fn<
    (chromium: BrowserType<{}>, db: DB, request: PlantTreeRequest) => Promise<PlantTreeResult>
  >();

jest.mock('../plantTree', () => ({
  plantTree: plantTreeMock,
}));

const LAT = 41.8781;
const LNG = -87.6298;

const mockLocator = {
  click: jest.fn<any>().mockResolvedValue(undefined),
  first: jest.fn<any>().mockReturnValue({
    click: jest.fn<any>().mockResolvedValue(undefined),
  }),
  fill: jest.fn<any>().mockResolvedValue(undefined),
  innerText: jest
    .fn<any>()
    .mockResolvedValue('Your service request has been submitted, and your number is 12345.'),
};

const mockPage = {
  goto: jest.fn<any>().mockResolvedValue(undefined),
  getByPlaceholder: jest.fn<any>().mockReturnValue(mockLocator),
  locator: jest.fn<any>().mockReturnValue({
    getByText: jest.fn<any>().mockReturnValue(mockLocator),
  }),
  getByRole: jest.fn<any>().mockReturnValue(mockLocator),
  getByLabel: jest.fn<any>().mockReturnValue(mockLocator),
  getByText: jest.fn<any>().mockReturnValue(mockLocator),
  close: jest.fn<any>().mockResolvedValue(undefined),
} as unknown as Page;

const mockContext = {
  newPage: jest.fn<any>().mockResolvedValue(mockPage),
  close: jest.fn<any>().mockResolvedValue(undefined),
} as unknown as BrowserContext;

const mockBrowser = {
  newContext: jest.fn<any>().mockResolvedValue(mockContext),
  close: jest.fn<any>().mockResolvedValue(undefined),
} as unknown as Browser;

const chromiumMock = {
  launch: jest.fn<any>().mockResolvedValue(mockBrowser),
} as unknown as BrowserType<{}>;

describe('Server API', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp({ db: dbMock, chromium: chromiumMock });
  });

  it('should require address', async () => {
    const response = await request(app).post('/tree-requests').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('address is required');
  });

  it('should plant a tree with default values', async () => {
    const address = getRandomValidAddress();
    const mockResult = {
      success: true,
      srNumber: '12345',
      message: `Successfully planted 1 tree(s) at ${address}`,
    };

    const response = await request(app).post('/tree-requests').send({
      address,
      lat: LAT,
      lng: LNG,
    });

    expect(response.body).toEqual(mockResult);
    expect(response.status).toBe(200);
  });

  it('should plant trees with custom values', async () => {
    const address = getRandomValidAddress();
    const mockResult = {
      success: true,
      srNumber: '12345',
      message: `Successfully planted 2 tree(s) at ${address}`,
    };

    const response = await request(app).post('/tree-requests').send({
      address,
      numTrees: 2,
      location: 'Side of building',
      lat: LAT,
      lng: LNG,
    });

    expect(response.body).toEqual(mockResult);
    expect(response.status).toBe(200);
  });

  it('should handle planting errors', async () => {
    const response = await request(app)
      .post('/tree-requests')
      .send({ address: '123 Main St', lat: LAT, lng: LNG });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should handle duplicate addresses', async () => {
    // Mock the query to return an existing record
    const existingAddress = getRandomValidAddress();
    dbMock.query.mockImplementationOnce((query: string, params: any[]) => {
      if (query.includes('SELECT id FROM tree_requests WHERE street_address')) {
        return Promise.resolve({
          ...fakeQueryResult,
          rows: [{ id: 1 }],
        });
      }
      return Promise.resolve(fakeQueryResult);
    });

    const response = await request(app).post('/tree-requests').send({
      address: existingAddress,
      lat: LAT,
      lng: LNG,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: false,
      message: `Address ${existingAddress} already exists in records`,
      alreadyExists: true,
    });
  });
});
