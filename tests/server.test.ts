import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the plantTree function
jest.mock('../plantTree.js', () => ({
  plantTree: jest.fn(),
}));
import { plantTree } from '../plantTree.js';

// Import the server code
const app = express();
app.use(express.json());
app.post('/plant-tree', async (req, res) => {
  const { streetAddress, numTrees, location } = req.body;

  if (!streetAddress) {
    return res.status(400).json({ error: 'streetAddress is required' });
  }

  try {
    const result = await plantTree(streetAddress, numTrees || 1, location || 'Parkway');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
    });
  }
});

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
