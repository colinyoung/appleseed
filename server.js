const express = require('express');
const { plantTree } = require('./plant-tree');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.post('/plant-tree', async (req, res) => {
    try {
        const { address, numTrees = 1, location = 'Parkway' } = req.body;
        
        if (!address) {
            return res.status(400).json({ success: false, error: 'Address is required' });
        }

        const result = await plantTree({ address, numTrees, location });
        res.json(result);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});