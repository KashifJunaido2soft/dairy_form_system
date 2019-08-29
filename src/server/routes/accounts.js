
const express = require('express');
const connection = require('../database/connection');
const router = express.Router();
var multer = require('multer');
const fs = require('fs');
const Helper = require('../helper/helper');


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



/////////////// routes ////////////////

// new/edit accounts entry
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
          let querie = "UPDATE account set name='" + req.body.name + "',avatar='" + img + "',phone='" + req.body.phone + "',address='" + req.body.address + "',active='" + req.body.active + "', updated_at='" + Helper.yyyymmdd() + "'    where id = " + req.body.id + "";
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

        let querie = "UPDATE account set name='" + req.body.name + "',avatar='" + img + "',phone='" + req.body.phone + "',address='" + req.body.address + "',active='" + req.body.active + "', updated_at='" + Helper.yyyymmdd() + "'    where id = " + req.body.id + "";
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
        let insertData = 'INSERT INTO account (parent_id, name, avatar, phone, address, active, created_at) VALUES (' + req.body.parent_id + ', "' + req.body.name + '", "' + img + '",  ' + req.body.phone + ', "' + req.body.address + '",  "' + req.body.active + '",  "' + Helper.yyyymmdd() + '")';
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

// get all accounts for listing
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

// active/inactive accounts
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

// delete on row
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

// delete multiple rows
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

// get all active account for new purchase form
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




//////////////////// Mobile apis /////////////////


router.post('/NewAccountApi', upload.single('avatar'), function (req, res) {

  if (req.body.avatar == undefined || req.body.avatar == "") {
    var img = "";
  }
  if (req.file) {
    img = req.file.filename;
  }
  console.log(req.file)
  console.log(img)
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
      let insertData = 'INSERT INTO account (parent_id, name, avatar, phone, address, active, created_at) VALUES (' + req.body.userId + ', "' + req.body.name + '", "' + img + '",  ' + req.body.phone + ', "' + req.body.address + '",  "' + req.body.active + '",  "' + Helper.yyyymmdd() + '")';
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
});



// For mongoose
// router.post('/updateUserDataActive', function (req, res) {

//   var is_active = false;
//   if (req.body.active === true) {
//     is_active = false;
//   } else {
//     is_active = true;
//   }
//   Account.updateOne({ _id: req.body._id }, { active: is_active }, function (err, updateResponse) {
//     if (updateResponse) {
//       var resp = ({
//         error: false,
//         message: 'success'
//       });

//       res.json(resp);
//     }

//   })
// })

// router.post('/deleteManyUser', function (req, res) {

//   const ids = req.body;
//   Account.deleteMany({ _id: { $in: ids } }, function (err, accountResp) {
//     if (accountResp) {
//       var resp = ({
//         error: false,
//         message: 'success.',
//       });
//       res.json(resp);
//     } else {
//       var resp = ({
//         error: true,
//         message: 'not deleted.',
//       });
//       res.json(resp);
//     }
//   });

// })

// router.post('/deleteOneUser', function (req, res) {

//   Account.deleteOne({ _id: req.body._id }, function (err, accountResp) {
//     if (accountResp) {
//       var resp = ({
//         error: false,
//         message: 'success.',
//       });
//       res.json(resp);
//     } else {
//       var resp = ({
//         error: true,
//         message: 'not deleted.',
//       });
//       res.json(resp);
//     }
//   });
// })

// router.get('/allAccounts/:userId/:parent_id', function (req, res) {
//   var query = {};
//   if (req.params.parent_id !== '0') {
//     query = { parent_id: req.params.userId };
//   }
//   // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//   Account.find(query, null, { sort: { _id: -1 } }, function (err, users) {
//     if (users) {
//       // email already exist
//       var resp = ({
//         error: false,
//         message: 'success.',
//         result: users
//       });
//       res.json(resp);
//     } else {
//       var resp = ({
//         error: false,
//         message: 'not found.'
//       });
//       res.json(resp);
//     }
//   })
// })
// router.get('/allActiveAccounts/:userId/:parent_id', function (req, res) {
//   var query = { active: true };
//   if (req.params.parent_id !== '0') {
//     query = { parent_id: req.params.userId, active: true };
//   }
//   // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//   Account.find(query, null, { sort: { _id: -1 } }, function (err, users) {
//     if (users) {
//       // email already exist
//       var resp = ({
//         error: false,
//         message: 'success.',
//         result: users
//       });
//       res.json(resp);
//     } else {
//       var resp = ({
//         error: false,
//         message: 'not found.'
//       });
//       res.json(resp);
//     }
//   })
// })

// router.post('/updateAccount', function (req, res) {

//   var newAccount = new Account();
//   // update Account
//   if (req.body._id !== "") {
//     Account.findOne({ phone: req.body.phone }, function (err, adminResponsePhone) {
//       if (err) deferred.reject(err.name + ': ' + err.message);
//       if (adminResponsePhone) {
//         if (adminResponsePhone._id == req.body._id) {
//           var where = { _id: req.body._id };
//           var query = { $set: { name: req.body.name, avatar: req.body.avatar, phone: req.body.phone, address: req.body.address, active: req.body.active, } }
//           Account.updateOne(where, query, function (err, updateResponse) {
//             var resp = ({
//               error: false,
//               message: 'success',
//               result: updateResponse
//             });

//             res.json(resp);
//           })
//         } else {
//           var resp = ({
//             error: true,
//             message: 'Phone Already Exist.'
//           });

//           res.json(resp);
//         }
//       } else {
//         var where = { _id: req.body._id };
//         var query = { $set: { name: req.body.name, avatar: req.body.avatar, phone: req.body.phone, address: req.body.address, active: req.body.active, } }
//         Account.updateOne(where, query, function (err, updateResponse) {
//           var resp = ({
//             error: false,
//             message: 'success',
//             result: updateResponse
//           });

//           res.json(resp);
//         })
//       }
//     })

//   } else { // insert Account
//     //check email exist
//     Account.findOne({ phone: req.body.phone }, function (err, phoneExist) {
//       if (err) deferred.reject(err.name + ': ' + err.message);
//       if (phoneExist) {
//         // email already exist
//         var resp = ({
//           error: true,
//           message: 'Phone Already Exist.'
//         });

//         res.json(resp);
//       } else {
//         newAccount.parent_id = req.body.parent_id;
//         newAccount.name = req.body.name;
//         newAccount.avatar = req.body.avatar;
//         newAccount.phone = req.body.phone;
//         newAccount.address = req.body.address;
//         newAccount.active = req.body.active;
//         newAccount.created_at = dateTime;
//         newAccount.save(function (err, insertedRes) {
//           if (insertedRes) {
//             var resp = ({
//               error: false,
//               message: 'success',
//               result: insertedRes
//             });
//             res.json(resp);
//           } else {
//             var resp = ({
//               error: true,
//               message: 'Insert Error.'
//             });
//             res.json(resp);
//           }
//         })
//       }
//     });
//   }
//   //-------------------------------------------
// });

module.exports = router;
