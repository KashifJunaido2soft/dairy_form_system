/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
// const mongoose = require('mongoose');
const router = express.Router();
const connection = require('../database/connection');
// const User = require('../models/admin');
// const adminConfig = require('../models/admin_config');
const bcrypt = require('bcryptjs');
var Q = require('q');
var _ = require('lodash');
// var jwt = require('jsonwebtoken');
// var multer = require('multer');


/////////////// routes ////////////////

// login 

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

// for monogo db
// const db = "mongodb://localhost:27017/admin_panel";
// mongoose.promise = global.promise;
// mongoose.connect(db, { useNewUrlParser: true }, function (err) {
//   if (err) {
//     console.error("Error: !" + err);
//   }
// });



// for mongoose
//  router.post('/register',upload.single('profile'), function(req,res)
// router.post('/login', function (req, res) {

//   var deferred = Q.defer();

//   User.findOne({ phone: req.body.phone }, function (err, user) {

//     if (err) deferred.reject(err.name + ': ' + err.message);

//     if (user && bcrypt.compareSync(req.body.password, user.password)) {
//       // authentication successful
//       if (user.active) {
//         adminConfig.findOne({ parent_id: user._id }, function (err, userConfig) {
//           var resp = ({
//             error: false,
//             message: 'Login Successfully',
//             result: {
//               admin: user,
//               conifg: userConfig
//             }
//           });
//           res.json(resp);
//         })
//       } else {
//         var resp = ({
//           error: true,
//           message: 'You`re not Active',
//         });
//         res.json(resp);
//       }

//     } else {
//       // authentication failed
//       var resp = ({
//         error: true,
//         message: 'Phone or Password mismatch',
//       });
//       res.json(resp);
//     }
//   });
// });
module.exports = router;
