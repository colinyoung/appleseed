from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from playwright.async_api import async_playwright
import asyncio
import random
import os

app = FastAPI()

class TreeRequest(BaseModel):
    address: str
    numTrees: int = 1
    location: str = "Parkway"

async def random_delay():
    delay = random.uniform(0.5, 1.0)
    await asyncio.sleep(delay)

async def plant_tree(request: TreeRequest):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        try:
            await page.goto(
                "https://311.chicago.gov/s/new-service-request?typecodeid=a1Pt0000000Q7gBEAS&language=en_US"
            )
            
            # Enter and select address
            await page.get_by_placeholder("Please enter an address").click()
            await page.get_by_placeholder("Please enter an address").fill(request.address)
            await random_delay()
            
            try:
                await page.locator("div[role=listbox]").get_by_text(
                    request.address, exact=False
                ).click()
            except Exception as e:
                await browser.close()
                return {"success": False, "error": f"Address not found: {str(e)}"}
            
            await page.get_by_role("button", {"name": "Confirm Address"}).click()
            await random_delay()
            
            # Fill in tree details
            where = await page.get_by_label("*1. Where would you like the")
            await where.click()
            where_text = "Parkway along long side of building" if request.numTrees > 2 else request.location
            await where.fill(where_text)
            
            await page.get_by_label("2. How many trees are you").click()
            await page.get_by_label("2. How many trees are you").fill(str(request.numTrees))
            await random_delay()
            
            # Submit the request
            await page.get_by_role("button", {"name": "next"}).click()
            await page.get_by_role("button", {"name": "next"}).click()
            await random_delay()
            await page.get_by_role("button", {"name": "Finish"}).click()
            
            # Get the SR number
            text_elem = await page.get_by_text(
                "Your service request has been submitted, and your number is"
            )
            inner_text = await text_elem.inner_text()
            
            if inner_text:
                sr_number = inner_text.split()[-1].replace(".", "")
                await browser.close()
                return {
                    "success": True,
                    "sr_number": sr_number,
                    "address": request.address,
                    "numTrees": request.numTrees,
                    "location": where_text
                }
            
            await browser.close()
            return {"success": False, "error": "Could not get SR number"}
            
        except Exception as e:
            await browser.close()
            return {"success": False, "error": str(e)}

@app.post("/plant-tree")
async def create_tree_request(request: TreeRequest):
    result = await plant_tree(request)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)