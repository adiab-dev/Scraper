const puppeteer = require('puppeteer');

const sites = [
  {
    name: 'Xcite',
    url: 'https://www.xcite.com',
    searchInput: '.aa-Input',
    searchType: 'click',
    searchButton: '.aa-SubmitButton',
    itemSelector: '.col-span-2.sm\\:col-span-4.sp\\:col-span-3.md\\:col-span-4.lg\\:col-span-3.xl\\:col-span-2.relative.flex.text-center.product',
    titleSelector: 'p',
    priceSelector: 'h4 span',
    gotoOptions: {},
  },
  {
    name: 'Best',
    url: 'https://www.best.com.kw',
    searchInput: '[placeholder="Search here..."]',
    searchType: 'enter',
    itemSelector: '.col-lg-3.col-md-4.col-sm-6.ng-star-inserted',
    titleSelector: '.cx-product-name',
    priceSelector: '.cx-product-price',
    gotoOptions: { waitUntil: 'domcontentloaded', timeout: 60000 },
  },
  {
    name: 'Eureka',
    url: 'https://www.eureka.com.kw',
    searchInput: '[placeholder="Search for Products, Brands and More"]',
    searchType: 'enter',
    itemSelector: '.ais-Hits-item',
    titleSelector: '.sobrTxt',
    priceSelector: '.mb5.borred',
    gotoOptions: { waitUntil: 'networkidle2', timeout: 60000 },
  },
];

async function scrapeSite(searchQuery, browser, config) {
  const page = await browser.newPage();
  try {
    await page.goto(config.url, config.gotoOptions);

    await page.waitForSelector(config.searchInput, { timeout: 60000 });
    await page.type(config.searchInput, searchQuery);

    if (config.searchType === 'click') {
      await page.click(config.searchButton);
      await page.waitForNavigation();
    } else {
      try {
        await page.keyboard.press('Enter');
      } catch (error) {
        console.error(`Failed to press Enter on ${config.name}:`, error.message);
        await page.evaluate(() => {
          document.querySelector('form')?.submit();
        });
      }
    }

    await page.waitForSelector(config.itemSelector, { timeout: 60000 });

    const products = await page.evaluate((config) => {
      const results = [];
      const items = document.querySelectorAll(config.itemSelector);

      items.forEach(item => {
        const title = item.querySelector(config.titleSelector)?.textContent.trim();
        const priceText = item.querySelector(config.priceSelector)?.textContent.trim();
        if (title && priceText) {
          const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
          if (!isNaN(price)) {
            results.push({ title, price, site: config.name });
          }
        }
      });

      return results;
    }, config);

    return products;
  } catch (error) {
    console.error(`Scraping ${config.name} failed:`, error.message);
    return [];
  } finally {
    await page.close();
  }
}

async function scrapeAll(searchQuery) {
  const browser = await puppeteer.launch({ headless: true });

  const results = await Promise.all(
    sites.map(config => scrapeSite(searchQuery, browser, config))
  );

  await browser.close();
  return results.flat().sort((a, b) => a.price - b.price);
}

module.exports = { scrapeAll };
