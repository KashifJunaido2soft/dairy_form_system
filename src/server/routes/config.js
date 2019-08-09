/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();

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
    console.error('error connecting: ' + err.stack);
    return;
  }
});

// For mysql

router.get('/updateLang/:langId/:configId', function (req, res) {

  let querie = "UPDATE admin_config set lang='" + req.params.langId + "' where id = " + req.params.configId + "";
  connection.query(querie, function (error, upres) {

    if (upres.affectedRows > 0) {
      let querie2 = "SELECT * FROM admin_config  where id = " + req.params.configId + "";
      connection.query(querie2, function (error, selectResp) {
        if (selectResp.length > 0) {
          var resp = ({
            error: false,
            message: 'success',
            result: selectResp[0]
          });
          res.json(resp);
        }
      })
    }
  })
});

module.exports = router;
