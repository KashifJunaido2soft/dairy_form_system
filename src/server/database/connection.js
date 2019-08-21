const mysql = require('mysql');
// for mysql
var connection = mysql.createConnection({
    host: 'database-1.cpl9upjkzzdr.us-east-1.rds.amazonaws.com',
    port : '3306',
    user: 'admin',
    password: 'o2soft1234',
    database: 'dmsdb'
  });

connection.connect(function (err) {
    if (err) {
        // console.error('error connecting: ' + err.stack);
        return;
    }
});
module.exports = connection;