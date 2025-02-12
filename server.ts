import express, { Request, RequestHandler, Response } from 'express';
import cors from 'cors';
import db, { DB } from './db';
import { plantTree } from './plantTree';
import { chromium, BrowserType } from 'playwright';
import { PoolClient, QueryResult } from 'pg';
import { logError } from './logger';

export interface PlantTreeRequest {
  address: string;
  numTrees?: number;
  location?: string;
  lat: number;
  lng: number;
  alreadyExists?: boolean;
}

// Add new type for dependencies
export type Dependencies = {
  db: DB;
  chromium: BrowserType<{}>;
};

// Create app factory function
export function createApp(deps?: Dependencies) {
  const app = express();

  // Use provided deps or fallback to real implementations
  const dependencies = deps || {
    db,
    chromium,
  };

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
      const result = await plantTree(dependencies.chromium, dependencies.db, {
        address,
        numTrees,
        location,
        lat,
        lng,
      });
      res.json(result);
    } catch (error) {
      logError('Error planting tree', error);
      const status = (error as Error).name === 'InvalidAddressError' ? 400 : 500;
      res.status(status).json({
        error: (error as Error).message,
        success: false,
      });
    }
  };

  app.post('/tree-requests', plantTreeHandler as RequestHandler);

  return app;
}

// Create default app instance
export const app = createApp();

// Start server only if not in test mode
const port = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
