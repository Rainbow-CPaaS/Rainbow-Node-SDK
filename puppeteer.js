const puppeteer = require('puppeteer');

(async() => {
    try {
        const browser = await puppeteer.launch({headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        page.setViewport({width: 4961, height: 3508, isLandscape: true});

        if (process.argv[3]) {
            page.setViewport({
                width: 16.5 * process.argv[3],
                height: 11.69 * process.argv[3],
                isLandscape: true
            });
        }

        var path = "";

        switch (process.argv[2]) {
            case "node":
                await page.goto("file:///" + __dirname + "/bin/jsdoc/sheets/cheatsheet/node/nodesheets.html");
                path = "node";
                break;
            default:
                break;
        }

        var height = await page.evaluate(() => {
            return document.body.clientHeight;
        });
        var width = await page.evaluate(() => {
            return document.body.clientWidth;
        });

        if (height > width) { // Return to portrait mode
            page.setViewport({width: 3508, height: 4961, isLandscape: true});

            height = await page.evaluate(() => {
                return document.body.clientHeight;
            });
            width = await page.evaluate(() => {
                return document.body.clientWidth;
            });

            var ratio = height / width;
            var pixels = height * width;

            while (pixels < 29000000) { // ~ We are searching for the max size above ~limit
                width += 100;
                height += 100 * ratio;
                pixels = width * height;
            }

            page.setViewport({
                width: Math.ceil(width),
                height: Math.ceil(height),
                isLandscape: false
            });
        }

        await page.screenshot({
            path: "bin/jsdoc/sheets/cheatsheet/" + path + "/" + path + "Sheet.png",
            fullPage: true,
            omitBackground: false
        });

        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();