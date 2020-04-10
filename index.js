const puppeteer = require('puppeteer');
const fs = require('fs');
const { DateTime } = require('luxon');


let page;
let mutamers;
let currentMutamer;
let pax;
let currentMutamerIndex = 0;
// let tawafWebSite = 'http://tawaf.com.sa'; 
let tawafWebSite = 'http://www.etawaf.com:8181';
const responses = [];
const steps = new Map();

automate();

async function automate() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    page = await browser.newPage();
    // page.on('domcontentloaded', onPageLoaded);
    page.on('response', onResponse);
    await page.setViewport({
        width: 1280,
        height: 1024,
        deviceScaleFactor: 2,
    });
    // set user agent (override the default headless User Agent)
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    if (!mutamers) {
        fs.readFile('./Mutamers.json', (err, data) => {
            if (err) throw err;
            mutamers = JSON.parse(data);
            pax = parseInt(mutamers.pax);
        });
    }
    await page.exposeFunction('pasteCurrentMutamer', async (currentMutamer) => {
        try {
            scanCurrentMutamer();
        } catch (ex) {
            console.log(ex);
        }

    });
    await page.exposeFunction('pasteCurrentMutamerBlur', async (currentMutamer) => {
        try {
            scanCurrentMutamer(true);
        } catch (ex) {
            console.log(ex);
        }

    });
    await page.exposeFunction('nextMutamer', async () => {
        try {
            movetoNextMutamer();
        } catch (ex) {
            console.log(ex);
        }

    });
    await page.exposeFunction('previousMutamer', async () => {
        try {
            movetoPreviousMutamer();
        } catch (ex) {
            console.log(ex);
        }

    });
    steps.set('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > input', login);
    const response = await page.goto(tawafWebSite + '/tawaf41/index.html?locale=en', { waitUntil: 'domcontentloaded' });
};


async function login() {
    await page.waitForSelector('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(7)');
    await page.evaluate((p) => {

        let dom = document.querySelector('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(7)');


        dom.innerHTML = `<td style="height: 300px">Extra Space</td>`
    });
    // const usernameElement = await page.selector('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > input');
    if (mutamers.twfUsername) {
        await typeText('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > input', mutamers.twfUsername);
    }
    // const passwordElement = await page.selector('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td:nth-child(2) > input');
    if (mutamers.twfPassword) {
        await typeText('#login > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td:nth-child(2) > input', mutamers.twfPassword);
    }
    if (steps.keys()) {
        steps.delete(steps.keys().next().value);
        steps.set('#leftMenu > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > div', clickOperation);
    }
}

async function clickOperation() {
    await page.click('#leftMenu > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > div');
    await page.waitForSelector('#leftMenu > table > tbody > tr > td > table > tbody > tr:nth-child(5) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > a > table > tbody > tr > td:nth-child(2)');
    await page.click('#leftMenu > table > tbody > tr > td > table > tbody > tr:nth-child(5) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > a > table > tbody > tr > td:nth-child(2)');

    await page.waitForSelector('#gwt-uid-11 > table > tbody > tr > td > div');
    await page.click('#gwt-uid-11 > table > tbody > tr > td > div');


    const selector = '#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(1) > table > tbody';
    const selectorValue = await page.waitForSelector(selector);
    if (selectorValue != null) {
        const data = fs.readFileSync('./Mutamers.json');
        const mutamersObject = JSON.parse(data);
        if (!mutamersObject.mutamerIndex) {
            mutamersObject.mutamerIndex = 0;
        }
        if (mutamersObject.mutamerIndex >= mutamersObject.pax) {
            return;
        }
        await displayButtons(mutamersObject);
    }

    await page.waitForSelector('body > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(5)');
    await page.evaluate((p) => {

        let dom = document.querySelector('body > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(5)');


        dom.innerHTML = dom.innerHTML + `<div style="height: 300px">Extra Space</div>`
    });

    if (steps.keys()) {
        steps.delete(steps.keys().next().value);
    }
}



