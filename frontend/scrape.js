const puppeteer = require('puppeteer');


//array that holds information about websites to scrape
const sites = [
  {
    name: 'Xcite',
    url: 'https://www.xcite.com',

    //the element that holds the search input field
    searchInput: '.aa-Input',
    searchType: 'click',

    //the element that holds the search button
    searchButton: '.aa-SubmitButton',

    //the element that holds the product items
    itemSelector: '.col-span-2.sm\\:col-span-4.sp\\:col-span-3.md\\:col-span-4.lg\\:col-span-3.xl\\:col-span-2.relative.flex.text-center.product',
    
    //the element that holds the product title
    titleSelector: 'p',

    //the element that holds the product price
    priceSelector: 'h4 span',


    //the element that holds the product URL
    URLSelector: '', //Empty, Xcite website unavailable at time of writing this code.

    //empty, uses puppeteer defaults
    gotoOptions: {},
  },
  {
    name: 'Best',
    url: 'https://www.best.com.kw',

    //the element that holds the search input field
    searchInput: '[placeholder="Search here..."]',
    searchType: 'enter',

    //the element that holds the product items
    itemSelector: '.col-lg-3.col-md-4.col-sm-6.ng-star-inserted',
    
    //the element that holds the product title
    titleSelector: '.cx-product-name',

    //the element that holds the product price
    priceSelector: '.cx-product-price',

    //the element that holds the product URL
    URLSelector: '.cx-product-name a',

    //waits until the DOM content is loaded before proceeding, with a timeout of 60 seconds
    gotoOptions: { waitUntil: 'domcontentloaded', timeout: 60000 },
  },
  {
    name: 'Eureka',
    url: 'https://www.eureka.com.kw',

    //the element that holds the search input field
    searchInput: '[placeholder="Search for Products, Brands and More"]',
    searchType: 'enter',

    //the element that holds the product items
    itemSelector: '.ais-Hits-item',

    //the element that holds the product title
    titleSelector: '.sobrTxt',

    //the element that holds the product price
    priceSelector: '.mb5.borred',

    //the element that holds the product URL
    URLSelector: '.ais-Hits-item a',

    //waits until there are no more than 2 network connections before proceeding, with a timeout of 60 seconds, domcontentloaded is not used as this is a single page website with content loaded dynamically
    gotoOptions: { waitUntil: 'networkidle2', timeout: 60000 },
  },
];

//Main scraping function
async function scrapeSite(searchQuery, browser, config) {
  // Create a new page for each site to avoid interference
  const page = await browser.newPage();
  try {
    // Navigate to the site and wait for the search input to be available
    await page.goto(config.url, config.gotoOptions);
    await page.waitForSelector(config.searchInput, { timeout: 60000 });

    // Type the search query into the search input field
    await page.type(config.searchInput, searchQuery);

    // Depending on the searchType, either click the search button or press Enter
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

    // Wait for the product items to be available
    await page.waitForSelector(config.itemSelector, { timeout: 60000 });

    // Extract product information from the page
    const products = await page.evaluate((config) => {
      const results = [];
      const items = document.querySelectorAll(config.itemSelector);

      items.forEach(item => {
        const title = item.querySelector(config.titleSelector)?.textContent.trim();
        const priceText = item.querySelector(config.priceSelector)?.textContent.trim();

        let link = null;
        if (config.URLSelector) {
          const element = item.querySelector(config.URLSelector);
          if (element) {
            link = element.href || element.getAttribute('href');
          }
          else{
            //fallback: find any link in the element
            const fallbackLink = item.querySelector('a');
            if (fallbackLink) {
              link = fallbackLink.href || fallbackLink.getAttribute('href');
            }
          }
        }

        // Ensure that both title and price are available before adding to results
        if (title && priceText) {
          const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

          // Only add the product if the price is a valid number
          if (!isNaN(price)) {
            results.push({ title, price, site: config.name, link: link});
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
  // Launch a single browser instance for all sites to improve performance
  const browser = await puppeteer.launch({ headless: true });

  // Use Promise.all to scrape all sites concurrently
  const results = await Promise.all(
    sites.map(config => scrapeSite(searchQuery, browser, config))
  );

  await browser.close();

  // Flatten the results and sort by price in ascending order
  return results.flat().sort((a, b) => a.price - b.price);
}

// Export the scrapeAll function for use in server.js
module.exports = { scrapeAll };