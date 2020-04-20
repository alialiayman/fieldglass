const puppeteer = require('puppeteer');


let page;
let websiteUrl = 'https://fieldglass.net';
const userName = 'alialiayman';
const password = '(Paris!@#)';
const responses = [];
const steps = new Map();

automate();

async function automate() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    page = await browser.newPage();
    // page.on('domcontentloaded', onPageLoaded);
    //page.on('response', onResponse);
    await page.setViewport({
        width: 0,
        height: 0
    });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });
    await typeText('#usernameId_new', userName);
};


async function typeText(selector, value) {
    await page.waitForSelector(selector);
    await page.$eval(selector, el => el.value = '');
    await page.type(selector, value);
}
async function selectByValue(selector, value) {
    try {
        await page.waitForSelector(selector);
        await page.select(selector, value);
    } catch  { };
}
async function selectByText(selector, value) {
    try {
        const textValueId = await page.evaluate((p) => {
            try {
                const options = document.querySelectorAll(p[0] + ' > option');
                for (i = 0; i < options.length; i++) {
                    if (options[i].innerText === p[1]) {
                        return options[i].value;
                    }

                }
                return '';
            } catch (ex) {
                console.log(ex);
            }
        }, [selector, value]);

        if (textValueId) {
            await page.waitForSelector(selector);
            await page.select(selector, textValueId);
        }
    } catch (ex) {
        console.log(ex);
    }
}