async function onResponse(res) {
    const url = await res.url();
    responses.push(url);
    if (!steps) {
        return;
    }
    const firstKey = steps.keys().next().value;
    const firstValue = steps.values().next().value;
    if (steps.size) {
        setTimeout((pUrl, pselector, pfnc) => {
            if (pUrl === responses[responses.length - 1]) { //This is the last response in 2 seconds - no responses came after the last one
                execOnLastResponse(pselector, pfnc);

            }
        }, 2000, responses[responses.length - 1], firstKey, firstValue);

    }
}

async function scanCurrentMutamer(useBlur) {
    const data = fs.readFileSync('./Mutamers.json');
    const mutamersObject = JSON.parse(data);
    if (!mutamersObject.mutamerIndex) {
        mutamersObject.mutamerIndex = 0;
    }
    const thisMutamer = mutamersObject.mutamers[mutamersObject.mutamerIndex];
    if (thisMutamer.ArabicFirstName) {
        await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > input', decodeURI(thisMutamer.ArabicFirstName));
    }
    if (thisMutamer.ArabicFatherName) {
        await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input', decodeURI(thisMutamer.ArabicFatherName));
    }
    if (thisMutamer.ArabicGrandName) {
        await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > input', decodeURI(thisMutamer.ArabicGrandName));
    }
    if (thisMutamer.ArabicLastName) {
        await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(4) > input', decodeURI(thisMutamer.ArabicLastName));
    }
    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(10) > td:nth-child(4) > table > tbody > tr > td:nth-child(1) > input', decodeURI(thisMutamer.Occupation));

    // await selectByValue('#ddlmstatus', '99');
    // await selectByValue('#ddleducation', '99');
    // await selectByText('#ddlbirthcountry', thisMutamer.PreviousNationality);

    await selectByValue('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(6) > td:nth-child(1) > select', thisMutamer.Gender);
    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(10) > td:nth-child(3) > table > tbody > tr > td:nth-child(1) > input', mutamersObject.Country);
    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(8) > td:nth-child(3) > table > tbody > tr > td:nth-child(1) > input', decodeURI(thisMutamer.PlaceOfBirth));
    // await typeText('#txtstreet', thisMutamer.PlaceOfBirth);
    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(6) > table > tbody > tr > td:nth-child(1) > input', thisMutamer.IssuePlace);

    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td:nth-child(1) > input', thisMutamer.IssueDate.substring(0, 2));
    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td:nth-child(3) > input', thisMutamer.IssueDate.substring(6));
    const month = thisMutamer.IssueDate.substring(3, 5);
    await typeText('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(7) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td:nth-child(2) > input', month.substring(1));
    await page.click('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(5) > td > fieldset > table > tbody > tr > td:nth-child(1) > button');
    await page.waitFor(3000);
    await page.waitForSelector('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(5) > td > fieldset > table > tbody > tr > td:nth-child(2)');
    await page.$eval('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(5) > td > fieldset > table > tbody > tr > td:nth-child(2)', el => el.value = '');
    await page.type('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(5) > td > fieldset > table > tbody > tr > td:nth-child(2)', thisMutamer.CodeLine + '\n', { delay: 0 });


    // if (thisMutamer.Relationship) {
    //     await page.select('#ddlrelation', thisMutamer.Relationship);
    // }

    await sendSimpleFile('./' + thisMutamer.HajId + '.jpg', '#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > div > table > tbody > tr > td:nth-child(1) > form > div > input');

    await sendTwoclickFile('./' + thisMutamer.HajId + '_MRZ1.jpg', '#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > button', '#wrapper > div:nth-child(16) > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > div > table > tbody > tr > td:nth-child(1) > form > div > input');
    await page.waitForSelector('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > div');
    await page.click('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > div');
    await sendSimpleFile('./' + thisMutamer.HajId + '.jpg', '#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > div > table > tbody > tr > td:nth-child(1) > form > div > input');

}

