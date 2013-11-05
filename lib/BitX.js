'use strict';

var https = require('https'),
    fs = require('fs'),
    path = require('path');

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
  this.headers = {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8'
  };
}

BitX.prototype._request = function(method, resourcePath, data, callback) {
  var content;
  if (typeof data === 'function') {
    callback = data;
  } else {
    content = JSON.stringify(data);
    this.headers['Content-Type'] = 'application/json';
    this.headers['Content-Length'] = Buffer.byteLength(content);
  }
  var options = {
    headers: this.headers,
    hostname: this.hostname,
    path: path.join(basePath, resourcePath),
    port: this.port,
    auth: this.auth,
    method: method
  };
  var req = https.request(options);
  
  req.on('response', function(res) {
    var response = '';
    
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
  
  if (content) {
    req.write(content);
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

module.exports = BitX;