'use strict'

var BitX = require('../lib/BitX')
var FakeRequest = require('./helpers/FakeRequest')
var https = require('https')
var sinon = require('sinon')
var tap = require('tap')

tap.test('BitX constructor', {autoend: true}, function (t) {
  t.test('should create a new instance', function (tt) {
    var bitx = new BitX()
    tt.type(bitx, 'BitX')
    tt.end()
  })

  tap.test('should create a new instance without the new keyword', function (tt) {
    var bitx = BitX()
    tt.type(bitx, 'BitX')
    tt.end()
  })

  tap.test('should have default options', function (tt) {
    var bitx = new BitX()
    tt.equal(bitx.hostname, 'api.luno.com')
    tt.equal(bitx.port, 443)
    tt.equal(bitx.pair, 'XBTZAR')
    tt.end()
  })

  tap.test('should accept options', function (tt) {
    var options = {
      hostname: 'localhost',
      port: 8000,
      pair: 'XBTUSD'
    }
    var bitx = new BitX(options)
    tt.equal(bitx.hostname, options.hostname)
    tt.equal(bitx.port, options.port)
    tt.equal(bitx.pair, options.pair)
    tt.end()
  })

  tap.test('should accept auth and options', function (tt) {
    var keyId = 'cnz2yjswbv3jd'
    var keySecret = '0hydMZDb9HRR3Qq-iqALwZtXLkbLR4fWxtDZvkB9h4I'
    var options = {
      hostname: 'localhost',
      port: 8000,
      pair: 'XBTUSD'
    }
    var bitx = new BitX(keyId, keySecret, options)
    tt.equal(bitx.hostname, options.hostname)
    tt.equal(bitx.port, options.port)
    tt.equal(bitx.pair, options.pair)
    tt.equal(bitx.auth, keyId + ':' + keySecret)
    tt.end()
  })
})

tap.test('Internal', {autoend: true}, function (t) {
  var keyId = '12345'
  var keySecret = '0000000000000000'
  var path = '/api/1/test'

  var expectedOptions = {
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8'
    },
    hostname: 'api.luno.com',
    path: path,
    port: 443,
    auth: keyId + ':' + keySecret
  }

  var bitx = new BitX(keyId, keySecret)
  var request = sinon.stub(https, 'request')
  var stub = request.withArgs(sinon.match(expectedOptions))

  t.afterEach(function () {
    stub.reset()
  })

  t.teardown(function () {
    request.restore()
  })

  t.test('_request should return the expected result', function (tt) {
    var expectedResult = {success: true}
    stub.returns(new FakeRequest(expectedResult))
    bitx._request('GET', path, null, function (err, result) {
      tt.error(err)
      tt.same(result, expectedResult)
      tt.end()
    })
  })

  t.test('_request should return an error if request emits an error', function (tt) {
    stub.returns(new FakeRequest(null, {fail: true}))
    bitx._request('GET', path, null, function (err) {
      tt.type(err, 'Error')
      tt.end()
    })
  })

  t.test('_request should return an error if the response is not valid', function (tt) {
    stub.returns(new FakeRequest('invalid', {stringify: false}))
    bitx._request('GET', path, null, function (err) {
      tt.type(err, 'Error')
      tt.end()
    })
  })

  t.test('_request should return an error if the response contains an error', function (tt) {
    stub.returns(new FakeRequest({error: true}))
    bitx._request('GET', path, null, function (err) {
      tt.type(err, 'Error')
      tt.end()
    })
  })

  t.test('_request should return an error if the response is unauthorized', function (tt) {
    stub.returns(new FakeRequest(null, {statusCode: 401}))
    bitx._request('GET', path, null, function (err) {
      tt.type(err, 'Error')
      tt.end()
    })
  })
})

