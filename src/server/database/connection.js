const mysql = require('mysql');
// for mysql
var connection = mysql.createConnection({
    host: 'admin-db-useast2.cixqrrj9mlyk.us-east-2.rds.amazonaws.com',
    port : '3306',
    user: 'admin',
    password: 'o2soft1234',
    database: 'dairy_milk_system'
  });

connection.connect(function (err) {
    if (err) {
         //console.error('error connecting: ' + err.stack);
        return;
    }
});
module.exports = connection;