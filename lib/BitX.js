'use strict'

var https = require('https')
var path = require('path')
var querystring = require('querystring')
var config = require(path.join(__dirname, '..', 'package'))

var defaultHeaders = {
  'Accept': 'application/json',
  'Accept-Charset': 'utf-8',
  'User-Agent': 'node-bitx v' + config.version
}

function BitX (keyId, keySecret, options) {
  if (!(this instanceof BitX)) {
    return new BitX(keyId, keySecret, options)
  }
  if (typeof keyId === 'string') {
    this.auth = keyId + ':' + keySecret
  } else {
    options = keyId
  }
  options = options || {}
  this.hostname = options.hostname || 'api.luno.com'
  this.port = options.port || 443
  this.ca = options.ca
  this.pair = options.pair || 'XBTZAR'
  this._requestMts = []
  this._requestsRefresh = this._requestsRefresh.bind(this)
  this._timeoutId = null
}

Object.defineProperty(BitX.prototype, 'apiCallRate', {
  get: function () {
    return this._requestsRefresh()
  }
})

BitX.prototype._requestsRefresh = function () {
  var maxMts = Date.now() - 60000
  while (this._requestMts.length > 0) {
    if (this._requestMts[0] < maxMts) {
      this._requestMts.shift()
    } else {
      break
    }
  }

  if (this._requestMts.length > 0) {
    this._timeoutId.refresh()
    this._timeoutId.unref()
  } else {
    clearTimeout(this._timeoutId)
    this._timeoutId = null
  }

  return this._requestMts.length
}

BitX.prototype._request = function (method, resourcePath, data, callback) {
  var headers = Object.assign({}, defaultHeaders)
  data = querystring.stringify(data)
  if (method === 'GET') {
    if (data) {
      resourcePath += '?' + data
    }
  } else if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    headers['Content-Length'] = Buffer.byteLength(data)
  }
  var options = {
    headers: headers,
    hostname: this.hostname,
    path: resourcePath,
    port: this.port,
    auth: this.auth,
    method: method
  }
  if (this.ca) {
    options.ca = this.ca
    options.agent = new https.Agent(options)
  }

  var mts = Date.now()
  var requestMts = this._requestMts
  requestMts.push(mts)
  if (this._timeoutId === null) {
    this._timeoutId = setTimeout(this._requestsRefresh, 60000)
    this._timeoutId.unref()
  }

  var promise = new Promise(function (resolve, reject) {
    var req = https.request(options)

    req.on('response', function (res) {
      var response = ''

      res.setEncoding('utf8')

      res.on('data', function (data) {
        response += data
      })

      res.on('end', function () {
        if (res.statusCode !== 200) {
          var lunoApiError
          try {
            response = JSON.parse(response)
            lunoApiError = new Error('luno API error ' + response.error_code + ': ' + response.error)
            lunoApiError.error_code = response.error_code
            if (response.error_code.includes('429') || response.error_code.includes('ErrTooManyRequests')) {
              var i = requestMts.length - 1
              while (i >= 0) {
                if (requestMts[i] === mts) {
                  requestMts.splice(i, 1)
                  break
                }
                i -= 1
              }
            }
          } catch (err) {
            lunoApiError = new Error('luno API error ' + res.statusCode + ': ' + response)
          }
          if (lunoApiError) {
            if (typeof callback === 'function') {
              return callback(lunoApiError)
            } else {
              return reject(lunoApiError)
            }
          }
        }
        try {
          response = JSON.parse(response)
        } catch (err) {
          if (typeof callback === 'function') {
            return callback(err)
          } else {
            return reject(err)
          }
        }
        if (response.error) {
          var err = new Error(response.error)
          if (typeof callback === 'function') {
            return callback(err)
          } else {
            return reject(err)
          }
        }
        if (typeof callback === 'function') {
          return callback(null, response)
        } else {
          return resolve(response)
        }
      })
    })

    req.on('error', function (err) {
      if (typeof callback === 'function') {
        return callback(err)
      } else {
        return reject(err)
      }
    })

    if (method === 'POST' && data) {
      req.write(data)
    }

    req.end()
  })

  if (typeof callback !== 'function') {
    return promise
  }
}