tap.test('External', {autoend: true}, function (t) {
  var bitx = new BitX()
  var callback = function () {}
  var mock

  t.beforeEach(function () {
    mock = sinon.mock(bitx)
  })

  t.afterEach(function () {
    mock.restore()
  })

  t.test('getTicker should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/ticker', {pair: 'XBTZAR'}, callback)
    bitx.getTicker(callback)
    mock.verify()
    tt.end()
  })

  t.test('getTicker should accept a pair option', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/ticker', {pair: 'XBTMYR'}, callback)
    bitx.getTicker({pair: 'XBTMYR'}, callback)
    mock.verify()
    tt.end()
  })

  t.test('getAllTickers should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/tickers', null, callback)
    bitx.getAllTickers(callback)
    mock.verify()
    tt.end()
  })

  t.test('getOrderBook should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/orderbook', {pair: 'XBTZAR'}, callback)
    bitx.getOrderBook(callback)
    mock.verify()
    tt.end()
  })

  t.test('getOrderBook should accept a pair option', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/orderbook', {pair: 'XBTMYR'}, callback)
    bitx.getOrderBook({pair: 'XBTMYR'}, callback)
    mock.verify()
    tt.end()
  })

  t.test('getTrades should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/trades', {pair: 'XBTZAR'}, callback)
    bitx.getTrades(callback)
    mock.verify()
    tt.end()
  })

  t.test('getTrades should accept a pair option', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/trades', {pair: 'XBTMYR'}, callback)
    bitx.getTrades({pair: 'XBTMYR'}, callback)
    mock.verify()
    tt.end()
  })

  t.test('getOrderList should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/listorders', {pair: 'XBTZAR'}, callback)
    bitx.getOrderList(callback)
    mock.verify()
    tt.end()
  })

  t.test('getOrderList should accept a pair option', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/listorders', {pair: 'XBTMYR'}, callback)
    bitx.getOrderList({pair: 'XBTMYR'}, callback)
    mock.verify()
    tt.end()
  })

  t.test('getLimits should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/BTCZAR/getlimits', null, callback)
    bitx.getLimits(callback)
    mock.verify()
    tt.end()
  })

  t.test('postBuyOrder should call _request with the correct parameters', function (tt) {
    var parameters = {
      type: 'BID',
      volume: 9999.99,
      price: 0.001,
      pair: 'XBTZAR'
    }
    mock.expects('_request').once().withArgs('POST', '/api/1/postorder', parameters, callback)
    bitx.postBuyOrder(parameters.volume, parameters.price, callback)
    mock.verify()
    tt.end()
  })

  t.test('postMarketBuyOrder should call _request with the correct parameters', function (tt) {
    var parameters = {
      type: 'BUY',
      counter_volume: 9999.99,
      pair: 'XBTZAR'
    }
    mock.expects('_request').once().withArgs('POST', '/api/1/marketorder', parameters, callback)
    bitx.postMarketBuyOrder(parameters.counter_volume, callback)
    mock.verify()
    tt.end()
  })

  t.test('postSellOrder should call _request with the correct parameters', function (tt) {
    var parameters = {
      type: 'ASK',
      volume: 0.001,
      price: 9999.99,
      pair: 'XBTZAR'
    }
    mock.expects('_request').once().withArgs('POST', '/api/1/postorder', parameters, callback)
    bitx.postSellOrder(parameters.volume, parameters.price, callback)
    mock.verify()
    tt.end()
  })

  t.test('postMarketSellOrder should call _request with the correct parameters', function (tt) {
    var parameters = {
      type: 'SELL',
      base_volume: 9999.99,
      pair: 'XBTZAR'
    }
    mock.expects('_request').once().withArgs('POST', '/api/1/marketorder', parameters, callback)
    bitx.postMarketSellOrder(parameters.base_volume, callback)
    mock.verify()
    tt.end()
  })

  t.test('stopOrder should call _request with the correct parameters', function (tt) {
    var body = {order_id: 'BXMC2CJ7HNB88U4'}
    mock.expects('_request').once().withArgs('POST', '/api/1/stoporder', body, callback)
    bitx.stopOrder(body.order_id, callback)
    mock.verify()
    tt.end()
  })

  t.test('getBalance should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/balance', null, callback)
    bitx.getBalance(callback)
    mock.verify()
    tt.end()
  })

  t.test('getBalance should accept an asset argument and call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/balance', {asset: 'ZAR'}, callback)
    bitx.getBalance('ZAR', callback)
    mock.verify()
    tt.end()
  })

  t.test('should call _request with the correct parameters', function (tt) {
    mock.expects('_request').once().withArgs('GET', '/api/1/funding_address', {asset: 'XBT'}, callback)
    bitx.getFundingAddress('XBT', callback)
    mock.verify()
    tt.end()
  })
})
