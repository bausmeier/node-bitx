### 1.9.0 (2021-12-06)

* Add methods getOrderListV2, getOrderV2, getOrderV3

### 1.8.0 (2020-10-13)

* Add promise support for all methods. When `callback` parameter is not provided, the methods return a promise

### 1.7.1

* Parse Luno API errors
* Update domain to `api.luno.com`

### 1.7.0

* Add getTradeList method

### 1.6.0

* Add options to postBuyOrder, postMarketBuyOrder, postSellOrder and postMarketSellOrder
* Add getFeeInfo method

### 1.5.1

* Fix an issue with GET requests sent after POST requests

### 1.5.0

* Add getOrder method

### 1.4.2

* Make asset parameter optional for getBalance

### 1.4.1

* Only catch JSON.parse errors (#6)

### 1.4.0

* Add pair option to getTicker, getOrderBook and getTrades
* Add getAllTickers method

### 1.3.0

* Add createFundingAddress method
* Add getTransactions method
* Accept address option for getFundingAddress
* Accept state option for getOrderList
* Add getWithdrawals method
* Add getWithdrawal method
* Add requestWithdrawal method
* Add cancelWithdrawal method

### 1.2.1

* Fix path bug (#1)

### 1.2.0

* Add getFundingAddress method

### 1.1.0

* Support multiple currency pairs
* BitX.getLimits is now deprecated (use BitX.getBalance instead).
* Updated to the latest BitX API.
* Added BitX.getBalance method.

### 1.0.1

* Set response encoding to utf8
* Resolve require path properly
