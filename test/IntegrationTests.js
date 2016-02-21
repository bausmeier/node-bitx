'use strict'

var BitX = require('../lib/BitX')
var fs = require('fs')
var https = require('https')
var path = require('path')
var querystring = require('querystring')
var tap = require('tap')

var port = process.env.PORT || 8001
var bitx = new BitX('keyId', 'keySecret', {
  hostname: 'localhost',
  port: port,
  ca: fs.readFileSync(path.join(__dirname, 'ssl', 'ca', 'root.pem'))
})
var options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.crt'))
}
var server = https.createServer(options).listen(port, 'localhost')

tap.afterEach(function (done) {
  server.removeAllListeners('request')
  done()
})

tap.tearDown(function (done) {
  server.close(done)
})

tap.test('getTicker returns expected ticker', function (t) {
  var expectedTicker = {
    timestamp: 1366224386716,
    currency: 'ZAR',
    bid: '924.00',
    ask: '1050.00',
    last_trade: '950.00',
    rolling_24_hour_volume: '12.52'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/ticker?pair=XBTZAR')
    res.end(JSON.stringify(expectedTicker))
  })

  bitx.getTicker(function (err, ticker) {
    t.ifErr(err)
    t.deepEqual(ticker, expectedTicker)
    t.end()
  })
})

tap.test('getAllTickers returns expected tickers', function (t) {
  var expectedTickers = {
    tickers: [
      {
        timestamp: 1405413955793,
        bid: '6801.00',
        ask: '6900.00',
        last_trade: '6900.00',
        rolling_24_hour_volume: '12.455579',
        pair: 'XBTZAR'
      },
      {
        timestamp: 1405413955337,
        bid: '5000.00',
        ask: '6968.00',
        last_trade: '6830.00',
        rolling_24_hour_volume: '0.00',
        pair: 'XBTNAD'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/tickers')
    res.end(JSON.stringify(expectedTickers))
  })

  bitx.getAllTickers(function (err, tickers) {
    t.ifErr(err)
    t.deepEqual(tickers, expectedTickers)
    t.end()
  })
})

tap.test('getOrderBook returns the expected order book', function (t) {
  var expectedOrderBook = {
    timestamp: 1366305398592,
    currency: 'ZAR',
    asks: [
      {price: '1180.00', volume: '0.10'},
      {price: '2000.00', volume: '0.10'}
    ],
    bids: [
      {price: '1100.00', volume: '0.10'},
      {price: '1000.00', volume: '0.10'},
      {price: '900.00', volume: '0.10'}
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/orderbook?pair=XBTZAR')
    res.end(JSON.stringify(expectedOrderBook))
  })

  bitx.getOrderBook(function (err, orderBook) {
    t.ifErr(err)
    t.deepEqual(orderBook, expectedOrderBook)
    t.end()
  })
})

tap.test('getTrades should return the expected trades', function (t) {
  var expectedTrades = {
    currency: 'ZAR',
    trades: [
      {timestamp: 1366052621774, price: '1000.00', volume: '0.10'},
      {timestamp: 1366052621770, price: '1020.50', volume: '1.20'}
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/trades?pair=XBTZAR')
    res.end(JSON.stringify(expectedTrades))
  })

  bitx.getTrades(function (err, trades) {
    t.ifErr(err)
    t.deepEqual(trades, expectedTrades)
    t.end()
  })
})

tap.test('getOrderList should return the expected order list', function (t) {
  var expectedOrderList = {
    orders: [
      {
        order_id: 'BXMC2CJ7HNB88U4',
        creation_timestamp: 1367849297609,
        expiration_timestamp: 1367935697609,
        type: 'ASK',
        state: 'PENDING',
        limit_price: '1000.00',
        limit_volume: '0.80',
        btc: '0.00',
        zar: '0.00',
        fee_btc: '0.00',
        fee_zar: '0.00'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/listorders?pair=XBTZAR')
    res.end(JSON.stringify(expectedOrderList))
  })

  bitx.getOrderList(function (err, orderList) {
    t.ifErr(err)
    t.deepEqual(orderList, expectedOrderList)
    t.end()
  })
})

tap.test('getOrderList should return the expected order list for the given state', function (t) {
  var expectedOrderList = {
    orders: [
      {
        order_id: 'BXMC2CJ7HNB88U4',
        creation_timestamp: 1367849297609,
        expiration_timestamp: 1367935697609,
        type: 'ASK',
        state: 'PENDING',
        limit_price: '1000.00',
        limit_volume: '0.80',
        btc: '0.00',
        zar: '0.00',
        fee_btc: '0.00',
        fee_zar: '0.00'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/listorders?pair=XBTZAR&state=PENDING')
    res.end(JSON.stringify(expectedOrderList))
  })

  var options = {
    state: 'PENDING'
  }
  bitx.getOrderList(options, function (err, orderList) {
    t.ifErr(err)
    t.deepEqual(orderList, expectedOrderList)
    t.end()
  })
})

tap.test('getLimits should return the expected limits', function (t) {
  var expectedLimits = {
    ask_btc_limit: '1.00',
    bid_zar_limit: '1000.00'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/BTCZAR/getlimits')
    res.end(JSON.stringify(expectedLimits))
  })

  bitx.getLimits(function (err, limits) {
    t.ifErr(err)
    t.deepEqual(limits, expectedLimits)
    t.end()
  })
})

tap.test('postBuyOrder should post the correct fields and return an order id', function (t) {
  var expectedOrder = {order_id: 'BXMC2CJ7HNB88U4'}
  var volume = 9999.99
  var price = 0.0001

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/postorder')
    t.equal(req.headers['content-type'], 'application/x-www-form-urlencoded')
    var body = ''
    req.on('data', function (data) {
      body += data
    })
    req.on('end', function () {
      body = querystring.parse(body)
      t.equal(body.type, 'BID')
      t.equal(body.volume, volume.toString())
      t.equal(body.price, price.toString())
      t.equal(body.pair, 'XBTZAR')
      res.end(JSON.stringify(expectedOrder))
    })
  })

  bitx.postBuyOrder(volume, price, function (err, order) {
    t.ifErr(err)
    t.deepEqual(order, expectedOrder)
    t.end()
  })
})

