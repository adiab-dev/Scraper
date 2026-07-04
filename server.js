const express = require('express');
const cors = require('cors');
const path = require('path');
const { scrapeAll } = require('./frontend/scrape');  // Import all scraping functions

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

// Endpoint to handle scraping requests
app.post('/scrape', async (req, res) => {
    // Validate the request body
    const { searchQuery } = req.body;
    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    console.log("Received search query:", searchQuery);

    try {
        console.log("Starting scraping...");

        // Call the scrapeAll function to scrape all sites concurrently
        const products = await scrapeAll(searchQuery);

        console.log("Scraping completed, sending results...");
        res.json(products);
    } catch (error) {
        console.error("Scraping failed:", error);
        res.status(500).json({ error: "Scraping error" });
    }
});

// Start the server at localhost:3000
app.listen(3000, () => console.log('Server running on http://localhost:3000'));