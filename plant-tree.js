const { chromium } = require('playwright');

const randomDelay = () => {
    const min = 500;
    const max = 1000;
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, delay));
};

async function plantTree({ address, numTrees = 1, location = 'Parkway' }) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto(
            'https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US'
        );

        // Enter and select address
        await page.getByPlaceholder('Please enter an address').click();
        await page.getByPlaceholder('Please enter an address').fill(address);
        await randomDelay();

        try {
            await page
                .locator('div[role=listbox]')
                .getByText(new RegExp(`^${address}`, 'i'))
                .click();
        } catch (e) {
            await browser.close();
            return { 
                success: false, 
                error: `Address not found: ${address}` 
            };
        }

        await page.getByRole('button', { name: 'Confirm Address' }).click();
        await randomDelay();

        // Fill in tree details
        const where = await page.getByLabel('*1. Where would you like the');
        await where.click();
        const whereText = numTrees > 2 ? 'Parkway along long side of building' : location;
        await where.fill(whereText);

        await page.getByLabel('2. How many trees are you').click();
        await page.getByLabel('2. How many trees are you').fill(numTrees.toString());
        await randomDelay();

        // Submit the request
        await page.getByRole('button', { name: 'next' }).click();
        await page.getByRole('button', { name: 'next' }).click();
        await randomDelay();
        await page.getByRole('button', { name: 'Finish' }).click();

        // Get the SR number
        const text = await page.getByText(
            'Your service request has been submitted, and your number is'
        );
        const innerText = await text.innerText();

        if (innerText) {
            const srNumber = innerText.split(' ').pop().replace('.', '');
            await browser.close();
            return {
                success: true,
                sr_number: srNumber,
                address,
                numTrees,
                location: whereText
            };
        }

        await browser.close();
        return { 
            success: false, 
            error: 'Could not get SR number' 
        };

    } catch (error) {
        await browser.close();
        return { 
            success: false, 
            error: error.message 
        };
    }
}

module.exports = { plantTree };