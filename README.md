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

### getTicker(callback)
GET https://api.mybitx.com/api/1/ticker

### getOrderBook(callback)
GET https://api.mybitx.com/api/1/orderbook

### getTrades(callback)
GET https://api.mybitx.com/api/1/trades

### getOrderList([state, ]callback)
GET https://api.mybitx.com/api/1/listorders

Results can be restricted to only open orders by specifying the optional state argument with the value `PENDING`.

### getBalance(asset, callback)
GET https://api.mybitx.com/api/1/balance

### getFundingAddress(options, callback)
GET https://api.mybitx.com/api/1/funding_address

The `options` argument can either be an asset string e.g. `'XBT'` or an object containing the query parameters to send e.g. `{asset: 'XBT' /*required*/, address: '1E1sebnWax5Br2mp8y9dox6oX9Snmf42uz'}`.

### createFundingAddress(asset, callback)
POST https://api.mybitx.com/api/1/funding_address

### postBuyOrder(volume, price, callback)
POST https://api.mybitx.com/api/1/postorder

### postSellOrder(volume, price, callback)
POST https://api.mybitx.com/api/1/postorder

### stopOrder(orderId, callback)
POST https://api.mybitx.com/api/1/stoporder

### getTransactions(options, callback)
GET https://api.mybitx.com/api/1/transactions

Options:
```javascript
{
  asset: 'XBT', //required
  offset: 0,
  limit: 10
}
```

### getWithdrawals(callback)
GET https://api.mybitx.com/api/1/withdrawals

### getWithdrawal(withdrawalId, callback)
GET https://api.mybitx.com/api/1/withdrawals/{withdrawalId}

## Contributing

Like my work? Please donate **1E1sebnWax5Br2mp8y9dox6oX9Snmf42uz**.

Don't like it? Open a pull request or create an issue and help me improve it.