BitX.prototype.getTicker = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/1/ticker', Object.assign(defaults, options), callback)
}

BitX.prototype.getAllTickers = function (callback) {
  return this._request('GET', '/api/1/tickers', null, callback)
}

BitX.prototype.getOrderBook = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/1/orderbook', Object.assign(defaults, options), callback)
}

BitX.prototype.getTrades = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/1/trades', Object.assign(defaults, options), callback)
}

BitX.prototype.getOrderList = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/1/listorders', Object.assign(defaults, options), callback)
}

BitX.prototype.getOrderListV2 = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/exchange/2/listorders', Object.assign(defaults, options), callback)
}

BitX.prototype.getTradeList = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/1/listtrades', Object.assign(defaults, options), callback)
}

BitX.prototype.getLimits = function (callback) {
  console.log('node-bitx warning: BitX.getLimits is deprecated. Please use BitX.getBalance instead.')
  return this._request('GET', '/api/1/BTCZAR/getlimits', null, callback)
}

BitX.prototype.getFeeInfo = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    pair: this.pair
  }
  return this._request('GET', '/api/1/fee_info', Object.assign(defaults, options), callback)
}

BitX.prototype.stopOrder = function (orderId, callback) {
  var body = {
    order_id: orderId
  }
  return this._request('POST', '/api/1/stoporder', body, callback)
}

BitX.prototype.postBuyOrder = function (volume, price, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var body = {
    type: 'BID',
    volume: volume,
    price: price,
    pair: this.pair
  }
  return this._request('POST', '/api/1/postorder', Object.assign(body, options), callback)
}

BitX.prototype.postMarketBuyOrder = function (volume, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var body = {
    type: 'BUY',
    counter_volume: volume,
    pair: this.pair
  }
  return this._request('POST', '/api/1/marketorder', Object.assign(body, options), callback)
}

BitX.prototype.postSellOrder = function (volume, price, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var body = {
    type: 'ASK',
    volume: volume,
    price: price,
    pair: this.pair
  }
  return this._request('POST', '/api/1/postorder', Object.assign(body, options), callback)
}

BitX.prototype.postMarketSellOrder = function (volume, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var body = {
    type: 'SELL',
    base_volume: volume,
    pair: this.pair
  }
  return this._request('POST', '/api/1/marketorder', Object.assign(body, options), callback)
}

BitX.prototype.getOrder = function (id, callback) {
  return this._request('GET', '/api/1/orders/' + id, null, callback)
}

BitX.prototype.getOrderV2 = function (id, callback) {
  return this._request('GET', '/api/exchange/2/orders/' + id, null, callback)
}

BitX.prototype.getOrderV3 = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  return this._request('GET', '/api/exchange/3/order', options, callback)
}

BitX.prototype.getBalance = function (asset, callback) {
  if (typeof asset === 'function') {
    callback = asset
    asset = null
  }
  return this._request('GET', '/api/1/balance', asset ? {asset: asset} : null, callback)
}

BitX.prototype.getFundingAddress = function (asset, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    asset: asset
  }
  return this._request('GET', '/api/1/funding_address', Object.assign(defaults, options), callback)
}

BitX.prototype.createFundingAddress = function (asset, callback) {
  return this._request('POST', '/api/1/funding_address', {asset: asset}, callback)
}

BitX.prototype.getTransactions = function (asset, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  var defaults = {
    asset: asset,
    offset: 0,
    limit: 10
  }
  return this._request('GET', '/api/1/transactions', Object.assign(defaults, options), callback)
}

BitX.prototype.getWithdrawals = function (callback) {
  return this._request('GET', '/api/1/withdrawals/', null, callback)
}

BitX.prototype.getWithdrawal = function (id, callback) {
  return this._request('GET', '/api/1/withdrawals/' + id, null, callback)
}

BitX.prototype.requestWithdrawal = function (type, amount, callback) {
  var options = {
    type: type,
    amount: amount
  }
  return this._request('POST', '/api/1/withdrawals/', options, callback)
}

BitX.prototype.cancelWithdrawal = function (id, callback) {
  return this._request('DELETE', '/api/1/withdrawals/' + id, null, callback)
}

module.exports = BitX
