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
  hostname: 'bitx.co.za',
  port: 443,
  ca: undefined
}
```

## Methods
For details about the API endpoints see https://bitx.co.za/api.

### getTicker(callback)
GET https://bitx.co.za/api/1/BTCZAR/ticker

### getOrderBook(callback)
GET https://bitx.co.za/api/1/BTCZAR/orderbook 

### getTrades(callback)
GET https://bitx.co.za/api/1/BTCZAR/trades

### getOrderList(callback)
GET https://bitx.co.za/api/1/BTCZAR/listorders

### getLimits(callback)
GET https://bitx.co.za/api/1/BTCZAR/listorders

### postBuyOrder(volume, price, callback)
POST https://bitx.co.za/api/1/BTCZAR/postorder

### postSellOrder(volume, price, callback)
POST https://bitx.co.za/api/1/BTCZAR/postorder

### stopOrder(orderId, price, callback)
POST https://bitx.co.za/api/1/BTCZAR/stoporder

## Contributing

Like my work? Please donate 1E1sebnWax5Br2mp8y9dox6oX9Snmf42uz.

Don't like it? Open a pull request or create an issue and help me improve it.