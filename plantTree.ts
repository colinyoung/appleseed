import { BrowserType } from 'playwright';
import { logDebug, logError, logInfo } from './logger';
import { DB } from './db';
import { PlantTreeRequest } from './server';

export type PlantTreeResult = {
  success: boolean;
  message: string;
  error?: string;
  srNumber?: string;
};

const delay = () => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  const ms = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
  logDebug(`Delaying for ${ms}ms`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const maxDelay = 500;
const minDelay = 50;

const DEFAULT_TIMEOUT = 5000;

export async function plantTree(chromium: BrowserType<{}>, db: DB, request: PlantTreeRequest) {
  validateRequest(request);
  const { address, numTrees = 1, location } = request;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    acceptDownloads: false,
  });
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

    await page.getByPlaceholder('Please enter an address').click({ timeout: DEFAULT_TIMEOUT });
    await page
      .getByPlaceholder('Please enter an address')
      .fill(address, { timeout: DEFAULT_TIMEOUT });
    await delay();
    logDebug('Filled address');

    try {
      await page
        .locator('div[role=listbox]')
        .getByText(new RegExp(`^${address}`, 'i'))
        .first()
        .click({ timeout: DEFAULT_TIMEOUT });
      logDebug('Clicked address');
    } catch (e) {
      logError('Error clicking address', e);
      await browser.close();
      return {
        success: false,
        message: `Invalid address: ${address}`,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }

    await page.getByRole('button', { name: 'Confirm Address' }).click({ timeout: DEFAULT_TIMEOUT });
    await delay();
    logDebug('Clicked confirm address');

    const where = await page.getByLabel('*1. Where would you like the');
    await where.click({ timeout: DEFAULT_TIMEOUT });
    logDebug('Clicked where');

    await where.fill(locationText);
    await page.getByLabel('2. How many trees are you').click({ timeout: DEFAULT_TIMEOUT });
    await page
      .getByLabel('2. How many trees are you')
      .fill(numTrees.toString(), { timeout: DEFAULT_TIMEOUT });
    await delay();
    logDebug('Filled number of trees');

    await page.getByRole('button', { name: 'next' }).click({ timeout: DEFAULT_TIMEOUT });
    await page.getByRole('button', { name: 'next' }).click({ timeout: DEFAULT_TIMEOUT });
    await delay();
    logDebug('Clicked next');
    await page.getByRole('button', { name: 'Finish' }).click({ timeout: DEFAULT_TIMEOUT });
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
    throw error;
  } finally {
    await browser.close();
  }
}

function validateRequest(request: PlantTreeRequest) {
  if (!request.address) {
    throw new Error('Address is required');
  }
  if (request.numTrees && (request.numTrees < 1 || request.numTrees > 10)) {
    throw new Error('Number of trees must be between 1 and 10');
  }
  if (request.location && request.location.length > 50) {
    throw new Error('Location must be less than 50 characters');
  }
  if (request.address.match(/[^a-zA-Z0-9\s]/)) {
    throw new Error('Address must contain only letters, numbers, and spaces');
  }

  if (
    !request.address.match(
      /([0-9]{1,5}) (([NESW]) ([\w ]+) (ave|st|blvd|rd|dr|ln|pl|ct|pkwy|expwy|hwy|cir|ter|way|sq|aly|byp|trl|row|mnr|cres|brg|grn|pth|cv|hvn|fld|isle|rte)|n broadway)/i,
    )
  ) {
    throw new Error(
      'Address must be in the format of "12345 N/S/E/W StreetName Ave/St/etc", e.g. "1 S State St". You sent: ' +
        request.address,
    );
  }
}
