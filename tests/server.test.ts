import { jest } from '@jest/globals';
import request from 'supertest';
import type { PlantTreeResult } from '../plantTree';

// Mock the plantTree function
jest.mock('../plantTree');

// Import the server code
import { app } from '../server';
import { plantTree } from '../plantTree';

// Cast the mock
const mockPlantTree = plantTree as jest.MockedFunction<typeof plantTree>;

describe('Server API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require streetAddress', async () => {
    const response = await request(app).post('/plant-tree').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('streetAddress is required');
  });

  it('should plant a tree with default values', async () => {
    const mockResult = { success: true, srNumber: '123', message: 'Tree planted' };
    plantTree.mockResolvedValue(mockResult);

    const response = await request(app).post('/plant-tree').send({ streetAddress: '123 Main St' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(plantTree).toHaveBeenCalledWith('123 Main St', 1, 'Parkway');
  });

  it('should plant trees with custom values', async () => {
    const mockResult = { success: true, srNumber: '123', message: 'Trees planted' };
    plantTree.mockResolvedValue(mockResult);

    const response = await request(app).post('/plant-tree').send({
      streetAddress: '123 Main St',
      numTrees: 2,
      location: 'Side of building',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(plantTree).toHaveBeenCalledWith('123 Main St', 2, 'Side of building');
  });

  it('should handle planting errors', async () => {
    const error = new Error('Planting failed');
    plantTree.mockRejectedValue(error);

    const response = await request(app).post('/plant-tree').send({ streetAddress: '123 Main St' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Planting failed');
    expect(response.body.success).toBe(false);
  });
});
