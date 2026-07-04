# Scraper

A Node.js web scraping server that searches product prices across multiple Kuwaiti e-commerce sites (Xcite, Best, Eureka) using Puppeteer.

## How to Install

1. Fork the repository on GitHub.
2. Clone your fork:
   ```
   git clone https://github.com/YOUR_USERNAME/scraper.git
   cd scraper
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Install the required Chrome browser for Puppeteer:
   ```
   npx puppeteer browsers install chrome
   ```

## How to Run

```
npm start
```

The server starts at `http://localhost:3000`. Send a POST request to `/scrape` with a JSON body:

```json
{
  "searchQuery": "laptop"
}
```
