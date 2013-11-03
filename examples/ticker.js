var BitX = require('../lib/BitX');

var bitx = new BitX();

bitx.getTicker(function(err, ticker) {
  if (err) throw err;
  console.dir(ticker);
});