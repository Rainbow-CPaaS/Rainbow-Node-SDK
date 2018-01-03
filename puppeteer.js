const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("file:///" + __dirname + "/bin/jsdoc/sheets/cheatsheet/nodesheets.html");
    await page.pdf({path: 'bin/jsdoc/sheets/cheatsheet/nodeSheet.pdf', displayHeaderFooter: true, printBackground: true, format: "A3", landscape: true});

    await browser.close();
})();