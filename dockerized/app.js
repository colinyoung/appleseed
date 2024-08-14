const { chromium } = require("playwright");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maxDelay = 1000;
const minDelay = 500;
const randomDelay = 0;

const plantTree = async ({ streetAddress: address, location, count }) => {
  console.log(
    `Planting ${count} ${count > 1 ? "trees" : "tree"} at ${address}. ${
      location ? `Location: ${location}` : ""
    }`
  );

  let page;
  try {
    const browser = await chromium.launch({
      args: [
        "--autoplay-policy=user-gesture-required",
        "--disable-background-networking",
      ],
    });
    console.log("Browser launched");
    const context = await browser.newContext();
    console.log("Context created");
    page = await context.newPage();
    console.log("Page created");
  } catch (e) {
    console.log("error", e.message);
    console.error(e);
    return false;
  }

  await page.goto(
    "https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US"
  );

  console.log("Page loaded");

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
    return false;
  }
  console.log(page.locator("div[role=listbox]").textContent());
  console.log("Address selected: ", address);

  await page.getByRole("button", { name: "Confirm Address" }).click();
  await delay(randomDelay); // <-- here we wait 3s

  const where = await page.getByLabel("*1. Where would you like the");
  await where.click();

  const whereText =
    count > 2 ? "Parkway along long side of building" : "Parkway";
  await where.fill(location || whereText);
  await page.getByLabel("2. How many trees are you").click();
  await page.getByLabel("2. How many trees are you").fill(count.toString());
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
    console.log("Planted! SR# Number: ", srNumber);
    return { srNumber };
  }
};

const handler = async (event, context) => {
  const response = await plantTree({
    streetAddress: event.street_address,
    description: event.description,
    count: event.count,
  });
  if (!response) {
    return { status: 500 };
  }
  return response;
};

module.exports = { handler };
