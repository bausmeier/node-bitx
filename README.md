# node-bitx
[![Build Status](https://travis-ci.org/bausmeier/node-bitx.png)](https://travis-ci.org/bausmeier/node-bitx)

A simple wrapper for the BitX API.

## Usage
Add bitx as a dependency:

```bash
$ npm install --save bitx
```

### BitX([keyId, keySecret, ][options])
To access the private BitX API methods you must supply your key id and key secret as the first two arguments. If you are only accessing the public API endpoints you can leave these two arguments out.

The optional options argument can be used to override the default options. The default options are equivalent to:

```javascript
{
  hostname: 'api.mybitx.com',
  port: 443,
  ca: undefined,
  pair: 'XBTZAR'
}
```

## Methods
For details about the API endpoints see https://api.mybitx.com/api.

### Callbacks
The arguments passed to the callback function for each method are:

1. An error or `null` if no error occurred.
1. An object containing the data returned by the BitX API.

### getTicker([options, ]callback)
GET https://api.mybitx.com/api/1/ticker

Default options:

```javascript
{
  pair: bitx.pair
}
```

Example:

```javascript
bitx.getTicker(function(err, ticker) {});
```

### getAllTickers(callback)
GET https://api.mybitx.com/api/1/tickers

Example:

```javascript
bitx.getAllTickers(function(err, tickers) {});
```

### getOrderBook([options, ]callback)
GET https://api.mybitx.com/api/1/orderbook

Default options:

```javascript
{
  pair: bitx.pair
}
```

Example:

```javascript
bitx.getOrderBook(function(err, orderBook) {});
```

### getTrades([options, ]callback)
GET https://api.mybitx.com/api/1/trades

Default options:

```javascript
{
  pair: bitx.pair
}
```

Example:

```javascript
bitx.getTrades(function(err, trades) {});
```

### getOrderList([options, ]callback)
GET https://api.mybitx.com/api/1/listorders

Default options:

```javascript
{
  pair: bitx.pair,
  state: undefined
}
```

Example:

```javascript
bitx.getOrderList({state: 'PENDING'}, function(err, orderList) {});
```

### getBalance([asset, ]callback)
GET https://api.mybitx.com/api/1/balance

Example:

```javascript
bitx.getBalance('ZAR', function(err, balance) {});
```

### getFundingAddress(asset, [options, ]callback)
GET https://api.mybitx.com/api/1/funding_address

Default options:

```javascript
{
  address: undefined
}
```

Example:

```javascript
bitx.getFundingAddress('XBT', {address: 'B1tC0InExAMPL3fundIN6AdDreS5t0Use'}, function(err, fundingAddress) {});
```

### createFundingAddress(asset, callback)
POST https://api.mybitx.com/api/1/funding_address

Example:

```javascript
bitx.createFundingAddress('XBT', function(err, fundingAddress) {});
```

### postBuyOrder(volume, price, callback)
POST https://api.mybitx.com/api/1/postorder

Example:

```javascript
bitx.postBuyOrder(9999.99, 0.01, function(err, order) {});
```

### postSellOrder(volume, price, callback)
POST https://api.mybitx.com/api/1/postorder

Example:

```javascript
bitx.postSellOrder(0.01, 9999.99, function(err, order) {});
```

### postMarketBuyOrder(volume, callback)
POST https://api.mybitx.com/api/1/marketorder

Example:

```javascript
bitx.postMarketBuyOrder(0.01, function(err, order) {});
```

### postMarketSellOrder(volume, callback)
POST https://api.mybitx.com/api/1/marketorder

Example:

```javascript
bitx.postMarketSellOrder(0.01, function(err, order) {});
```

### stopOrder(orderId, callback)
POST https://api.mybitx.com/api/1/stoporder

Example:

```javascript
bitx.stopOrder('BXMC2CJ7HNB88U4', function(err, result) {});
```

### getOrder(orderId, callback)
GET https://api.mybitx.com/api/1/orders/{orderId}

Example:

```javascript
bitx.getOrder('BXHW6PFRRXKFSB4', function(err, result) {});
```

### getTransactions(asset, [options, ]callback)
GET https://api.mybitx.com/api/1/transactions

Default options:
```javascript
{
  offset: 0,
  limit: 10
}
```

Example:

```javascript
bitx.getTransactions('XBT', {offset: 5, limit: 20}, function(err, transactions) {});
```

### getWithdrawals(callback)
GET https://api.mybitx.com/api/1/withdrawals

Example:

```javascript
bitx.getWithdrawals(function(err, withdrawals) {});
```

### getWithdrawal(withdrawalId, callback)
GET https://api.mybitx.com/api/1/withdrawals/{withdrawalId}

Example:

```javascript
bitx.getWithdrawal('1212', function(err, withdrawal) {});
```

### requestWithdrawal(type, amount, callback)
POST https://api.mybitx.com/api/1/withdrawals

Example:

```javascript
bitx.requestWithdrawal('ZAR_EFT', 1000, function(err, withdrawal) {});
```

### cancelWithdrawal(withdrawalId, callback)
DELETE https://api.mybitx.com/api/1/withdrawals/{withdrawalId}

Example:

```javascript
bitx.cancelWithdrawal('1212', function(err, withdrawal) {});
```

## Contributing

Like my work? Please donate **1E1sebnWax5Br2mp8y9dox6oX9Snmf42uz**.

Don't like it? Open a pull request or create an issue and help me improve it.
