'use strict';

var BitX = require('../lib/BitX');
var fs = require('fs');
var https = require('https');
var Lab = require('lab');
var path = require('path');
var querystring = require('querystring');

var expect = Lab.assertions;
var lab = exports.lab = Lab.script();

var port = process.env.PORT || 8001;

lab.describe('BitX', function () {

	var bitx,
		server;

	lab.before(function (done) {
		bitx = new BitX('keyId', 'keySecret', {
			hostname : 'localhost',
			port     : port,
			ca       : fs.readFileSync(path.join(__dirname, 'ssl', 'ca', 'root.pem'))
		});
		var options = {
			key  : fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.key')),
			cert : fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.crt'))
		};
		server = https.createServer(options).listen(port, 'localhost', done);
	});

	lab.afterEach(function (done) {
		server.removeAllListeners('request');
		done();
	});

	lab.after(function (done) {
		server.close(done);
	});

	lab.describe('getTicker', function () {

		lab.it('should return a ticker', function (done) {
			var expectedTicker = {
				timestamp              : 1366224386716,
				currency               : 'ZAR',
				bid                    : '924.00',
				ask                    : '1050.00',
				last_trade             : '950.00',
				rolling_24_hour_volume : '12.52'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/ticker?pair=XBTZAR');
				res.end(JSON.stringify(expectedTicker));
			});

			bitx.getTicker(function (err, ticker) {
				expect(ticker).to.eql(expectedTicker);
				done(err);
			});
		});
	});

	lab.describe('getAllTickers', function () {

		lab.it('should return all tickers', function (done) {
			var expectedTickers = {
				tickers : [
					{
						timestamp              : 1405413955793,
						bid                    : '6801.00',
						ask                    : '6900.00',
						last_trade             : '6900.00',
						rolling_24_hour_volume : '12.455579',
						pair                   : 'XBTZAR'
					},
					{
						timestamp              : 1405413955337,
						bid                    : '5000.00',
						ask                    : '6968.00',
						last_trade             : '6830.00',
						rolling_24_hour_volume : '0.00',
						pair                   : 'XBTNAD'
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/tickers');
				res.end(JSON.stringify(expectedTickers));
			});

			bitx.getAllTickers(function (err, tickers) {
				expect(tickers).to.eql(expectedTickers);
				done(err);
			});
		});
	});

	lab.describe('getOrderBook', function () {

		lab.it('should return the order book', function (done) {
			var expectedOrderBook = {
				timestamp : 1366305398592,
				currency  : 'ZAR',
				asks      : [
					{price : '1180.00', volume : '0.10'},
					{price : '2000.00', volume : '0.10'}
				],
				bids      : [
					{price : '1100.00', volume : '0.10'},
					{price : '1000.00', volume : '0.10'},
					{price : '900.00', volume : '0.10'}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/orderbook?pair=XBTZAR');
				res.end(JSON.stringify(expectedOrderBook));
			});

			bitx.getOrderBook(function (err, orderBook) {
				expect(orderBook).to.eql(expectedOrderBook);
				done(err);
			});
		});
	});

	lab.describe('getTrades', function () {

		lab.it('should return the trades', function (done) {
			var expectedTrades = {
				currency : 'ZAR',
				trades   : [
					{timestamp : 1366052621774, price : '1000.00', volume : '0.10'},
					{timestamp : 1366052621770, price : '1020.50', volume : '1.20'}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/trades?pair=XBTZAR');
				res.end(JSON.stringify(expectedTrades));
			});

			bitx.getTrades(function (err, trades) {
				expect(trades).to.eql(expectedTrades);
				done(err);
			});
		});
	});

	lab.describe('getOrderList', function () {

		lab.it('should return the order list', function (done) {
			var expectedOrderList = {
				orders : [
					{
						order_id             : 'BXMC2CJ7HNB88U4',
						creation_timestamp   : 1367849297609,
						expiration_timestamp : 1367935697609,
						type                 : 'ASK',
						state                : 'PENDING',
						limit_price          : '1000.00',
						limit_volume         : '0.80',
						btc                  : '0.00',
						zar                  : '0.00',
						fee_btc              : '0.00',
						fee_zar              : '0.00'
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/listorders?pair=XBTZAR');
				res.end(JSON.stringify(expectedOrderList));
			});

			bitx.getOrderList(function (err, orderlist) {
				expect(orderlist).to.eql(expectedOrderList);
				done(err);
			});
		});

		lab.it('should return the order list for the given state', function (done) {
			var expectedOrderList = {
				orders : [
					{
						order_id             : 'BXMC2CJ7HNB88U4',
						creation_timestamp   : 1367849297609,
						expiration_timestamp : 1367935697609,
						type                 : 'ASK',
						state                : 'PENDING',
						limit_price          : '1000.00',
						limit_volume         : '0.80',
						btc                  : '0.00',
						zar                  : '0.00',
						fee_btc              : '0.00',
						fee_zar              : '0.00'
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/listorders?pair=XBTZAR&state=PENDING');
				res.end(JSON.stringify(expectedOrderList));
			});

			var options = {
				state : 'PENDING'
			};
			bitx.getOrderList(options, function (err, orderlist) {
				expect(orderlist).to.eql(expectedOrderList);
				done(err);
			});
		});
	});

	lab.describe('getLimits', function () {

		lab.it('should return the limits', function (done) {
			var expectedLimits = {
				ask_btc_limit : '1.00',
				bid_zar_limit : '1000.00'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/BTCZAR/getlimits');
				res.end(JSON.stringify(expectedLimits));
			});

			bitx.getLimits(function (err, limits) {
				expect(limits).to.eql(expectedLimits);
				done(err);
			});
		});
	});

	lab.describe('postBuyOrder', function () {

		lab.it('should post the correct fields and return an order id', function (done) {
			var expectedOrder = {order_id : 'BXMC2CJ7HNB88U4'};
			var volume = 9999.99;
			var price = 0.0001;

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/postorder');
				expect(req.headers).to.have.property('content-type', 'application/x-www-form-urlencoded');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('type', 'BID');
					expect(body).to.have.property('volume', volume.toString());
					expect(body).to.have.property('price', price.toString());
					expect(body).to.have.property('pair', 'XBTZAR');
					res.end(JSON.stringify(expectedOrder));
				});
			});

			bitx.postBuyOrder(volume, price, function (err, order) {
				expect(order).to.eql(expectedOrder);
				done(err);
			});
		});

		lab.it('should return an error if the order would exceed order limits', function (done) {
			var expectedError = 'Order would exceed your order limits.';

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/postorder');
				res.end(JSON.stringify({error : expectedError}));
			});

			bitx.postBuyOrder(9999.99, 0.01, function (err) {
				expect(err).to.have.property('message', expectedError);
				done();
			});
		});
	});

	lab.describe('postSellOrder', function () {

		lab.it('should post the correct fields and return an order id', function (done) {
			var expectedOrder = {order_id : 'BXMC2CJ7HNB88U4'};
			var volume = 0.001;
			var price = 9999.99;

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/postorder');
				expect(req.headers).to.have.property('content-type', 'application/x-www-form-urlencoded');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('type', 'ASK');
					expect(body).to.have.property('volume', volume.toString());
					expect(body).to.have.property('price', price.toString());
					expect(body).to.have.property('pair', 'XBTZAR');
					res.end(JSON.stringify(expectedOrder));
				});
			});

			bitx.postSellOrder(volume, price, function (err, order) {
				expect(order).to.eql(expectedOrder);
				done(err);
			});
		});
	});

	lab.describe('postMarketOrder', function () {

		lab.it('should post the correct fields and return an order id', function (done) {
			var expectedOrder = {order_id : 'BXMC2CJ7HNB88U4'};
			var counter_volume = 100.50;
			var pair = 'XBTZAR';
			var type = 'BUY';

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/postmarketorder');
				expect(req.headers).to.have.property('content-type', 'application/x-www-form-urlencoded');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('type', type);
					expect(body).to.have.property('counter_volume', counter_volume.toString());
					expect(body).to.have.property('pair', pair);
					res.end(JSON.stringify(expectedOrder));
				});
			});

			bitx.postMarketOrder(pair, type, function (err, order) {
				expect(order).to.eql(expectedOrder);
				done(err);
			});
		});
	});

	lab.describe('send', function () {

		lab.it('should post the correct fields and return a success', function (done) {
			var expectedOrder = {success : 'true'};
			var amount = 0.001;
			var currency = '0.001';
			var address = '0.001';

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/send');
				expect(req.headers).to.have.property('content-type', 'application/x-www-form-urlencoded');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('amount', amount.toString());
					expect(body).to.have.property('currency', 'XBT');
					expect(body).to.have.property('address', '');
					res.end(JSON.stringify(expectedOrder));
				});
			});

			bitx.send(amount, currency, address, function (err, order) {
				expect(order).to.eql(expectedOrder);
				done(err);
			});
		});
	});

	lab.describe('stopOrder', function () {

		lab.it('should post the order id and return success', function (done) {
			var expectedResult = {success : true};
			var orderId = 'BXMC2CJ7HNB88U4';

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/stoporder');
				expect(req.headers).to.have.property('content-type', 'application/x-www-form-urlencoded');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('order_id', orderId);
					res.end(JSON.stringify(expectedResult));
				});
			});

			bitx.stopOrder(orderId, function (err, result) {
				expect(result).to.have.property('success', true);
				done(err);
			});
		});

		lab.it('should return an error if the order is unknown or non-pending', function (done) {
			var expectedError = 'Cannot stop unknown or non-pending order';

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/stoporder');
				res.end(JSON.stringify({error : expectedError}));
			});

			bitx.stopOrder('BXMC2CJ7HNB88U4', function (err) {
				expect(err).to.have.property('message', expectedError);
				done();
			});
		});
	});

	lab.describe('getOrder', function () {

		lab.it('should return the order', function (done) {
			var expectedOrder = {
				"order_id"             : "BXHW6PFRRXKFSB4",
				"creation_timestamp"   : 1402866878367,
				"expiration_timestamp" : 0,
				"type"                 : "ASK",
				"state"                : "PENDING",
				"limit_price"          : "6500.00",
				"limit_volume"         : "0.05",
				"base"                 : "0.03",
				"counter"              : "195.02",
				"fee_base"             : "0.000",
				"fee_counter"          : "0.00",
				"trades"               : [
					{
						"price"     : "6501.00",
						"timestamp" : 1402866878467,
						"volume"    : "0.02"
					},
					{
						"price"     : "6500.00",
						"timestamp" : 1402866878567,
						"volume"    : "0.01"
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/orders/BXHW6PFRRXKFSB4');
				res.end(JSON.stringify(expectedOrder));
			});

			bitx.getOrder('BXHW6PFRRXKFSB4', function (err, order) {
				expect(order).to.eql(expectedOrder);
				done(err);
			});
		});
	});

	lab.describe('getBalance', function () {

		lab.it('should return all balances when no asset parameter is provided', function (done) {
			var expectedBalances = {
				balance : [
					{
						account_id  : '1224342323',
						asset       : 'XBT',
						balance     : '1.012423',
						reserved    : '0.01',
						unconfirmed : '0.421'
					}, {
						account_id  : '2997473',
						asset       : 'ZAR',
						balance     : '1000.00',
						reserved    : '0.00',
						unconfirmed : '0.00'
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/balance');
				res.end(JSON.stringify(expectedBalances));
			});

			bitx.getBalance(function (err, balances) {
				expect(balances).to.eql(expectedBalances);
				done(err);
			});
		});

		lab.it('should return the balance for the specified asset', function (done) {
			var expectedBalances = {
				balance : [{
					asset    : 'ZAR',
					balance  : '1000.00',
					reserved : '800.00'
				}]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/balance?asset=ZAR');
				res.end(JSON.stringify(expectedBalances));
			});

			bitx.getBalance('ZAR', function (err, balances) {
				expect(balances).to.eql(expectedBalances);
				done(err);
			});
		});
	});

	lab.describe('getFundingAddress', function () {

		lab.it('should return the funding address', function (done) {
			var expectedFundingAddress = {
				asset             : 'XBT',
				address           : 'B1tC0InExAMPL3fundIN6AdDreS5t0Use',
				total_received    : '1.234567',
				total_unconfirmed : '0.00'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/funding_address?asset=XBT');
				res.end(JSON.stringify(expectedFundingAddress));
			});

			bitx.getFundingAddress('XBT', function (err, fundingAddress) {
				expect(fundingAddress).to.eql(expectedFundingAddress);
				done(err);
			});
		});

		lab.it('should return the funding address specified', function (done) {
			var expectedFundingAddress = {
				asset             : 'XBT',
				address           : 'B1tC0InExAMPL3fundIN6AdDreS5t0Use',
				total_received    : '1.234567',
				total_unconfirmed : '0.00'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/funding_address?asset=XBT&address=B1tC0InExAMPL3fundIN6AdDreS5t0Use');
				res.end(JSON.stringify(expectedFundingAddress));
			});

			var options = {
				address : 'B1tC0InExAMPL3fundIN6AdDreS5t0Use'
			};
			bitx.getFundingAddress('XBT', options, function (err, fundingAddress) {
				expect(fundingAddress).to.eql(expectedFundingAddress);
				done(err);
			});
		});
	});

	lab.describe('createFundingAddress', function () {

		lab.it('should return a new funding address', function (done) {
			var expectedFundingAddress = {
				asset             : 'XBT',
				address           : 'B1tC0InExAMPL3fundIN6AdDreS5t0Use',
				total_received    : '0.00',
				total_unconfirmed : '0.00'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/funding_address');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('asset', 'XBT');
					res.end(JSON.stringify(expectedFundingAddress));
				});
			});

			bitx.createFundingAddress('XBT', function (err, fundingAddress) {
				expect(fundingAddress).to.eql(expectedFundingAddress);
				done(err);
			});
		});
	});

	lab.describe('getTransactions', function () {

		lab.it('should return the transactions', function (done) {
			var expectedTransactions = {
				total_count  : 77,
				transactions : [
					{
						description : 'test send to email address',
						timestamp   : 1397548704000,
						txid        : '',
						amount      : '-0.01',
						address     : 'test349873498@example.com',
						type        : 'SEND',
						pending     : false
					},
					{
						description : 'R 5.44498',
						timestamp   : 1398596345020,
						txid        : '',
						amount      : '0.00099',
						address     : '',
						type        : 'BUY',
						pending     : false
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/transactions?asset=XBT&offset=0&limit=10');
				res.end(JSON.stringify(expectedTransactions));
			});

			bitx.getTransactions('XBT', function (err, transactions) {
				expect(transactions).to.eql(expectedTransactions);
				done(err);
			});
		});

		lab.it('should send options and return the transactions', function (done) {
			var expectedTransactions = {
				total_count  : 77,
				transactions : [
					{
						description : 'test send to email address',
						timestamp   : 1397548704000,
						txid        : '',
						amount      : '-0.01',
						address     : 'test349873498@example.com',
						type        : 'SEND',
						pending     : false
					},
					{
						description : 'R 5.44498',
						timestamp   : 1398596345020,
						txid        : '',
						amount      : '0.00099',
						address     : '',
						type        : 'BUY',
						pending     : false
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/transactions?asset=XBT&offset=5&limit=5');
				res.end(JSON.stringify(expectedTransactions));
			});

			var options = {
				offset : 5,
				limit  : 5
			};
			bitx.getTransactions('XBT', options, function (err, transactions) {
				expect(transactions).to.eql(expectedTransactions);
				done(err);
			});
		});
	});

	lab.describe('getWithdrawals', function () {

		lab.it('should return the withdrawals', function (done) {
			var expectedWithdrawls = {
				withdrawals : [
					{
						status : 'PENDING',
						id     : '2221'
					},
					{
						status : 'COMPLETED',
						id     : '1121'
					}
				]
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/withdrawals/');
				res.end(JSON.stringify(expectedWithdrawls));
			});

			bitx.getWithdrawals(function (err, withdrawals) {
				expect(withdrawals).to.eql(expectedWithdrawls);
				done(err);
			});
		});
	});

	lab.describe('getWithdrawal', function () {

		lab.it('should return the withdrawal', function (done) {
			var expectedWithdrawal = {
				status : 'COMPLETED',
				id     : '1212'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'GET');
				expect(req).to.have.property('url', '/api/1/withdrawals/1212');
				res.end(JSON.stringify(expectedWithdrawal));
			});

			bitx.getWithdrawal('1212', function (err, withdrawal) {
				expect(withdrawal).to.eql(expectedWithdrawal);
				done(err);
			});
		});
	});

	lab.describe('requestWithdrawal', function () {

		lab.it('should post the correct fields and return a new withdrawal', function (done) {
			var expectedWithdrawal = {
				status : 'PENDING',
				id     : '1212'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'POST');
				expect(req).to.have.property('url', '/api/1/withdrawals/');
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {
					body = querystring.parse(body);
					expect(body).to.have.property('type', 'ZAR_EFT');
					expect(body).to.have.property('amount', '1000');
					res.end(JSON.stringify(expectedWithdrawal));
				});
			});

			bitx.requestWithdrawal('ZAR_EFT', 1000, function (err, withdrawal) {
				expect(withdrawal).to.eql(expectedWithdrawal);
				done(err);
			});
		});
	});

	lab.describe('cancelWithdrawal', function () {

		lab.it('should delete the specified withdrawal', function (done) {
			var expectedWithdrawal = {
				status : 'CANCELLED',
				id     : '1212'
			};

			server.on('request', function (req, res) {
				expect(req).to.have.property('method', 'DELETE');
				expect(req).to.have.property('url', '/api/1/withdrawals/1212');
				res.end(JSON.stringify(expectedWithdrawal));
			});

			bitx.cancelWithdrawal('1212', function (err, withdrawal) {
				expect(withdrawal).to.eql(expectedWithdrawal);
				done(err);
			});
		});
	});
});
