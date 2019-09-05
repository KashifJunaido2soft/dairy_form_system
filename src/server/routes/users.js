/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
// const mongoose = require('mongoose');
const router = express.Router();
var multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
var Q = require('q');
var _ = require('lodash');
// const tcp = require('../socket/tcp');
// var jwt = require('jsonwebtoken');
var net = require('net');
const connection = require('../database/connection');
const Helper = require('../helper/helper');

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


/////////////// routes ////////////////

// new/edit user entry
router.post('/updateUser', upload.single('avatar'), function (req, res) {

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
          let querie = "UPDATE admin set name='" + req.body.name + "',avatar='" + img + "', location='" + req.body.location + "',phone='" + req.body.phone + "', notes='" + req.body.notes + "',address='" + req.body.address + "',active='" + req.body.active + "'    where id = " + req.body.id + "";
          connection.query(querie, function (error, upres) {
            if (upres.affectedRows > 0) {
              var resp = ({
                error: false,
                message: 'success',
                data: {
                  'avatar': img,
                  'id': req.body.id,
                  'parent_id': req.body.parent_id,
                  'location': req.body.location,
                  'name': req.body.name,
                  'active': req.body.active,
                  'phone': req.body.phone,
                  'address': req.body.address,
                  'notes': req.body.notes
                }
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
        let querie = "UPDATE admin set name='" + req.body.name + "', avatar='" + img + "', location='" + req.body.location + "',phone='" + req.body.phone + "', notes='" + req.body.notes + "',address='" + req.body.address + "',active='" + req.body.active + "'    where id = " + req.body.id + "";
        connection.query(querie, function (error, upres) {
          if (upres.affectedRows > 0) {
            var resp = ({
              error: false,
              message: 'success',
              data: {
                'avatar': img,
                'id': req.body.id,
                'parent_id': req.body.parent_id,
                'location': req.body.location,
                'name': req.body.name,
                'active': req.body.active,
                'phone': req.body.phone,
                'address': req.body.address,
                'notes': req.body.notes
              }
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

        let insertAdminData = 'INSERT INTO admin (parent_id, name, avatar, phone, notes, address, password, active, location, starred, created_at) VALUES (' + req.body.parent_id + ', "' + req.body.name + '", "", ' + req.body.phone + ', "' + req.body.notes + '", "' + req.body.address + '", "' + bcrypt.hashSync(req.body.password, 10) + '", "' + req.body.active + '", "' + req.body.location + '", "' + req.body.starred + '", "' + Helper.yyyymmdd() + '")';
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

// get all users by login user id
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

// starred/unstarred user
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

// active/inactive user
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

// delete one row
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

// delete multiple rows
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

// update password from profile
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

// update price from profile
// router.post('/updatePrice', function (req, res) {
//   let querie = "UPDATE admin_config set  sale_price='" + req.body.salePrice + "' where parent_id = " + req.body.id + "";
//   connection.query(querie, function (error, upres) {
//     if (upres.affectedRows > 0) {
//       let querie2 = "SELECT * FROM admin_config  where parent_id = " + req.body.id + "";
//       connection.query(querie2, function (error, selectResp) {
//         if (selectResp.length > 0) {
//           var resp = ({
//             error: false,
//             message: 'success',
//             result: selectResp[0]
//           });
//           res.json(resp);
//         }
//       })
//     }

//   })
// });

// get all active users
router.get('/allActiveUsers/:userId', function (req, res) {
  var where = "where parent_id = " + req.params.userId + " and active='true'";
  let querie = "SELECT * FROM admin " + where + " Order By id DESC";
  // console.log(querie);
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




// for mongoose
// router.post('/updateUserDataStarred', function (req, res) {

//   var is_starred = false;
//   if (req.body.starred === true) {
//     is_starred = false;
//   } else {
//     is_starred = true;
//   }
//   Admin.updateOne({ _id: req.body._id }, { starred: is_starred }, function (err, updateResponse) {
//     if (updateResponse) {
//       var resp = ({
//         error: false,
//         message: 'success'
//       });

//       res.json(resp);
//     }

//   })
// });
// router.post('/updateUserDataActive', function (req, res) {

//   var is_active = false;
//   if (req.body.active === true) {
//     is_active = false;
//   } else {
//     is_active = true;
//   }
//   Admin.updateOne({ _id: req.body._id }, { active: is_active }, function (err, updateResponse) {
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

//   AdminConfig.deleteMany({ parent_id: { $in: ids } }, function (err, adminConfig) {

//     if (adminConfig) {
//       Admin.deleteMany({ _id: { $in: ids } }, function (err, Admin) {
//         if (Admin) {
//           var resp = ({
//             error: false,
//             message: 'success.',
//           });
//           res.json(resp);
//         } else {
//           var resp = ({
//             error: true,
//             message: 'not deleted.',
//           });
//           res.json(resp);
//         }
//       });
//     }
//   });


// })
// router.post('/deleteOneUser', function (req, res) {

//   AdminConfig.deleteOne({ parent_id: req.body._id }, function (err, adminConfig) {
//     if (adminConfig) {
//       Admin.deleteOne({ _id: req.body._id }, function (err, Admin) {
//         if (Admin) {
//           var resp = ({
//             error: false,
//             message: 'success.',
//           });
//           res.json(resp);
//         } else {
//           var resp = ({
//             error: true,
//             message: 'not deleted.',
//           });
//           res.json(resp);
//         }
//       });
//     }
//   });


// })
// router.get('/getOneUser/:Id', function (req, res) {
//   var query = { _id: req.params.Id };
//   // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//   Admin.findOne(query, function (err, users) {
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
// router.get('/allUsers/:parent_id', function (req, res) {

//   var query = { parent_id: req.params.parent_id };
//   // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//   Admin.find(query, null, { sort: { _id: -1 } }, function (err, users) {
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
// Update Password 
// router.post('/updateUserPassword', function (req, res) {
//   var where = { _id: req.body._id };
//   var query = { $set: { password: bcrypt.hashSync(req.body.password, 10) } }
//   Admin.updateOne(where, query, function (err, updateResponse) {
//     var resp = ({
//       error: false,
//       message: 'updated ',
//       result: updateResponse
//     });
//     res.json(resp);
//   })
// })

// router.post('/updatePrice', function (req, res) {
//   var where = { parent_id: req.body._id };
//   var query = { price: req.body.price }
//   AdminConfig.updateOne(where, query, function (err, updateResponse) {
//     if (updateResponse) {
//       AdminConfig.findOne(where, function (err1, res1) {
//         var resp = ({
//           error: false,
//           message: 'updated ',
//           result: res1
//         });
//         res.json(resp);
//       });
//     }
//   });
// });

// router.post('/updateUser', function (req, res) {
//   var newAdmin = new Admin();
//   var adminConfig = new AdminConfig();
//   // update user
//   if (req.body._id !== "") {
//     Admin.findOne({ phone: req.body.phone }, function (err, adminResponsePhone) {
//       if (adminResponsePhone) {
//         if (adminResponsePhone._id == req.body._id) {

//           var where = { _id: req.body._id };
//           var query = { $set: { name: req.body.name, avatar: req.body.avatar, location: req.body.location, price: req.body.price, phone: req.body.phone, notes: req.body.notes, address: req.body.address, active: req.body.active, } }
//           Admin.updateOne(where, query, function (err, updateResponse) {
//             var resp = ({
//               error: false,
//               message: 'updated',
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
//         var query = { $set: { name: req.body.name, avatar: req.body.avatar, location: req.body.location, email: req.body.email, phone: req.body.phone, notes: req.body.notes, address: req.body.address, active: req.body.active, } }
//         Admin.updateOne(where, query, function (err, updateResponse) {
//           var resp = ({
//             error: false,
//             message: 'updated',
//             result: updateResponse
//           });

//           res.json(resp);
//         })
//       }
//     })

//   } else { // insert user
//     Admin.findOne({ phone: req.body.phone }, function (err1, phoneExist) {
//       if (err1) deferred.reject(err1.name + ': ' + err1.message);
//       if (phoneExist) {
//         var resp = ({
//           error: true,
//           message: 'Phone Already Exist.'
//         });
//         res.json(resp);
//       } else {
//         newAdmin.parent_id = req.body.parent_id;
//         newAdmin.name = req.body.name;
//         newAdmin.avatar = req.body.avatar;
//         newAdmin.price = req.body.price;
//         newAdmin.phone = req.body.phone;
//         newAdmin.notes = req.body.notes;
//         newAdmin.address = req.body.address;
//         newAdmin.password = bcrypt.hashSync(req.body.password, 10);
//         newAdmin.active = req.body.active;
//         newAdmin.location = req.body.location;
//         newAdmin.starred = req.body.starred;
//         newAdmin.created_at = dateTime;
//         newAdmin.save(function (err, insertedUser) {
//           if (insertedUser) {
//             adminConfig.parent_id = insertedUser._id;
//             adminConfig.lang = 'en';
//             adminConfig.save(function (err, adminConfigResponse) {
//               var resp = ({
//                 error: false,
//                 message: 'success',
//                 result: {
//                   admin: insertedUser,
//                   conifg: adminConfigResponse
//                 }
//               });
//               res.json(resp);
//             })
//           } else {
//             var resp = ({
//               error: true,
//               message: 'Insert Error.'
//             });
//             res.json(resp);
//           }
//         })

//       }

//     })



//   }
//   //-------------------------------------------
// });

module.exports = router;
