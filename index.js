var fs = require('fs');
var Mustache = require('Mustache');
var request = require('request');

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
    });
}
