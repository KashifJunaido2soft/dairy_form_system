
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
var multer = require('multer');
const fs = require('fs');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, 'src/assets/images/accounts');
    cb(null, 'uploads/accounts/');
  },
  filename: function (req, file, cb) {
    var typ = file.mimetype.split("/");
    var imgType = typ[1];
    cb(null, file.fieldname + '-' + Date.now() + '.' + imgType);
  }
})

var upload = multer({ storage: storage });

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
router.post('/updateAccount', upload.single('avatar'), function (req, res) {

  var img = req.body.avatar;

  if (req.file) {
    img = req.file.filename;
  }
  // update Account
  if (req.body.id !== "") {
    let querie = "SELECT * FROM account where phone =" + req.body.phone + " ";
    connection.query(querie, function (error, user) {
      if (user.length > 0) {
        if (user[0].id == req.body.id) {

          if (req.file) {
            if (req.body.file != "") {
              // Check File Exit
              fs.stat('uploads/accounts/' + req.body.file, function (err, stats) {
                //here we got all information of file in stats variable
                if (stats) {
                  // If  File Exit then Remove File
                  fs.unlink('uploads/accounts/' + req.body.file, (err) => {
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
          let querie = "UPDATE account set name='" + req.body.name + "',avatar='" + img + "',phone='" + req.body.phone + "',address='" + req.body.address + "',active='" + req.body.active + "', updated_at='" + yyyymmdd() + "'    where id = " + req.body.id + "";
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
            fs.stat('uploads/accounts/' + req.body.file, function (err, stats) {
              //here we got all information of file in stats variable
              if (stats) {
                // If  File Exit then Remove File
                fs.unlink('uploads/accounts/' + req.body.file, (err) => {
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

        let querie = "UPDATE account set name='" + req.body.name + "',avatar='" + img + "',phone='" + req.body.phone + "',address='" + req.body.address + "',active='" + req.body.active + "', updated_at='" + yyyymmdd() + "'    where id = " + req.body.id + "";
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

  } else {

    //   // insert Account
    let querie = "SELECT * FROM account where phone =" + req.body.phone + " ";
    connection.query(querie, function (error, account) {

      if (account.length > 0) {

        var resp = ({
          error: true,
          message: 'Phone Already Exist.'
        });
        res.json(resp);

      } else {
        let insertData = 'INSERT INTO account (parent_id, name, avatar, phone, address, active, created_at) VALUES (' + req.body.parent_id + ', "' + req.body.name + '", "' + img + '",  ' + req.body.phone + ', "' + req.body.address + '",  "' + req.body.active + '",  "' + yyyymmdd() + '")';
        connection.query(insertData, function (error, accountRes) {
          if (accountRes.insertId > 0) {
            var resp = ({
              error: false,
              message: 'success.'
            });
            res.json(resp);
          } else {
            var resp = ({
              error: true,
              message: 'not inserted.'
            });
            res.json(resp);
          }
        });
      }
    })

  }
});


router.get('/allAccounts/:userId/:parent_id', function (req, res) {

  var where = "";
  if (req.params.parent_id !== '0') {
    where = "where parent_id = " + req.params.userId + "";
  }

  let querie = "SELECT * FROM account " + where + " Order By id DESC";
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

router.post('/updateUserDataActive', function (req, res) {
  var is_active = false;
  if (req.body.active === 'true') {
    is_active = false;
  } else {
    is_active = true;
  }
  let querie = "UPDATE account set active='" + is_active + "' where id = " + req.body.id + "";
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
  if (req.body.file != "") {
    // Check File Exit
    fs.stat('uploads/accounts/' + req.body.file, function (err, stats) {
      //here we got all information of file in stats variable
      if (stats) {
        // If  File Exit then Remove File
        fs.unlink('uploads/accounts/' + req.body.file, (err) => {
          if (err) throw err;
          // console.log('successfully deleted /tmp/hello');
        });
      }

      if (err) {
        //  console.log(err);
      }

    });
  }
  let querie = "DELETE FROM account  where id = " + req.body.id + "";
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
  var ids = [];
  req.body.forEach(element => {
    ids.push(element.id);
    if (element.file != "") {
      fs.stat('uploads/accounts/' + element.file, function (err, stats) {
        //here we got all information of file in stats variable
        if (stats) {
          // If  File Exit then Remove File
          fs.unlink('uploads/accounts/' + element.file, (err) => {
            if (err) throw err;
            // console.log('successfully deleted /tmp/hello');
          });
        }

        if (err) {
          //  console.log(err);
        }

      });
    }
  });
  let querie = "DELETE FROM account  where id IN (" + ids + ")";
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

router.get('/allActiveAccounts/:userId/:parent_id', function (req, res) {

  var where = "where active='true'";
  if (req.params.parent_id !== '0') {
    where = "where parent_id = " + req.params.userId + " and active='true'";
  }
  let querie = "SELECT * FROM account " + where + " Order By id DESC";
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

module.exports = router;
