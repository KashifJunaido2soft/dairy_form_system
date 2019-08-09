/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
// const mongoose = require('mongoose');
const mysql = require('mysql');
const router = express.Router();
var multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
var Q = require('q');
var _ = require('lodash');
// const tcp = require('../socket/tcp');
// var jwt = require('jsonwebtoken');
var net = require('net');

// console.log(`${mongoose.version}`);
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, 'src/assets/images/accounts');
    cb(null, 'uploads/admin/');
  },
  filename: function (req, file, cb) {
    var typ = file.mimetype.split("/");
    var imgType = typ[1];
    cb(null, file.fieldname + '-' + Date.now() + '.' + imgType);
  }
})

var upload = multer({ storage: storage });

const dateTime = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Karachi'
});

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

// for mysql

router.post('/updateUser', upload.single('avatar'), function (req, res) {
  // update user
  if (req.body.id !== "") {
    var img = req.body.avatar;

    if (req.file) {
      img = req.file.filename;
    }
    let querie = "SELECT * FROM admin where phone = " + req.body.phone + " ";
    connection.query(querie, function (error, user) {

      if (user.length > 0) {
        if (user[0].id == req.body.id) {
          if (req.file) {
            if (req.body.file != "") {
              // Check File Exit
              fs.stat('uploads/admin/' + req.body.file, function (err, stats) {
                //here we got all information of file in stats variable
                if (stats) {
                  // If  File Exit then Remove File
                  fs.unlink('uploads/admin/' + req.body.file, (err) => {
                    if (err) throw err;
                    // console.log('successfully deleted /tmp/hello');
                  });
                }

                if (err) {
                  //  console.log(err);
                }


              });
            }
          }
          let querie = "UPDATE admin set name='" + req.body.name + "',price='" + req.body.price + "',avatar='" + img + "', location='" + req.body.location + "',phone='" + req.body.phone + "', notes='" + req.body.notes + "',address='" + req.body.address + "',active='" + req.body.active + "'    where id = " + req.body.id + "";
          connection.query(querie, function (error, upres) {
            if (upres.affectedRows > 0) {
              var resp = ({
                error: false,
                message: 'success'
              });
              res.json(resp);
            }

          })
        } else {
          var resp = ({
            error: true,
            message: 'Phone Already Exist.'
          });
          res.json(resp);
        }
      } else {
        if (req.file) {
          if (req.body.file != "") {
            // Check File Exit
            fs.stat('uploads/admin/' + req.body.file, function (err, stats) {
              //here we got all information of file in stats variable
              if (stats) {
                // If  File Exit then Remove File
                fs.unlink('uploads/admin/' + req.body.file, (err) => {
                  if (err) throw err;
                  // console.log('successfully deleted /tmp/hello');
                });
              }

              if (err) {
                //  console.log(err);
              }


            });
          }
        }
        let querie = "UPDATE admin set name='" + req.body.name + "',avatar='" + img + "', location='" + req.body.location + "',phone='" + req.body.phone + "', notes='" + req.body.notes + "',address='" + req.body.address + "',active='" + req.body.active + "'    where id = " + req.body.id + "";
        connection.query(querie, function (error, upres) {
          if (upres.affectedRows > 0) {
            var resp = ({
              error: false,
              message: 'success'
            });
            res.json(resp);
          }

        })
      }
    })
  } else { // insert user

    let querie = "SELECT * FROM admin where phone =" + req.body.phone + " ";
    connection.query(querie, function (error, user) {

      if (user.length > 0) {

        var resp = ({
          error: true,
          message: 'Phone Already Exist.'
        });
        res.json(resp);

      } else {

        let insertAdminData = 'INSERT INTO admin (parent_id, name, avatar, price, phone, notes, address, password, active, location, starred, created_at) VALUES (' + req.body.parent_id + ', "' + req.body.name + '", "", ' + req.body.price + ', ' + req.body.phone + ', "' + req.body.notes + '", "' + req.body.address + '", "' + bcrypt.hashSync(req.body.password, 10) + '", "' + req.body.active + '", "' + req.body.location + '", "' + req.body.starred + '", "' + yyyymmdd() + '")';
        connection.query(insertAdminData, function (error, adminRes) {
          if (adminRes.insertId > 0) {
            let insertAdminConfigData = 'INSERT INTO admin_config (parent_id, lang) VALUES (' + adminRes.insertId + ', "en")';
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
    })

  }
});

router.get('/allUsers/:userId', function (req, res) {
  let querie = "SELECT * FROM admin where parent_id = " + req.params.userId + " Order By id DESC";
  connection.query(querie, function (error, users) {
    if (users.length > 0) {
      var resp = ({
        error: false,
        message: 'success.',
        result: users
      });
      res.json(resp);
    } else {
      var resp = ({
        error: false,
        message: 'not found.',
        result: []
      });
      res.json(resp);
    }
  })
})


router.post('/updateUserDataStarred', function (req, res) {
  var is_starred = false;
  if (req.body.starred === 'true') {
    is_starred = false;
  } else {
    is_starred = true;
  }
  let querie = "UPDATE admin set starred='" + is_starred + "' where id = " + req.body.id + "";
  connection.query(querie, function (error, upres) {
    if (upres.affectedRows > 0) {
      var resp = ({
        error: false,
        message: 'success'
      });
      res.json(resp);
    } else {
      var resp = ({
        error: true,
        message: 'fail'
      });
      res.json(resp);
    }

  })
});

router.post('/updateUserDataActive', function (req, res) {

  var is_active = false;
  if (req.body.active === 'true') {
    is_active = false;
  } else {
    is_active = true;
  }
  let querie = "UPDATE admin set active='" + is_active + "' where id = " + req.body.id + "";
  connection.query(querie, function (error, upres) {
    if (upres.affectedRows > 0) {
      var resp = ({
        error: false,
        message: 'success'
      });
      res.json(resp);
    }

  })
})

router.post('/deleteOneUser', function (req, res) {

  if (req.body.avatar != "") {
    // Check File Exit
    fs.stat('uploads/admin/' + req.body.avatar, function (err, stats) {
      //here we got all information of file in stats variable
      if (stats) {
        // If  File Exit then Remove File
        fs.unlink('uploads/admin/' + req.body.avatar, (err) => {
          if (err) throw err;
          // console.log('successfully deleted /tmp/hello');
        });
      }

      if (err) {
        //  console.log(err);
      }

    });
  }
  let querie = "DELETE FROM admin  where id = " + req.body.id + "";
  connection.query(querie, function (error, upres) {
    if (upres.affectedRows > 0) {
      var resp = ({
        error: false,
        message: 'success'
      });
      res.json(resp);
    } else {
      var resp = ({
        error: true,
        message: 'not deleted'
      });
      res.json(resp);
    }

  })
})

router.post('/deleteManyUser', function (req, res) {
  const ids = req.body;
  let querie = "DELETE FROM admin  where id IN (" + ids + ")";
  connection.query(querie, function (error, upres) {
    if (upres.affectedRows > 0) {
      var resp = ({
        error: false,
        message: 'success'
      });
      res.json(resp);
    } else {
      var resp = ({
        error: true,
        message: 'not deleted'
      });
      res.json(resp);
    }
  })
})

router.post('/updateUserPassword', function (req, res) {

  let querie = "UPDATE admin set password='" + bcrypt.hashSync(req.body.password, 10) + "' where id = " + req.body.id + "";
  connection.query(querie, function (error, upres) {
    if (upres.affectedRows > 0) {
      var resp = ({
        error: false,
        message: 'success'
      });
      res.json(resp);
    }

  })
})

router.post('/updatePrice', function (req, res) {

  let querie = "UPDATE admin_config set price='" + req.body.price + "' where parent_id = " + req.body.id + "";
  connection.query(querie, function (error, upres) {
    if (upres.affectedRows > 0) {
      let querie2 = "SELECT * FROM admin_config  where parent_id = " + req.body.id + "";
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
