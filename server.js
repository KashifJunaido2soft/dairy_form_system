const authApi = require('./src/server/routes/auth');
const adminApi = require('./src/server/routes/admin');
const userApi = require('./src/server/routes/users');
const accountsApi = require('./src/server/routes/accounts');
const purchaseApi = require('./src/server/routes/purchase');
const configApi = require('./src/server/routes/config');
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
      // console.log(msg);
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
app.use('/api/auth', authApi);
app.use('/api/admin', adminApi);
app.use('/api/config', configApi);
app.use('/api/users', userApi);
app.use('/api/accounts', accountsApi);
app.use('/api/purchase', purchaseApi);
app.listen(port, function () {
  console.log("server running on localhost: " + port);
});
