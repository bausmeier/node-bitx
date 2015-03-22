'use strict';

var BitX = require('../lib/BitX');
var FakeRequest = require('./helpers/FakeRequest');
var https = require('https');
var Lab = require('lab');
var sinon = require('sinon');

var expect = Lab.assertions;
var lab = exports.lab = Lab.script();

lab.describe('Constructor', function() {

  lab.it('should create a new instance', function(done) {
    var bitx = new BitX();
    expect(bitx).to.be.an.instanceOf(BitX);
    done();
  });

  lab.it('should create a new instance without the new keyword', function(done) {
    var bitx = BitX();
    expect(bitx).to.be.an.instanceOf(BitX);
    done();
  });

  lab.it('should have default options', function(done) {
    var bitx = new BitX();
    expect(bitx.hostname).to.equal('api.mybitx.com');
    expect(bitx.port).to.equal(443);
    expect(bitx.pair).to.equal('XBTZAR');
    done();
  });

  lab.it('should accept options', function(done) {
    var options = {
      hostname: 'localhost',
      port: 8000,
      pair: 'XBTUSD',
    };
    var bitx = new BitX(options);
    expect(bitx.hostname).to.equal(options.hostname);
    expect(bitx.port).to.equal(options.port);
    expect(bitx.pair).to.equal(options.pair);
    done();
  });

  lab.it('should accept auth and options', function(done) {
    var keyId = 'cnz2yjswbv3jd',
        keySecret = '0hydMZDb9HRR3Qq-iqALwZtXLkbLR4fWxtDZvkB9h4I',
        options = {
          hostname: 'localhost',
          port: 8000,
          pair: 'XBTUSD',
        };
    var bitx = new BitX(keyId, keySecret, options);
    expect(bitx.hostname).to.equal(options.hostname);
    expect(bitx.port).to.equal(options.port);
    expect(bitx.pair).to.equal(options.pair);
    expect(bitx.auth).to.equal(keyId + ':' + keySecret);
    done();
  });
});

lab.describe('Internal', function() {

  var bitx,
      request,
      stub;

  var keyId = '12345',
      keySecret = '0000000000000000',
      path = 'test';

  var expectedOptions = {
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8'
    },
    hostname: 'api.mybitx.com',
    path: '/api/1/' + path,
    port: 443,
    auth: keyId + ':' + keySecret
  };

  lab.before(function(done) {
    bitx = new BitX(keyId, keySecret);
    request = sinon.stub(https, 'request');
    stub = request.withArgs(sinon.match(expectedOptions));
    done();
  });

  lab.after(function(done) {
    request.restore();
    done();
  });

  lab.afterEach(function(done) {
    stub.reset();
    done();
  });

  lab.describe('_request', function() {

    lab.it('should return the expected result', function(done) {
      var expectedResult = {success: true};
      stub.returns(new FakeRequest(expectedResult));
      bitx._request('GET', path, null, function(err, result) {
        expect(err).to.be.null();
        expect(result).to.eql(expectedResult);
        done();
      });
    });

    lab.it('should return an error if request emits an error', function(done) {
      stub.returns(new FakeRequest(null, {fail: true}));
      bitx._request('GET', path, null, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    lab.it('should return an error if the response is not valid', function(done) {
      stub.returns(new FakeRequest('invalid', {stringify: false}));
      bitx._request('GET', path, null, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    lab.it('should return an error if the response contains an error', function(done) {
      stub.returns(new FakeRequest({error: true}));
      bitx._request('GET', path, null, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    lab.it('should return an error if the response is unauthorized', function(done) {
      stub.returns(new FakeRequest(null, {statusCode: 401}));
      bitx._request('GET', path, null, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });
});

lab.describe('External', function() {
  var bitx,
      mock;

  var callback = function() {};

  lab.before(function(done) {
    bitx = new BitX();
    done();
  });

  lab.beforeEach(function(done) {
    mock = sinon.mock(bitx);
    done();
  });

  lab.afterEach(function(done) {
    mock.restore();
    done();
  });

  lab.describe('getTicker', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'ticker', {pair: 'XBTZAR'}, callback);
      bitx.getTicker(callback);
      mock.verify();
      done();
    });

    lab.it('should accept a pair option', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'ticker', {pair: 'XBTMYR'}, callback);
      bitx.getTicker({pair: 'XBTMYR'}, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getAllTickers', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'tickers', null, callback);
      bitx.getAllTickers(callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getOrderBook', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'orderbook', {pair: 'XBTZAR'}, callback);
      bitx.getOrderBook(callback);
      mock.verify();
      done();
    });

    lab.it('should accept a pair option', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'orderbook', {pair: 'XBTMYR'}, callback);
      bitx.getOrderBook({pair: 'XBTMYR'}, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getTrades', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'trades', {pair: 'XBTZAR'}, callback);
      bitx.getTrades(callback);
      mock.verify();
      done();
    });

    lab.it('should accept a pair option', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'trades', {pair: 'XBTMYR'}, callback);
      bitx.getTrades({pair: 'XBTMYR'}, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getOrderList', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'listorders', {pair: 'XBTZAR'}, callback);
      bitx.getOrderList(callback);
      mock.verify();
      done();
    });

    lab.it('should accept a pair option', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'listorders', {pair: 'XBTMYR'}, callback);
      bitx.getOrderList({pair: 'XBTMYR'}, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getLimits', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'BTCZAR/getlimits', null, callback);
      bitx.getLimits(callback);
      mock.verify();
      done();
    });
  });

  lab.describe('postBuyOrder', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      var parameters = {
        type: 'BID',
        volume: 9999.99,
        price: 0.001,
        pair: 'XBTZAR'
      };
      mock.expects('_request').once().withArgs('POST', 'postorder', parameters, callback);
      bitx.postBuyOrder(parameters.volume, parameters.price, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('postSellOrder', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      var parameters = {
        type: 'ASK',
        volume: 0.001,
        price: 9999.99,
        pair: 'XBTZAR'
      };
      mock.expects('_request').once().withArgs('POST', 'postorder', parameters, callback);
      bitx.postSellOrder(parameters.volume, parameters.price, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('stopOrder', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      var body = {
        order_id: 'BXMC2CJ7HNB88U4'
      };
      mock.expects('_request').once().withArgs('POST', 'stoporder', body, callback);
      bitx.stopOrder(body.order_id, callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getBalance', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'balance', null, callback);
      bitx.getBalance(callback);
      mock.verify();
      done();
    });

    lab.it('should accept an asset argument and call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'balance', {asset: 'ZAR'}, callback);
      bitx.getBalance('ZAR', callback);
      mock.verify();
      done();
    });
  });

  lab.describe('getFundingAddress', function() {

    lab.it('should call _request with the correct parameters', function(done) {
      mock.expects('_request').once().withArgs(
        'GET', 'funding_address', {asset: 'XBT'}, callback);
      bitx.getFundingAddress('XBT', callback);
      mock.verify();
      done();
    });
  });
});
