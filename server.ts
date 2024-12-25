import express from 'express';
import { plantTree } from './plantTree.js';

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
