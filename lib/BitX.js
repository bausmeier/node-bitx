'use strict';

var https = require('https'),
    fs = require('fs'),
    path = require('path'),
    querystring = require('querystring'),
    config = require(path.join(__dirname, '..', 'package')),
    url = require('url'),
    util = require('util');

var basePath = '/api/1/',
    extend = util._extend;

function BitX(keyId, keySecret, options) {
  if (!(this instanceof BitX)) {
    return new BitX(keyId, keySecret, options);
  }
  if (typeof keyId === 'string') {
    this.auth = keyId + ':' + keySecret;
  } else {
    options = keyId;
  }
  options = options || {};
  this.hostname = options.hostname || 'bitx.co.za';
  this.port = options.port || 443;
  this.ca = options.ca;
  this.pair = options.pair || 'XBTZAR';
  this.headers = {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'User-Agent': 'node-bitx v' + config.version
  };
}

BitX.prototype._request = function(method, resourcePath, data, callback) {
  data = querystring.stringify(data);
  if (method === 'GET') {
    if (data) {
      resourcePath += '?' + data;
    }
  } else if (method === 'POST') {
    this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    this.headers['Content-Length'] = Buffer.byteLength(data);
  }
  var options = {
    headers: this.headers,
    hostname: this.hostname,
    path: url.resolve(basePath, resourcePath),
    port: this.port,
    auth: this.auth,
    method: method
  };
  if (this.ca) {
    options.ca = this.ca;
    options.agent = new https.Agent(options);
  }
  var req = https.request(options);

  req.on('response', function(res) {
    var response = '';

    res.setEncoding('utf8');

    res.on('data', function(data) {
      response += data;
    });

    res.on('end', function() {
      if (res.statusCode !== 200) {
        callback(new Error('BitX error ' + res.statusCode + ': ' + response));
      } else {
        try {
          response = JSON.parse(response);
          if (response.error) {
            callback(new Error(response.error));
          } else {
            callback(null, response);
          }
        } catch (err) {
          callback(err);
        }
      }
    });
  });

  req.on('error', function(err) {
    callback(err);
  });

  if (method === 'POST' && data) {
    req.write(data);
  }

  req.end();
};

BitX.prototype.getTicker = function(callback) {
  this._request('GET', 'ticker', {pair: this.pair}, callback);
};

BitX.prototype.getOrderBook = function(callback) {
  this._request('GET', 'orderbook', {pair: this.pair}, callback);
};

BitX.prototype.getTrades = function(callback) {
  this._request('GET', 'trades', {pair: this.pair}, callback);
};

BitX.prototype.getOrderList = function(state, callback) {
  var options = {
    pair: this.pair
  };
  if (typeof state === 'function') {
    callback = state;
  } else {
    options.state = state;
  }
  this._request('GET', 'listorders', options, callback);
};

BitX.prototype.getLimits = function(callback) {
  console.log('node-bitx warning: BitX.getLimits is deprecated. Please use BitX.getBalance instead.')
  this._request('GET', 'BTCZAR/getlimits', null, callback);
};

BitX.prototype.stopOrder = function(orderId, callback) {
  var body = {
    order_id: orderId
  };
  this._request('POST', 'stoporder', body, callback);
};

BitX.prototype.postBuyOrder = function(volume, price, callback) {
  var body = {
    type: 'BID',
    volume: volume,
    price: price,
    pair: this.pair
  };
  this._request('POST', 'postorder', body, callback);
};

BitX.prototype.postSellOrder = function(volume, price, callback) {
  var body = {
    type: 'ASK',
    volume: volume,
    price: price,
    pair: this.pair
  };
  this._request('POST', 'postorder', body, callback);
};

BitX.prototype.getBalance = function(asset, callback) {
  this._request('GET', 'balance', {asset: asset}, callback);
};

BitX.prototype.getFundingAddress = function(options, callback) {
  if (typeof options === 'string') {
    options = {
      asset: options
    };
  }
  this._request('GET', 'funding_address', options, callback);
};

BitX.prototype.createFundingAddress = function(asset, callback) {
  this._request('POST', 'funding_address', {asset: asset}, callback);
};

BitX.prototype.getTransactions = function(options, callback) {
  var defaults = {
    offset: 0,
    limit: 10
  };
  this._request('GET', 'transactions', extend(defaults, options), callback);
};

module.exports = BitX;
