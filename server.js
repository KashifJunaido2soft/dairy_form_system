const authApi = require('./src/server/routes/auth');
const adminApi = require('./src/server/routes/admin');
const userApi = require('./src/server/routes/users');
const accountsApi = require('./src/server/routes/accounts');
const saleApi = require('./src/server/routes/sale');
const purchaseApi = require('./src/server/routes/purchase');
const configApi = require('./src/server/routes/config');
const dashboardApi = require('./src/server/routes/dashboard');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var WebSocketServer = require('ws').Server;

const port = 3000;
const app = express();

// Web Socket
var wss = new WebSocketServer({ port: 1337 });

wss.on('connection', function (w, req) {

  w.on('message', function (msg) {
    // console.log(msg);
    wss.broadcast(msg, w);
  });

  // function sendData(msgData) {
  //   // var object = '03076497552: this is a test message, 03339689715: this is a test message';
  //   w.send((msgData));
  // }

  w.on('close', function () {
    console.log('closing connection');
  });

  wss.broadcast = function broadcast(msg, sender) {

    wss.clients.forEach(function each(client) {
      // console.log(client);
      // var data = JSON.parse(msg);
      var data = '"' + msg + '"';
      // console.log(data);
      // if (client !== sender) {
      client.send(data);
      // }
    });
  };
});

app.use(express.static(path.join(__dirname, '/')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();

});
app.use('/api/auth', authApi);
app.use('/api/dashboard', dashboardApi);
app.use('/api/admin', adminApi);
app.use('/api/config', configApi);
app.use('/api/users', userApi);
app.use('/api/accounts', accountsApi);
app.use('/api/purchase', purchaseApi);
app.use('/api/sale', saleApi);
app.listen(port, function () {
  console.log("server running on localhost: " + port);
});
