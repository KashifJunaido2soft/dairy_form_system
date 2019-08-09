/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const bcrypt = require('bcryptjs');
var Q = require('q');
var _ = require('lodash');


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


router.post('/login', function (req, res) {
  var deferred = Q.defer();
  let querie = "SELECT * FROM admin where phone =" + req.body.phone + "";
  connection.query(querie, function (error, user) {
    if (error) throw error;
    if (user.length > 0) {
      if (user[0].active === 'true') {
        if (bcrypt.compareSync(req.body.password, user[0].password)) {
          let querie2 = "SELECT * FROM admin_config where parent_id =" + user[0].id + "";
          connection.query(querie2, function (error, configRes) {
            var resp = ({
              error: false,
              message: 'Login Successfully',
              result: {
                admin: user[0],
                conifg: configRes[0]
              }
            });
            res.json(resp);
          })
        } else {
          var resp = ({
            error: true,
            message: 'wrong password',
          });
          res.json(resp);
        }
      } else {
        var resp = ({
          error: true,
          message: 'You`re not Active',
        });
        res.json(resp);
      }
    } else {
      var resp = ({
        error: true,
        message: 'Phone number not found',
      });
      res.json(resp);
    }
  })
});

module.exports = router;
