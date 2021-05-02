const puppeteer = require('puppeteer');
const fs = require("fs");

const fun = async () => {

    const NO_OF_POSTS = 35;
    const IG_HANDLE = "smartenergyw"

    try{
        const browser = await puppeteer.launch({headless:false});
        const page = await browser.newPage();     
        await page.setDefaultNavigationTimeout(0); 
        const ig = await page.goto('https://www.instagram.com/' + IG_HANDLE)
        await page.waitForSelector('footer');
        const items = await scrapeIGPosts(page, extractItems, NO_OF_POSTS);
        fs.writeFileSync("../ig-widget/postURLs.json", JSON.stringify({postURLs : items}));
        await browser.close();
    }
    catch(e){
        console.log("Error " + e.message)
    }
}

//Function to define what items to extract
const extractItems = () => {
    const extractedElements = document.querySelectorAll('a');
    const items = [];
    for (let link of extractedElements) {
        if(link.href.includes("/p/"))
            items.push(link.href)
        }
    return items;
}

//Function to scroll to bottom of the page
const scrapeIGPosts = async (
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 1000,
  ) => {
    let items = [];
    try {
        let previousHeight;
        while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitForTimeout(scrollDelay);
        }
    } 
    catch(e) {
        console.log("Error in scrapeInfinteScrollItems " + e.message)
    }
    return items;
}

fun();

