import { chromium } from 'playwright';
import fs from 'fs';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const maxDelay = 1000;
const minDelay = 500;
const filename = "./srNumbers.csv";

export async function plantTree(address, numTrees = 1, description = 'Parkway') {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        if (fs.readFileSync(filename, "utf8").includes(address)) {
            await browser.close();
            return { 
                success: false, 
                message: `Address ${address} already exists in records` 
            };
        }
    } catch (e) {
        // File doesn't exist, create it
        fs.writeFileSync(
            filename,
            "SR Number,Address,Requested Date,Requested Time,Number Of Trees,Description\n"
        );
    }

    try {
        await page.goto(
            "https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US"
        );
        
        await page.getByPlaceholder("Please enter an address").click();
        await page.getByPlaceholder("Please enter an address").fill(address);
        await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));

        try {
            await page
                .locator("div[role=listbox]")
                .getByText(new RegExp(`^${address}`, "i"))
                .click();
        } catch (e) {
            await browser.close();
            return { 
                success: false, 
                message: `Invalid address: ${address}`,
                error: e.message
            };
        }

        await page.getByRole("button", { name: "Confirm Address" }).click();
        await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));

        const where = await page.getByLabel("*1. Where would you like the");
        await where.click();

        const whereText = numTrees > 2 ? "Parkway along long side of building" : description;
        await where.fill(whereText);
        await page.getByLabel("2. How many trees are you").click();
        await page.getByLabel("2. How many trees are you").fill(numTrees.toString());
        await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
        
        await page.getByRole("button", { name: "next" }).click();
        await page.getByRole("button", { name: "next" }).click();
        await delay(Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay));
        
        await page.getByRole("button", { name: "Finish" }).click();
        
        const text = await page.getByText(
            "Your service request has been submitted, and your number is"
        );
        const innerText = await text.innerText();
        
        if (innerText) {
            const srNumber = innerText.split(" ").pop().replace(".", "");
            const date = new Date().toLocaleString();
            fs.appendFileSync(
                filename,
                `${srNumber},${address},${date},${numTrees},${whereText}\n`
            );
            
            await browser.close();
            return { 
                success: true,
                srNumber,
                message: `Successfully planted ${numTrees} tree(s) at ${address}`
            };
        }
        
        await browser.close();
        return {
            success: false,
            message: "Failed to get service request number"
        };
        
    } catch (error) {
        await browser.close();
        return {
            success: false,
            message: "Error during tree planting process",
            error: error.message
        };
    }
}