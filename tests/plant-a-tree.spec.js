// @ts-check
import { test } from "@playwright/test";
import fs from "fs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maxDelay = 3000;
const minDelay = 500;
const randomDelay = Math.floor(Math.random() * (maxDelay - 500 + 1) + minDelay);

const filename = "./srNumbers.csv";

// parse csv file 'trees-to-plant.csv' into array
const requests = fs
  .readFileSync("./trees-to-plant.csv", "utf8")
  .split("\n")
  .map((line) => {
    const [houseNumber, street, numTrees, description] = line.split(",");
    return {
      address: `${houseNumber.trim()} ${street.trim()}`,
      numTrees: numTrees ? parseInt(numTrees) : undefined,
      description,
    };
  });


test("test", async ({ page }) => {
  for (const { address, numTrees = 1, description } of requests) {
    // Make sure tsv file doens't contain address
    console.log(`Planting ${numTrees} ${numTrees > 1 ? "trees" : "tree"} at ${address}`);
    if (fs.readFileSync(filename, "utf8").includes(address)) {
      console.log(`Skipping ${address}`)
      continue;
    }

    await page.goto(
      "https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US"
    );
    await page.getByPlaceholder("Please enter an address").click();
    await page.getByPlaceholder("Please enter an address").fill(address);
    await delay(randomDelay); // <-- here we wait 3s

    await page
      .locator("div[role=listbox]")
      .getByText(new RegExp(`^${address}`))
      .click();

    await page.getByRole("button", { name: "Confirm Address" }).click();
    await delay(randomDelay); // <-- here we wait 3s

    const where = await page.getByLabel("*1. Where would you like the");
    await where.click();

    const whereText =
      numTrees > 2 ? "Parkway along long side of building" : "Parkway";
    await where.fill(description || whereText);
    await page.getByLabel("2. How many trees are you").click();
    await page
      .getByLabel("2. How many trees are you")
      .fill(numTrees.toString());
    await delay(randomDelay); // <-- here we wait 3s
    await page.getByRole("button", { name: "next" }).click();
    await page.getByRole("button", { name: "next" }).click();
    await delay(randomDelay); // <-- here we wait 3s
    await page.getByRole("button", { name: "Finish" }).click();
    const text = await page.getByText(
      "Your service request has been submitted, and your number is"
    );
    const innerText = await text.innerText();
    if (innerText) {
      // @ts-ignore
      const srNumber = innerText.split(" ").pop().replace(".", "");
      try {
        fs.readFileSync(filename, "utf8").startsWith("SR Number");
      } catch (e) {
        fs.writeFileSync(filename, "SR Number,Address,Requested Date,Requested Time,Number Of Trees\n");
      }
      const date = new Date().toLocaleString();
      fs.appendFileSync(filename, `${srNumber},${address},${date},${numTrees}\n`);
    }
    await delay(randomDelay); // <-- here we wait 3s
  }
});
