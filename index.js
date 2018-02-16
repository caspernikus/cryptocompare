var fs = require('fs');
var Mustache = require('Mustache');

const coins = [
    {
        name: 'Bitcoin',
        price: '10000 $'
    }, {
        name: 'Ethereum',
        price: '900 $'
    }, {
        name: 'Ripple',
        price: '90 $'
    }
];

fs.readFile('templates/main.html', 'utf8', function (err, content) {
  if (err) throw err;

  const data = {
      coin_rows: coins
  };
  const renderedMain = Mustache.render(content, data);

  writeToDisk(renderedMain);
});

function writeToDisk(content) {
    fs.writeFile('out/out.html', content, function (err) {
      if (err) throw err;

      console.log('Done saving output!');
    });
}
