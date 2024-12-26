import express, { Request, RequestHandler, Response } from 'express';
import { plantTree } from './plantTree';

export interface PlantTreeRequest {
  streetAddress: string;
  numTrees?: number;
  location?: string;
}

export const app = express();
app.use(express.json());

const plantTreeHandler = async (req: Request<{}, any, PlantTreeRequest>, res: Response) => {
  const { streetAddress, numTrees, location } = req.body;

  if (!streetAddress) {
    return res.status(400).json({ error: 'streetAddress is required' });
  }

  try {
    const result = await plantTree(streetAddress, numTrees ?? 1, location ?? 'Parkway');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    });
  }
};

app.post('/plant-tree', plantTreeHandler as RequestHandler);

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
