'use strict';

var BitX = require('../lib/BitX'),
    https = require('https'),
    sinon = require('sinon'),
    chai = require('chai'),
    FakeRequest = require('./helpers/FakeRequest');

var expect = chai.expect;

describe('Constructor', function() {
  
  it('should create a new instance', function() {
    var bitx = new BitX();
    expect(bitx).to.be.an.instanceOf(BitX);
  });
  
  it('should create a new instance without the new keyword', function() {
    var bitx = BitX();
    expect(bitx).to.be.an.instanceOf(BitX);
  });
  
  it('should have default options', function() {
    var bitx = new BitX();
    expect(bitx.hostname).to.equal('bitx.co.za');
    expect(bitx.port).to.equal(443);
    expect(bitx.pair).to.equal('XBTZAR');
  });
  
  it('should accept options', function() {
    var options = {
      hostname: 'localhost',
      port: 8000,
      pair: 'XBTUSD',
    };
    var bitx = new BitX(options);
    expect(bitx.hostname).to.equal(options.hostname);
    expect(bitx.port).to.equal(options.port);
    expect(bitx.pair).to.equal(options.pair);
  });
  
  it('should accept auth and options', function() {
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
  });
});

describe('Internal', function() {
  
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
    hostname: 'bitx.co.za',
    path: '/api/1/' + path,
    port: 443,
    auth: keyId + ':' + keySecret
  };
  
  before(function() {
    bitx = new BitX(keyId, keySecret);
    request = sinon.stub(https, 'request'),
    stub = request.withArgs(sinon.match(expectedOptions));
  });
  
  after(function() {
    request.restore();
  });
  
  afterEach(function() {
    stub.reset();
  });
  
  describe('_request', function() {
    
    it('should return the expected result', function(done) {
      var expectedResult = {success: true};
      stub.returns(new FakeRequest(expectedResult));
      bitx._request('GET', path, null, function(err, result) {
        expect(err).to.be.null;
        expect(result).to.eql(expectedResult);
        done();
      });
    });
    
    it('should return an error if request emits an error', function(done) {
      stub.returns(new FakeRequest(null, {fail: true}));
      bitx._request('GET', path, null, function(err, result) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
    
    it('should return an error if the response is not valid', function(done) {
      stub.returns(new FakeRequest('invalid'));
      bitx._request('GET', path, null, function(err, result) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
    
    it('should return an error if the response contains an error', function(done) {
      stub.returns(new FakeRequest({error: true}));
      bitx._request('GET', path, null, function(err, result) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
    
    it('should return an error if the response is unauthorized', function(done) {
      stub.returns(new FakeRequest(null, {statusCode: 401}));
      bitx._request('GET', path, null, function(err, result) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });
});

describe('External', function() {
  var bitx,
      mock;
  
  var callback = function() {};
  
  before(function() {
    bitx = new BitX();
  });
  
  beforeEach(function() {
    mock = sinon.mock(bitx);
  });
  
  describe('getTicker', function() {
    
    it('should call _request with the correct parameters', function() {
      mock.expects('_request').once().withArgs(
        'GET', 'ticker', {pair: 'XBTZAR'}, callback);
      bitx.getTicker(callback);
      mock.verify();
    });
  });
  
  describe('getOrderBook', function() {
    
    it('should call _request with the correct parameters', function() {
      mock.expects('_request').once().withArgs(
        'GET', 'orderbook', {pair: 'XBTZAR'}, callback);
      bitx.getOrderBook(callback);
      mock.verify();
    });
  });
  
  describe('getTrades', function() {
    
    it('should call _request with the correct parameters', function() {
      mock.expects('_request').once().withArgs(
        'GET', 'trades', {pair: 'XBTZAR'}, callback);
      bitx.getTrades(callback);
      mock.verify();
    });
  });
  
  describe('getOrderList', function() {
    
    it('should call _request with the correct parameters', function() {
      mock.expects('_request').once().withArgs(
        'GET', 'listorders', {pair: 'XBTZAR'}, callback);
      bitx.getOrderList(callback);
      mock.verify();
    });
  });
  
  describe('getLimits', function() {
    
    it('should call _request with the correct parameters', function() {
      mock.expects('_request').once().withArgs(
        'GET', 'BTCZAR/getlimits', null, callback);
      bitx.getLimits(callback);
      mock.verify();
    });
  });

  describe('postBuyOrder', function() {
    
    it('should call _request with the correct parameters', function() {
      var parameters = {
        type: 'BID',
        volume: 9999.99,
        price: 0.001,
        pair: 'XBTZAR'
      };
      mock.expects('_request').once().withArgs('POST', 'postorder', parameters, callback);
      bitx.postBuyOrder(parameters.volume, parameters.price, callback);
      mock.verify();
    });
  });
  
  describe('postSellOrder', function() {
    
    it('should call _request with the correct parameters', function() {
      var parameters = {
        type: 'ASK',
        volume: 0.001,
        price: 9999.99,
        pair: 'XBTZAR'
      };
      mock.expects('_request').once().withArgs('POST', 'postorder', parameters, callback);
      bitx.postSellOrder(parameters.volume, parameters.price, callback);
      mock.verify();
    });
  });
  
  describe('stopOrder', function() {
    
    it('should call _request with the correct parameters', function() {
      var body = {
        order_id: 'BXMC2CJ7HNB88U4'
      };
      mock.expects('_request').once().withArgs('POST', 'stoporder', body, callback);
      bitx.stopOrder(body.order_id, callback);
      mock.verify();
    });
  });
});
