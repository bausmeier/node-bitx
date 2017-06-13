'use strict'

var BitX = require('..')
var https = require('https')
var fs = require('fs')
var path = require('path')
var tap = require('tap')

tap.test('GET after POST', function (t) {
  var options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server', 'test.crt'))
  }
  var server = https.createServer(options).listen(process.env.PORT || 0, 'localhost', function () {
    var address = server.address()
    var bitx = new BitX('keyId', 'keySecret', {
      hostname: 'localhost',
      port: address.port,
      ca: fs.readFileSync(path.join(__dirname, 'ssl', 'ca', 'root.pem'))
    })

    t.afterEach(function (done) {
      server.removeAllListeners('request')
      done()
    })

    t.tearDown(function (done) {
      server.close(done)
    })

    t.test('should not send content type or content length headers', function (t) {
      server.once('request', function (req, res) {
        req.resume()
        req.on('end', function () {
          res.end(JSON.stringify({}))
        })
      })

      bitx.postBuyOrder(9999.99, 0.0001, function (err, order) {
        t.ifErr(err)

        server.once('request', function (req, res) {
          t.notOk(req.headers['content-type'])
          t.notOk(req.headers['content-length'])
          res.end(JSON.stringify({}))
        })

        bitx.getTicker(function (err, ticker) {
          t.ifErr(err)
          t.end()
        })
      })
    })

    t.end()
  })
})
