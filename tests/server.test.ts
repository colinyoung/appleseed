import { jest } from '@jest/globals';

const plantTreeMock =
  jest.fn<
    (request: PlantTreeRequest) => Promise<{ success: boolean; srNumber: string; message: string }>
  >();
jest.mock('../plantTree', () => ({
  plantTree: plantTreeMock,
}));

// Now do imports
import request from 'supertest';
import { app, PlantTreeRequest } from '../server';

describe('Server API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require address', async () => {
    const response = await request(app).post('/plant-tree').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('address is required');
  });

  it('should plant a tree with default values', async () => {
    const mockResult = { success: true, srNumber: '123', message: 'Tree planted' };

    const response = await request(app).post('/plant-tree').send({ address: '123 Main St' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(plantTreeMock).toHaveBeenCalledWith('123 Main St', 1, 'Parkway');
  });

  it('should plant trees with custom values', async () => {
    const mockResult = { success: true, srNumber: '123', message: 'Trees planted' };
    plantTreeMock.mockResolvedValue(mockResult as any);

    const response = await request(app).post('/plant-tree').send({
      address: '123 Main St',
      numTrees: 2,
      location: 'Side of building',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(plantTreeMock).toHaveBeenCalledWith('123 Main St', 2, 'Side of building');
  });

  it('should handle planting errors', async () => {
    const error = new Error('Planting failed');
    plantTreeMock.mockRejectedValue(error);

    const response = await request(app).post('/plant-tree').send({ address: '123 Main St' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Planting failed');
    expect(response.body.success).toBe(false);
  });
});
