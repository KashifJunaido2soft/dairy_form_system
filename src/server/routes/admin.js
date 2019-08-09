/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
// const Admin = require('../models/admin');
// const AdminConfig = require('../models/admin_config');
const bcrypt = require('bcryptjs');
var Q = require('q');
var _ = require('lodash');

function yyyymmdd() {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
}


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

// for mysql
router.post('/register', function (req, res) {
  let querie = "SELECT * FROM admin where phone =" + req.body.phone + "";
  connection.query(querie, function (error, user) {
    if (error) throw error;
    if (user.length > 0) {
      // Phone already exist
      var resp = ({
        error: true,
        message: 'Phone Already Exist.'
      });
      res.json(resp);
    } else {

      let insertAdminData = 'INSERT INTO admin (parent_id, name, avatar, price, phone, notes, address, password, active, location, starred, created_at) VALUES (' + req.body.parent_id + ', "' + req.body.name + '", "", "", ' + req.body.phone + ', "", "", "' + bcrypt.hashSync(req.body.password, 10) + '", "true", "admin", "true", "' + yyyymmdd() + '")';
      connection.query(insertAdminData, function (error, adminRes) {

        if (adminRes.insertId > 0) {

          let insertAdminConfigData = 'INSERT INTO admin_config (parent_id, lang, price) VALUES (' + adminRes.insertId + ', "en", 0)';
          connection.query(insertAdminConfigData, function (error, configRes) {
            if (configRes.insertId > 0) {
              var resp = ({
                error: false,
                message: 'success.'
              });
              res.json(resp);
            }
          })
        }

      });
    }

  });
});


module.exports = router;
