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
// var jwt = require('jsonwebtoken');

// console.log(`${mongoose.version}`);

// const dateTime = new Date().toLocaleString('en-US', {
//   timeZone: 'Asia/Karachi'
// });
function yyyymmdd() {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
}


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dairy_milk_system'
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

// for mongoose
// router.post('/registerNode', function (req, res) {
//   var newAdmin = new Admin();
//   var adminConfig = new AdminConfig();
//   //-----------------------------------------------------
//   Admin.findOne({ phone: req.body.phone }, function (err, user) {
//     if (err) deferred.reject(err.name + ': ' + err.message);

//     if (user) {
//       // email already exist
//       var resp = ({
//         error: true,
//         message: 'Phone Already Exist.'
//       });
//       res.json(resp);
//     } else {
//       newAdmin.parent_id = req.body.parent_id;
//       newAdmin.name = req.body.name;
//       newAdmin.phone = req.body.phone;
//       newAdmin.password = bcrypt.hashSync(req.body.password, 10);
//       newAdmin.active = true;
//       newAdmin.location = 'admin';
//       newAdmin.avatar = 'assets/images/avatars/profile.jpg';
//       newAdmin.price = '';
//       newAdmin.created_at = dateTime;
//       newAdmin.save(function (err, insertedUser) {
//         if (insertedUser) {
//           adminConfig.parent_id = insertedUser._id;
//           adminConfig.lang = 'en';
//           adminConfig.price = '0';
//           adminConfig.save(function (err, adminConfigResponse) {
//             var resp = ({
//               error: false,
//               message: 'success',
//               result: {
//                 admin: insertedUser,
//                 conifg: adminConfigResponse
//               }
//             });
//             res.json(resp);
//           })
//         } else {
//           var resp = ({
//             error: true,
//             message: 'Insert Error.'
//           });
//           res.json(resp);
//         }
//       })
//     }
//   });
//   //-------------------------------------------
// });

module.exports = router;