tap.test('postBuyOrder should return an error if the order would exceed order limits', function (t) {
  var expectedError = 'Order would exceed your order limits.'

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/postorder')
    res.end(JSON.stringify({error: expectedError}))
  })

  bitx.postBuyOrder(9999.99, 0.01, function (err) {
    t.equal(err.message, expectedError)
    t.end()
  })
})

tap.test('postSellOrder should post the correct fields and return an order id', function (t) {
  var expectedOrder = {order_id: 'BXMC2CJ7HNB88U4'}
  var volume = 0.001
  var price = 9999.99

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/postorder')
    t.equal(req.headers['content-type'], 'application/x-www-form-urlencoded')
    var body = ''
    req.on('data', function (data) {
      body += data
    })
    req.on('end', function () {
      body = querystring.parse(body)
      t.equal(body.type, 'ASK')
      t.equal(body.volume, volume.toString())
      t.equal(body.price, price.toString())
      t.equal(body.pair, 'XBTZAR')
      res.end(JSON.stringify(expectedOrder))
    })
  })

  bitx.postSellOrder(volume, price, function (err, order) {
    t.ifErr(err)
    t.deepEqual(order, expectedOrder)
    t.end()
  })
})

tap.test('stopOrder should post the order id and return success', function (t) {
  var expectedResult = {success: true}
  var orderId = 'BXMC2CJ7HNB88U4'

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/stoporder')
    t.equal(req.headers['content-type'], 'application/x-www-form-urlencoded')
    var body = ''
    req.on('data', function (data) {
      body += data
    })
    req.on('end', function () {
      body = querystring.parse(body)
      t.equal(body.order_id, orderId)
      res.end(JSON.stringify(expectedResult))
    })
  })

  bitx.stopOrder(orderId, function (err, result) {
    t.ifErr(err)
    t.deepEqual(result, expectedResult)
    t.end()
  })
})

tap.test('stopOrder should return an error if the order is unknown or non-pending', function (t) {
  var expectedError = 'Cannot stop unknown or non-pending order'

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/stoporder')
    res.end(JSON.stringify({error: expectedError}))
  })

  bitx.stopOrder('BXMC2CJ7HNB88U4', function (err) {
    t.equal(err.message, expectedError)
    t.end()
  })
})