async function sendSimpleFile(filePath, inputButtonSelecor) {
    try {

        const futureFileChooser = page.waitForFileChooser();
        await page.waitForSelector(inputButtonSelecor);
        await page.evaluate((p) => document.querySelector(p).click(), inputButtonSelecor);
        const fileChooser = await futureFileChooser;
        await fileChooser.accept([filePath]);
    } catch (err) {
        console.log(err);
    }
}

async function sendTwoclickFile(filePath, firstClickSelector, inputButtonSelecor) {
    try {
        let futureFileChooser = page.waitForFileChooser();
        await page.evaluate((p) => document.querySelector(p).click(), firstClickSelector);
        await page.waitForSelector(inputButtonSelecor);
        await page.evaluate((p) => document.querySelector(p).click(), inputButtonSelecor);
        let fileChooser = await futureFileChooser;
        await fileChooser.accept([filePath]);
    } catch (err) {
        console.log(err);
    }
}
async function displayButtons(mutamersObject) {

    await page.evaluate((p) => {
        let dom = document.querySelector('#wrapper > div.gwt-DialogBox > div > table > tbody > tr.dialogMiddle > td.dialogMiddleCenter > div > div > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(1) > table > tbody');
        if (!p.mutamerIndex) {
            p.mutamerIndex = 0;
        }
        if (p.mutamerIndex >= p.pax) {
            return;
        }

        let previousButton = '';
        let nextButton = ';'
        if (p.mutamerIndex > 0) {

            previousButton = `<button class="btn btn-warning rounded" type='button' onclick='previousMutamer()'>  PREVIOUS [` + p.mutamers[parseInt(p.mutamerIndex) - 1].ShortName + `]</button>`;
        }
        else {
            previousButton = `<button class="btn btn-warning rounded" type='button' disabled>  PREVIOUS [` + 'N/A' + `]</button>`;

        }
        if (p.mutamerIndex < (parseInt(p.pax) - 1)) {
            nextButton = `<button class="btn btn-dark rounded" type='button' onclick='nextMutamer()'> NEXT [` + p.mutamers[parseInt(p.mutamerIndex) + 1].ShortName + `]  </button>`;
        } else {
            nextButton = `<button class="btn btn-dark rounded" type='button' disabled> NEXT [` + 'N/A' + `]  </button>`;

        }

        let currentButton = `<button class="btn btn-primary rounded" type='button' onclick='pasteCurrentMutamer()'> ` + p.mutamers[p.mutamerIndex].ShortName + ' [' + (parseInt(p.mutamerIndex) + 1) + '/' + p.pax + ']' + `</button>`;

        dom.innerHTML = previousButton + currentButton + nextButton;
    }, mutamersObject);
}

async function execOnLastResponse(selectorToDetect, fnc) {

    if (await page.$(selectorToDetect)) {
        await fnc();
    }
}

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
async function movetoNextMutamer() {
    const data = fs.readFileSync('./Mutamers.json');
    const mutamersObject = JSON.parse(data);
    if (!mutamersObject.mutamerIndex) {
        mutamersObject.mutamerIndex = 1;
    } else {
        mutamersObject.mutamerIndex = parseInt(mutamersObject.mutamerIndex) + 1;
    }
    fs.writeFileSync('./Mutamers.json', JSON.stringify(mutamersObject));
    await displayButtons(mutamersObject);

}
async function movetoPreviousMutamer() {
    const data = fs.readFileSync('./Mutamers.json');
    const mutamersObject = JSON.parse(data);
    if (!mutamersObject.mutamerIndex || mutamersObject.mutamerIndex === "0") {
        return;
    } else {
        mutamersObject.mutamerIndex = parseInt(mutamersObject.mutamerIndex) - 1;
    }
    fs.writeFileSync('./Mutamers.json', JSON.stringify(mutamersObject));
    await displayButtons(mutamersObject);
}