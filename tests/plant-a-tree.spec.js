// @ts-check
import os from "os";
import { test } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maxDelay = 1000;
const minDelay = 500;
const randomDelay = Math.floor(Math.random() * (maxDelay - 500 + 1) + minDelay);

const filename = "./srNumbers.csv";

// parse csv file 'trees-to-plant.csv' into array
const file = fs.readFileSync("./trees-to-plant.csv", "utf8");

// interface Tree {
//   houseNumber: String;
//   street: String;
//   numTrees?: Number;
//   description?: String;
// }

async function getRecords() {
  return new Promise((resolve, reject) => {
    parse(
      file,
      {
        columns: true,
        skip_empty_lines: true,
        ltrim: true,
        relax_column_count: true,
      },
      (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(data);
      }
    );
  });
}

async function getTrees() {
  const trees = await getRecords();

  const requests = trees.map((line) => {
    const address = [line.houseNumber, line.street].join(" ");
    const numTrees = line.numTrees;
    const description = line.description;

    // parse csv accounting for double quotes to escape

    return {
      address,
      numTrees: numTrees ? parseInt(numTrees) : undefined,
      description,
    };
  });
  console.log("Trees to plant: ", trees.length);
  return requests;
}

test("test", async ({ page }) => {
  const requests = await getTrees();

  let i = 0;
  for (const { address, numTrees = 1, description } of requests) {
    i++;
    if (!address.trim()) break;
    // Make sure tsv file doens't contain address
    console.log(
      `Planting ${numTrees} ${numTrees > 1 ? "trees" : "tree"} at ${address}. ${
        description ? `Description: ${description}` : ""
      }`
    );
    if (fs.readFileSync(filename, "utf8").includes(address)) {
      console.log(`Skipping ${address}`);
      continue;
    }

    await page.goto(
      "https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US"
    );
    await page.getByPlaceholder("Please enter an address").click();
    await page.getByPlaceholder("Please enter an address").fill(address);
    await delay(randomDelay); // <-- here we wait 3s

    try {
      await page
        .locator("div[role=listbox]")
        .getByText(new RegExp(`^${address}`, "i"))
        .click();
    } catch (e) {
      console.log("Address had an issue!!!!! ", address, e);
      continue;
    }

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
    // await page.getByRole("button", { name: "Finish" }).click();
    const text = await page.getByText(
      "Your service request has been submitted, and your number is"
    );
    const innerText = await text.innerText();
    if (innerText) {
      // @ts-ignore
      const srNumber = innerText.split(" ").pop().replace(".", "");
      console.log("Planted! SR# Number: ", srNumber);
      try {
        fs.readFileSync(filename, "utf8").startsWith("SR Number");
      } catch (e) {
        fs.writeFileSync(
          filename,
          "SR Number,Address,Requested Date,Requested Time,Number Of Trees,Description\n"
        );
      }
      const date = new Date().toLocaleString();
      fs.appendFileSync(
        filename,
        `${srNumber},${address},${date},${numTrees},${
          description ? description : whereText
        }\n`
      );
    }
    console.log(requests.length - i, "requests left");
    await delay(randomDelay); // <-- here we wait 3s
  }
});