tap.test('getOrder should return the order', function (t) {
  var expectedOrder = {
    order_id: 'BXHW6PFRRXKFSB4',
    creation_timestamp: 1402866878367,
    expiration_timestamp: 0,
    type: 'ASK',
    state: 'PENDING',
    limit_price: '6500.00',
    limit_volume: '0.05',
    base: '0.03',
    counter: '195.02',
    fee_base: '0.000',
    fee_counter: '0.00',
    trades: [
      {
        price: '6501.00',
        timestamp: 1402866878467,
        volume: '0.02'
      },
      {
        price: '6500.00',
        timestamp: 1402866878567,
        volume: '0.01'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/orders/BXHW6PFRRXKFSB4')
    res.end(JSON.stringify(expectedOrder))
  })

  bitx.getOrder('BXHW6PFRRXKFSB4', function (err, order) {
    t.ifErr(err)
    t.deepEqual(order, expectedOrder)
    t.end()
  })
})

tap.test('getBalance should return all balances when no asset parameter is provided', function (t) {
  var expectedBalances = {
    balance: [
      {
        account_id: '1224342323',
        asset: 'XBT',
        balance: '1.012423',
        reserved: '0.01',
        unconfirmed: '0.421'
      }, {
        account_id: '2997473',
        asset: 'ZAR',
        balance: '1000.00',
        reserved: '0.00',
        unconfirmed: '0.00'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/balance')
    res.end(JSON.stringify(expectedBalances))
  })

  bitx.getBalance(function (err, balances) {
    t.ifErr(err)
    t.deepEqual(balances, expectedBalances)
    t.end()
  })
})

tap.test('getBalance should return the balance for the specified asset', function (t) {
  var expectedBalances = {
    balance: [
      {
        asset: 'ZAR',
        balance: '1000.00',
        reserved: '800.00'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/balance?asset=ZAR')
    res.end(JSON.stringify(expectedBalances))
  })

  bitx.getBalance('ZAR', function (err, balances) {
    t.ifErr(err)
    t.deepEqual(balances, expectedBalances)
    t.end()
  })
})

tap.test('getFundingAddress should return the funding address', function (t) {
  var expectedFundingAddress = {
    asset: 'XBT',
    address: 'B1tC0InExAMPL3fundIN6AdDreS5t0Use',
    total_received: '1.234567',
    total_unconfirmed: '0.00'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/funding_address?asset=XBT')
    res.end(JSON.stringify(expectedFundingAddress))
  })

  bitx.getFundingAddress('XBT', function (err, fundingAddress) {
    t.ifErr(err)
    t.deepEqual(fundingAddress, expectedFundingAddress)
    t.end()
  })
})

tap.test('getFundingAddress should return the funding address specified', function (t) {
  var expectedFundingAddress = {
    asset: 'XBT',
    address: 'B1tC0InExAMPL3fundIN6AdDreS5t0Use',
    total_received: '1.234567',
    total_unconfirmed: '0.00'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/funding_address?asset=XBT&address=B1tC0InExAMPL3fundIN6AdDreS5t0Use')
    res.end(JSON.stringify(expectedFundingAddress))
  })

  var options = {
    address: 'B1tC0InExAMPL3fundIN6AdDreS5t0Use'
  }
  bitx.getFundingAddress('XBT', options, function (err, fundingAddress) {
    t.ifErr(err)
    t.deepEqual(fundingAddress, expectedFundingAddress)
    t.end()
  })
})

tap.test('createFundingAddress should return a new funding address', function (t) {
  var expectedFundingAddress = {
    asset: 'XBT',
    address: 'B1tC0InExAMPL3fundIN6AdDreS5t0Use',
    total_received: '0.00',
    total_unconfirmed: '0.00'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/funding_address')
    var body = ''
    req.on('data', function (data) {
      body += data
    })
    req.on('end', function () {
      body = querystring.parse(body)
      t.equal(body.asset, 'XBT')
      res.end(JSON.stringify(expectedFundingAddress))
    })
  })

  bitx.createFundingAddress('XBT', function (err, fundingAddress) {
    t.ifErr(err)
    t.deepEqual(fundingAddress, expectedFundingAddress)
    t.end()
  })
})

