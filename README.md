# Scraper

A full-stack **Node.js + Puppeteer** web scraper that allows users to compare product prices in real-time across major Kuwaiti e-commerce platforms (Xcite, Best, and Eureka).

## Features
- Scrapes product data from 3 different Kuwaiti retailers simultaneously
- Returns unified results sorted by price
- Simple web interface for easy testing
- Status of each search is displayed in both the frontend and the backend
- Built with Express.js backend and vanilla JavaScript frontend

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
or use the already existing UI at `http://localhost:3000`

## Challenges Overcome
- Handling different website structures
- Managing asynchronous scraping across multiple sites
- Ensuring reliable data extraction despite dynamic content loading
