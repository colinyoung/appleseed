import { BrowserType } from 'playwright';
import { logDebug, logInfo } from './logger';
import { DB } from './db';
import { PlantTreeRequest } from './server';

export type PlantTreeResult = {
  success: boolean;
  message: string;
  error?: string;
  srNumber?: string;
};

const delay = (ms: number) => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  logDebug(`Delaying for ${ms}ms`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const maxDelay = 1000;
const minDelay = 500;

export async function plantTree(chromium: BrowserType<{}>, db: DB, request: PlantTreeRequest) {
  const { address, numTrees = 1, location } = request;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  logDebug(`Planting ${numTrees} tree(s) at ${address}`);
  const locationText =
    location ?? (numTrees > 2 ? 'Parkway along long side of building' : 'Parkway');
  logDebug(`Location: ${locationText}`);

  try {
    // Check if address exists in database
    const existingRequest = await db.query(
      'SELECT id FROM tree_requests WHERE street_address = $1',
      [address],
    );

    if (existingRequest.rows.length > 0) {
      await browser.close();
      return {
        success: false,
        message: `Address ${address} already exists in records`,
      };
    }
    await page.goto(
      'https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US',
    );

    await page.getByPlaceholder('Please enter an address').click();
    await page.getByPlaceholder('Please enter an address').fill(address);
    await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
    logDebug('Filled address');

    try {
      await page
        .locator('div[role=listbox]')
        .getByText(new RegExp(`^${address}`, 'i'))
        .click();
      logDebug('Clicked address');
    } catch (e) {
      await browser.close();
      return {
        success: false,
        message: `Invalid address: ${address}`,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }

    await page.getByRole('button', { name: 'Confirm Address' }).click();
    await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
    logDebug('Clicked confirm address');

    const where = await page.getByLabel('*1. Where would you like the');
    await where.click();
    logDebug('Clicked where');

    await where.fill(locationText);
    await page.getByLabel('2. How many trees are you').click();
    await page.getByLabel('2. How many trees are you').fill(numTrees.toString());
    await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
    logDebug('Filled number of trees');

    await page.getByRole('button', { name: 'next' }).click();
    await page.getByRole('button', { name: 'next' }).click();
    await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
    logDebug('Clicked next');
    await page.getByRole('button', { name: 'Finish' }).click();
    logDebug('Clicked finish');
    const text = await page.getByText(
      'Your service request has been submitted, and your number is',
    );
    const innerText = await text.innerText();

    if (innerText) {
      const srNumber = innerText.split(' ').pop()?.replace('.', '');
      logInfo(`Created SR number: ${srNumber}`);

      // Store in database
      await db.query(
        `INSERT INTO tree_requests 
                 (sr_number, street_address, num_trees, location)
                 VALUES ($1, $2, $3, $4)`,
        [srNumber, address, numTrees, locationText],
      );

      await browser.close();
      return {
        success: true,
        srNumber,
        message: `Successfully planted ${numTrees} tree(s) at ${address}`,
      };
    }

    await browser.close();
    return {
      success: false,
      message: 'Failed to get service request number',
    };
  } catch (error) {
    await browser.close();
    return {
      success: false,
      message: 'Error during tree planting process',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
