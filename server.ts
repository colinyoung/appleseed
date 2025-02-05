import express, { Request, RequestHandler, Response } from 'express';
import cors from 'cors';
import db from './db';
import { plantTree } from './plantTree';
import { chromium } from 'playwright';

export interface PlantTreeRequest {
  address: string;
  numTrees?: number;
  location?: string;
  lat: number;
  lng: number;
  alreadyExists?: boolean;
}

export const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', ...(process.env.ALLOWED_ORIGINS?.split(',') ?? [])],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

const plantTreeHandler = async (req: Request<{}, any, PlantTreeRequest>, res: Response) => {
  const { address, numTrees, location, lat, lng } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }

  try {
    const result = await plantTree(chromium, db, { address, numTrees, location, lat, lng });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    });
  }
};

app.post('/tree-requests', plantTreeHandler as RequestHandler);

const port = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
