var fs = require('fs');
var Mustache = require('Mustache');
var request = require('request');
const puppeteer = require('puppeteer');

const config = JSON.parse(fs.readFileSync("config.json"));

getTop10Coins();
function getTop10Coins() {
    request('https://api.coinmarketcap.com/v1/ticker/?limit=10', function (error, response, body) {
        if (error) {
            console.log('error:', error);
        }

        readTemplate(body);
    });
}

function readTemplate(coins) {
    fs.readFile('templates/main.html', 'utf8', function (err, content) {
      if (err) throw err;

      const data = {
          coin_rows: JSON.parse(coins),
          returnImage: function() {
              if (this.symbol == "XLM") {
                  return 'STR';
              }

              return this.symbol;
          },
          getPrice: function() {
              return parseFloat(this.price_usd).toFixed(2);
          },
          getColor1h: function() {
              if (parseFloat(this.percent_change_1h) < 0) {
                  return 'text-danger';
              }

              return 'text-success';
          },
          getColor7d: function() {
              if (parseFloat(this.percent_change_7d) < 0) {
                  return 'text-danger';
              }

              return 'text-success';
          },
          getColor24h: function() {
              if (parseFloat(this.percent_change_24h) < 0) {
                  return 'text-danger';
              }

              return 'text-success';
          }
      };
      const renderedMain = Mustache.render(content, data);

      writeToDisk(renderedMain);
    });
}

function writeToDisk(content) {
    fs.writeFile('out/out.html', content, function (err) {
      if (err) throw err;

      console.log('Done saving output!');
      webshotIt(content);
    });
}

function webshotIt(content) {
    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      page.setViewport({width: 1200, height: 600});
      await page.goto(config.base + '/out/out.html');
      await page.screenshot({path: 'out/output.png'});

      await browser.close();

      lbryUpload();
    })();
}

function lbryUpload() {
    const timestamp = Date.now();
    request.post({url: 'https://spee.ch/api/claim-publish', formData: {name: timestamp + 'output', file: fs.createReadStream('./out/output.png')}}, function (error, response, body) {
        if (error) throw error;

        console.log("Output: " + JSON.parse(body).message.url);
    });
}
