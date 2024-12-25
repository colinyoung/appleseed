import { chromium } from 'playwright';
import { query } from './db';

export type PlantTreeResult = {
  success: boolean;
  message: string;
  error?: string;
  srNumber?: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const maxDelay = 1000;
const minDelay = 500;

export async function plantTree(address: string, numTrees = 1, description = 'Parkway') {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log(`Planting ${numTrees} tree(s) at ${address}`);
  console.log(`Location: ${description}`);

  try {
    // Check if address exists in database
    const existingRequest = await query('SELECT id FROM tree_requests WHERE street_address = $1', [
      address,
    ]);

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
    console.log('Filled address');

    try {
      await page
        .locator('div[role=listbox]')
        .getByText(new RegExp(`^${address}`, 'i'))
        .click();
      console.log('Clicked address');
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
    console.log('Clicked confirm address');

    const where = await page.getByLabel('*1. Where would you like the');
    await where.click();
    console.log('Clicked where');

    const whereText = numTrees > 2 ? 'Parkway along long side of building' : description;
    await where.fill(whereText);
    await page.getByLabel('2. How many trees are you').click();
    await page.getByLabel('2. How many trees are you').fill(numTrees.toString());
    await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
    console.log('Filled number of trees');

    await page.getByRole('button', { name: 'next' }).click();
    await page.getByRole('button', { name: 'next' }).click();
    await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
    console.log('Clicked next');
    await page.getByRole('button', { name: 'Finish' }).click();
    console.log('Clicked finish');
    const text = await page.getByText(
      'Your service request has been submitted, and your number is',
    );
    const innerText = await text.innerText();

    if (innerText) {
      const srNumber = innerText.split(' ').pop()?.replace('.', '');

      // Store in database
      await query(
        `INSERT INTO tree_requests 
                 (sr_number, street_address, num_trees, location)
                 VALUES ($1, $2, $3, $4)`,
        [srNumber, address, numTrees, whereText],
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
