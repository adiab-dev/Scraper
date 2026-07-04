const express = require('express');
const cors = require('cors');
const path = require('path');
const { scrapeAll } = require('./frontend/scrape');  // Import all scraping functions

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

app.post('/scrape', async (req, res) => {
    const { searchQuery } = req.body;
    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    console.log("Received search query:", searchQuery);

    try {
        console.log("Starting scraping...");
        const products = await scrapeAll(searchQuery);
        console.log("Scraping completed, sending results...");
        res.json(products);
    } catch (error) {
        console.error("Scraping failed:", error);
        res.status(500).json({ error: "Scraping error" });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));