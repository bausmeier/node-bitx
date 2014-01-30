'use strict';

var https = require('https'),
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    querystring = require('querystring'),
    BitX = require('../lib/BitX'),
    chai = require('chai');

var expect = chai.expect;

var port = process.env.PORT || 8001;

describe('BitX', function() {

  var bitx,
      server;

  before(function(done) {
    bitx = new BitX('keyId', 'keySecret', {
      hostname: 'localhost',
      port: port,
      ca: fs.readFileSync(path.join(__dirname, 'ssl', 'ca', 'root.pem'))
    });
    var options = {
      key: fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.crt'))
    };
    server = https.createServer(options).listen(port, 'localhost', done);
  });

  afterEach(function() {
    server.removeAllListeners('request');
  });

  after(function(done) {
    server.close(done);
  });

  describe('getTicker', function() {

    it('should return a ticker', function(done) {
      var expectedTicker = {
        timestamp: 1366224386716,
        currency: 'ZAR',
        bid: '924.00',
        ask: '1050.00',
        last_trade: '950.00',
        rolling_24_hour_volume: '12.52'
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/ticker?pair=XBTZAR');
        res.end(JSON.stringify(expectedTicker));
      });

      bitx.getTicker(function(err, ticker) {
        expect(ticker).to.eql(expectedTicker);
        done(err);
      });
    });
  });

  describe('getOrderBook', function() {

    it('should return the order book', function(done) {
      var expectedOrderBook = {
        timestamp: 1366305398592,
        currency: 'ZAR',
        asks: [
          {price: '1180.00', volume: '0.10'},
          {price: '2000.00', volume: '0.10'}
        ],
        bids: [
          {price: '1100.00', volume: '0.10'},
          {price: '1000.00', volume: '0.10'},
          {price: '900.00', volume: '0.10'}
        ]
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/orderbook?pair=XBTZAR');
        res.end(JSON.stringify(expectedOrderBook));
      });

      bitx.getOrderBook(function(err, orderBook) {
        expect(orderBook).to.eql(expectedOrderBook);
        done(err);
      });
    });
  });

  describe('getTrades', function() {

    it('should return the trades', function(done) {
      var expectedTrades = {
        currency: 'ZAR',
        trades: [
          {timestamp: 1366052621774, price: '1000.00', volume: '0.10'},
          {timestamp: 1366052621770, price: '1020.50', volume: '1.20'}
        ]
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/trades?pair=XBTZAR');
        res.end(JSON.stringify(expectedTrades));
      });

      bitx.getTrades(function(err, trades) {
        expect(trades).to.eql(expectedTrades);
        done(err);
      });
    });
  });

  describe('getOrderList', function() {

    it('should return the order list', function(done) {
      var expectedOrderList = {
        orders: [
          {
            order_id: 'BXMC2CJ7HNB88U4',
            creation_timestamp: 1367849297609,
            expiration_timestamp: 1367935697609,
            type: 'ASK',
            state: 'PENDING',
            limit_price: '1000.00',
            limit_volume: '0.80',
            btc: '0.00',
            zar: '0.00',
            fee_btc: '0.00',
            fee_zar: '0.00'
          }
        ]
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/listorders?pair=XBTZAR');
        res.end(JSON.stringify(expectedOrderList));
      });

      bitx.getOrderList(function(err, orderlist) {
        expect(orderlist).to.eql(expectedOrderList);
        done(err);
      });
    });
  });

  describe('getLimits', function() {

    it('should return the limits', function(done) {
      var expectedLimits = {
        ask_btc_limit: '1.00',
        bid_zar_limit: '1000.00'
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/BTCZAR/getlimits');
        res.end(JSON.stringify(expectedLimits));
      });

      bitx.getLimits(function(err, limits) {
        expect(limits).to.eql(expectedLimits);
        done(err);
      });
    });
  });

  describe('postBuyOrder', function() {

    it('should post the correct fields and return an order id', function(done) {
      var expectedOrder = {order_id: 'BXMC2CJ7HNB88U4'};
      var volume = 9999.99;
      var price = 0.0001;

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/postorder');
        expect(req).to.have.deep.property('headers.content-type', 'application/x-www-form-urlencoded');
        var body = '';
        req.on('data', function(data) {
          body += data;
        });
        req.on('end', function() {
          body = querystring.parse(body);
          expect(body).to.have.property('type', 'BID');
          expect(body).to.have.property('volume', volume.toString());
          expect(body).to.have.property('price', price.toString());
          expect(body).to.have.property('pair', 'XBTZAR');
          res.end(JSON.stringify(expectedOrder));
        });
      });

      bitx.postBuyOrder(volume, price, function(err, order) {
        expect(order).to.eql(expectedOrder);
        done(err);
      });
    });

    it('should return an error if the order would exceed order limits', function(done) {
      var expectedError = 'Order would exceed your order limits.';

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/postorder');
        res.end(JSON.stringify({error: expectedError}));
      });

      bitx.postBuyOrder(0.01, 9999.99, function(err) {
        expect(err).to.have.property('message', expectedError);
        done();
      });
    });
  });

  describe('postSellOrder', function() {

    it('should post the correct fields and return an order id', function(done) {
      var expectedOrder = {order_id: 'BXMC2CJ7HNB88U4'};
      var volume = 0.001;
      var price = 9999.99;

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/postorder');
        expect(req).to.have.deep.property('headers.content-type', 'application/x-www-form-urlencoded');
        var body = '';
        req.on('data', function(data) {
          body += data;
        });
        req.on('end', function() {
          body = querystring.parse(body);
          expect(body).to.have.property('type', 'ASK');
          expect(body).to.have.property('volume', volume.toString());
          expect(body).to.have.property('price', price.toString());
          expect(body).to.have.property('pair', 'XBTZAR');
          res.end(JSON.stringify(expectedOrder));
        });
      });

      bitx.postSellOrder(volume, price, function(err, order) {
        expect(order).to.eql(expectedOrder);
        done(err);
      });
    });
  });

  describe('stopOrder', function() {

    it('should post the order id and return success', function(done) {
      var expectedResult = {success: true};
      var orderId = 'BXMC2CJ7HNB88U4';

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/stoporder');
        expect(req).to.have.deep.property('headers.content-type', 'application/x-www-form-urlencoded');
        var body = '';
        req.on('data', function(data) {
          body += data;
        });
        req.on('end', function() {
          body = querystring.parse(body);
          expect(body).to.have.property('order_id', orderId);
          res.end(JSON.stringify(expectedResult));
        });
      });

      bitx.stopOrder(orderId, function(err, result) {
        expect(result).to.have.property('success', true);
        done(err);
      });
    });

    it('should return an error if the order is unknown or non-pending', function(done) {
      var expectedError = 'Cannot stop unknown or non-pending order';

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/stoporder');
        res.end(JSON.stringify({error: expectedError}));
      });

      bitx.stopOrder('BXMC2CJ7HNB88U4', function(err) {
        expect(err).to.have.property('message', expectedError);
        done();
      });
    });
  });

  describe('getBalance', function() {

    it('should return the balance', function(done) {
      var expectedBalances = {
        balance: [{
          asset: 'ZAR',
          balance: '1000.00',
          reserved: '800.00'
        }]
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/balance?asset=ZAR');
        res.end(JSON.stringify(expectedBalances));
      });

      bitx.getBalance('ZAR', function(err, balances) {
        expect(balances).to.eql(expectedBalances);
        done(err);
      });
    });
  });

  describe('getFundingAddress', function() {

    it('should return the funding address', function(done) {
      var expectedFundingAddress = {
        asset: 'XBT',
        address: 'B1tC0InExAMPL3fundIN6AdDreS5t0Use'
      };

      server.on('request', function(req, res) {
        expect(req).to.have.property('url', '/api/1/funding_address?asset=XBT');
        res.end(JSON.stringify(expectedFundingAddress));
      });

      bitx.getFundingAddress('XBT', function(err, fundingAddress) {
        expect(fundingAddress).to.eql(expectedFundingAddress);
        done(err);
      });
    });
  });
});