tap.test('getTransactions should return the transactions', function (t) {
  var expectedTransactions = {
    total_count: 77,
    transactions: [
      {
        description: 'test send to email address',
        timestamp: 1397548704000,
        txid: '',
        amount: '-0.01',
        address: 'test349873498@example.com',
        type: 'SEND',
        pending: false
      },
      {
        description: 'R 5.44498',
        timestamp: 1398596345020,
        txid: '',
        amount: '0.00099',
        address: '',
        type: 'BUY',
        pending: false
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/transactions?asset=XBT&offset=0&limit=10')
    res.end(JSON.stringify(expectedTransactions))
  })

  bitx.getTransactions('XBT', function (err, transactions) {
    t.ifErr(err)
    t.deepEqual(transactions, expectedTransactions)
    t.end()
  })
})

tap.test('getTransactions should send options and return the transactions', function (t) {
  var expectedTransactions = {
    total_count: 77,
    transactions: [
      {
        description: 'test send to email address',
        timestamp: 1397548704000,
        txid: '',
        amount: '-0.01',
        address: 'test349873498@example.com',
        type: 'SEND',
        pending: false
      },
      {
        description: 'R 5.44498',
        timestamp: 1398596345020,
        txid: '',
        amount: '0.00099',
        address: '',
        type: 'BUY',
        pending: false
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/transactions?asset=XBT&offset=5&limit=5')
    res.end(JSON.stringify(expectedTransactions))
  })

  var options = {
    offset: 5,
    limit: 5
  }
  bitx.getTransactions('XBT', options, function (err, transactions) {
    t.ifErr(err)
    t.deepEqual(transactions, expectedTransactions)
    t.end()
  })
})

tap.test('getWithdrawals should return the withdrawals', function (t) {
  var expectedWithdrawls = {
    withdrawals: [
      {
        status: 'PENDING',
        id: '2221'
      },
      {
        status: 'COMPLETED',
        id: '1121'
      }
    ]
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/withdrawals/')
    res.end(JSON.stringify(expectedWithdrawls))
  })

  bitx.getWithdrawals(function (err, withdrawals) {
    t.ifErr(err)
    t.deepEqual(withdrawals, expectedWithdrawls)
    t.end()
  })
})

tap.test('getWithdrawal should return the withdrawal', function (t) {
  var expectedWithdrawal = {
    status: 'COMPLETED',
    id: '1212'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'GET')
    t.equal(req.url, '/api/1/withdrawals/1212')
    res.end(JSON.stringify(expectedWithdrawal))
  })

  bitx.getWithdrawal('1212', function (err, withdrawal) {
    t.ifErr(err)
    t.deepEqual(withdrawal, expectedWithdrawal)
    t.end()
  })
})

tap.test('requestWithdrawal should post the correct fields and return a new withdrawal', function (t) {
  var expectedWithdrawal = {
    status: 'PENDING',
    id: '1212'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'POST')
    t.equal(req.url, '/api/1/withdrawals/')
    var body = ''
    req.on('data', function (data) {
      body += data
    })
    req.on('end', function () {
      body = querystring.parse(body)
      t.equal(body.type, 'ZAR_EFT')
      t.equal(body.amount, '1000')
      res.end(JSON.stringify(expectedWithdrawal))
    })
  })

  bitx.requestWithdrawal('ZAR_EFT', 1000, function (err, withdrawal) {
    t.ifErr(err)
    t.deepEqual(withdrawal, expectedWithdrawal)
    t.end()
  })
})

tap.test('cancelWithdrawal should delete the specified withdrawal', function (t) {
  var expectedWithdrawal = {
    status: 'CANCELLED',
    id: '1212'
  }

  server.on('request', function (req, res) {
    t.equal(req.method, 'DELETE')
    t.equal(req.url, '/api/1/withdrawals/1212')
    res.end(JSON.stringify(expectedWithdrawal))
  })

  bitx.cancelWithdrawal('1212', function (err, withdrawal) {
    t.ifErr(err)
    t.deepEqual(withdrawal, expectedWithdrawal)
    t.end()
  })
})
