'use strict';

var https = require('https'),
    fs = require('fs'),
    path = require('path');

var basePath = '/api/1/BTCZAR/';

function BitX(options) {
  if (!(this instanceof BitX)) {
    return new BitX(options);
  }
  options = options || {};
  this.hostname = options.hostname || 'bitx.co.za';
  this.port = options.port || 443;
  this.headers = {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8'
  };
}

BitX.prototype._request = function(resourcePath, callback) {
  var options = {
    headers: this.headers,
    hostname: this.hostname,
    path: path.join(basePath, resourcePath),
    port: this.port
  };
  var req = https.get(options);
  
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
  
  req.end();
};

BitX.prototype.getTicker = function(callback) {
  this._request('ticker', callback);
};

BitX.prototype.getOrderBook = function(callback) {
  this._request('orderbook', callback);
};

BitX.prototype.getTrades = function(callback) {
  this._request('trades', callback);
};

BitX.prototype.getOrderList = function(callback) {
  this._request('listorders', callback);
};

module.exports = BitX;