'use strict';

var https = require('https'),
    fs = require('fs'),
    path = require('path'),
    querystring = require('querystring'),
    config = require(path.join(__dirname, '..', 'package'));

var basePath = '/api/1/BTCZAR/';

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
  this.headers = {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'User-Agent': 'node-bitx v' + config.version
  };
}

BitX.prototype._request = function(method, resourcePath, data, callback) {
  if (typeof data === 'function') {
    callback = data;
    data = null;
  } else {
    data = querystring.stringify(data);
    this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    this.headers['Content-Length'] = Buffer.byteLength(data);
  }
  var options = {
    headers: this.headers,
    hostname: this.hostname,
    path: path.join(basePath, resourcePath),
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
      if (res.statusCode === 401) {
        callback(new Error('Unauthorized'));
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

  if (data) {
    req.write(data);
  }

  req.end();
};

BitX.prototype.getTicker = function(callback) {
  this._request('GET', 'ticker', callback);
};

BitX.prototype.getOrderBook = function(callback) {
  this._request('GET', 'orderbook', callback);
};

BitX.prototype.getTrades = function(callback) {
  this._request('GET', 'trades', callback);
};

BitX.prototype.getOrderList = function(callback) {
  this._request('GET', 'listorders', callback);
};

BitX.prototype.getLimits = function(callback) {
  this._request('GET', 'getlimits', callback);
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
    price: price
  };
  this._request('POST', 'postorder', body, callback);
};

BitX.prototype.postSellOrder = function(volume, price, callback) {
  var body = {
    type: 'ASK',
    volume: volume,
    price: price
  };
  this._request('POST', 'postorder', body, callback);
};

module.exports = BitX;
