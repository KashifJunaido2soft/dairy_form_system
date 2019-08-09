
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
// const Purchase = require('../models/purchase');
// const adminConfig = require('../models/admin_config');

function yyyymmdd(date = "") {
  var now = new Date(date);
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



const getInvoiceNo = (userId, callback) => {

  let query = "SELECT * FROM purchase where userId=" + userId + " ORDER BY id DESC LIMIT 1";
  connection.query(query, function (error, purchase) {
    let invoiceNo;
    if (purchase.length > 0) {
      var str = purchase[0].invoice_no;
      var arr = str.split("-").map(function (val) {
        return Number(val) + 1;
      });
      invoiceNo = "" + userId + "-" + arr[1];
    } else {
      invoiceNo = "" + userId + "-" + 1001;

    }
    return callback(invoiceNo);
  });
}

const getPurchaseReportAccountCount = (query, callback) => {
  connection.query(query, function (error, res) {
    return callback(res.length);
  });
}

const insertPurchase = (req, invouceNo, price, callback) => {

  var parent_id;
  if (req.body.parent_id != 0) {
    parent_id = req.body.parent_id;
  } else {
    parent_id = req.body.userId;
  }

  let insertData = 'INSERT INTO purchase (parent_id, userId, account_id, item_type, price, quantity, location, total_price, invoice_no, date, created_at) VALUES (' + parent_id + ', ' + req.body.userId + ',  ' + req.body.account_id.id + ', "' + req.body.item_type + '", ' + price + ',  ' + req.body.quantity + ',"' + req.body.location + '", ' + price * req.body.quantity + ',  "' + invouceNo + '", "' + yyyymmdd(req.body.date) + '",  "' + yyyymmdd() + '")';
  connection.query(insertData, function (error, insertedResponse) {
    return callback(insertedResponse);
  });
}
const insertPurchase1 = (req, invouceNo, price, account_id, callback) => {

  var parent_id;
  if (req.body.parent_id != 0) {
    parent_id = req.body.parent_id;
  } else {
    parent_id = req.body.userId;
  }
  let insertData = 'INSERT INTO purchase (parent_id, userId, account_id, item_type, price, quantity, location, total_price, invoice_no, date, created_at) VALUES (' + parent_id + ', ' + req.body.userId + ',  ' + account_id + ', "' + req.body.item_type + '", ' + price + ',  ' + req.body.quantity + ',"' + req.body.location + '", ' + price * req.body.quantity + ',  "' + invouceNo + '", "' + yyyymmdd(req.body.date) + '",  "' + yyyymmdd() + '")';
  connection.query(insertData, function (error, insertedResponse) {
    return callback(insertedResponse);
  });
}
const getConfigPrice = (req, callback) => {
  let id;
  if (req.body.parent_id !== 0) {
    id = req.body.parent_id;
  } else {
    id = req.body.userId;
  }
  let query = "SELECT * FROM admin_config where parent_id=" + id + " ORDER BY id DESC LIMIT 1";
  connection.query(query, function (error, adminConfig) {
    let price;
    if (adminConfig.length > 0) {
      price = adminConfig[0].price;
    }
    return callback(price);
  });
}


//For mysql
router.post('/updatePurchase', function (req, res) {
  if (req.body.id !== "") {
    let querie = "UPDATE purchase set account_id='" + req.body.account_id.id + "',item_type='" + req.body.item_type + "',quantity='" + req.body.quantity + "',total_price='" + req.body.price * req.body.quantity + "',date='" + yyyymmdd(req.body.date) + "', updated_at='" + yyyymmdd() + "'    where id = " + req.body.id + "";
    connection.query(querie, function (error, upres) {
      if (upres) {
        if (upres.affectedRows > 0) {
          var resp = ({
            error: false,
            message: 'success'
          });
          res.json(resp);
        }
      } else {
        var resp = ({
          error: false,
          message: 'not insert.'
        });
        res.json(resp);
      }
    })

  } else {
    // insert Purchase
    getInvoiceNo(req.body.userId, function (invoiceNo) {
      if (req.body.price !== "" && req.body.price !== 0) {
        insertPurchase(req, invoiceNo, req.body.price, function (insertedData) {
          if (insertedData) {
            if (insertedData.affectedRows > 0) {
              var resp = ({
                error: false,
                message: 'success.'
              });
              res.json(resp);
            } else {
              var resp = ({
                error: false,
                message: 'not insert.'
              });
              res.json(resp);
            }
          } else {
            var resp = ({
              error: false,
              message: 'not insert.'
            });
            res.json(resp);
          }

        });
      } else {
        getConfigPrice(req, function (price) {
          insertPurchase(req, invoiceNo, price, function (insertedData) {
            if (insertedData) {
              if (insertedData.affectedRows > 0) {
                var resp = ({
                  error: false,
                  message: 'success.'
                });
                res.json(resp);
              } else {
                var resp = ({
                  error: false,
                  message: 'not insert.'
                });
                res.json(resp);
              }
            } else {
              var resp = ({
                error: false,
                message: 'not insert.'
              });
              res.json(resp);
            }

          })
        })
      }

    });
  }
});

router.get('/allPurchase/:userId/:parent_id', function (req, res) {
  var where = "";
  if (req.params.parent_id != 0) {
    where = "where purchase.userId = " + req.params.userId + "";
  } else {
    where = "where purchase.parent_id = " + req.params.userId + "";
  }
  let querie = "SELECT purchase.*, account.name, account.phone  FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + " Order By purchase.id DESC";
  connection.query(querie, function (error, purchase) {
    if (purchase) {
      if (purchase.length > 0) {
        var resp = ({
          error: false,
          message: 'success.',
          result: purchase
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
router.get('/getPurchaseReportAccount/:userId/:parent_id/:accountId/:startDate/:endDate/:groupBy/:filter/:sortDirection/:pageSize/:offset', function (req, res) {

  var dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m-%d')";
  switch (req.params.groupBy) {
    case 'days':
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m-%d')";
      break;
    case 'weeks':
      dateFormat = "DATE_FORMAT(purchase.date, '%b %e')";
      break;
    case 'months':
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m')";
      break;
    case 'years':
      dateFormat = "DATE_FORMAT(purchase.date, '%Y')";
      break;

  }
  var where = "";
  if (req.params.parent_id != 0) {
    where = "where purchase.userId = " + req.params.userId;
  } else {
    where = "where purchase.parent_id = " + req.params.userId;
  }
  var where2 = " AND purchase.date >= '" + req.params.startDate + "' AND purchase.date <= '" + req.params.endDate + "'";
  var select = " purchase.date, sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone";
  var limitOffset = " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset;
  let querieCount = "SELECT " + select + " FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + where2 + " Group By " + dateFormat + ", purchase.account_id";
  let querieData = "SELECT " + select + " FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + where2 + " Group By " + dateFormat + ", purchase.account_id Order By purchase.date " + req.params.sortDirection + limitOffset + "";
  // console.log(querieData);
  getPurchaseReportAccountCount(querieCount, function (count) {
    if (count > 0) {
      connection.query(querieData, function (error, purchase) {
        if (purchase) {
          if (purchase.length > 0) {
            var resp = ({
              error: false,
              message: 'success.',
              result: {
                count: count,
                data: purchase
              }
            });
            res.json(resp);
          } else {
            var resp = ({
              error: false,
              message: 'data not found2.',
              result: {
                count: 0,
                data: []
              }
            });
            res.json(resp);
          }
        } else {
          var resp = ({
            error: false,
            message: 'data not found2.',
            result: {
              count: 0,
              data: []
            }
          });
          res.json(resp);
        }

      })
    } else {
      var resp = ({
        error: false,
        message: 'data not found1.',
        result: {
          count: 0,
          data: []
        }
      });
      res.json(resp);
    }

  })


})
router.post('/deleteOneUser', function (req, res) {

  let querie = "DELETE FROM purchase  where id = " + req.body.id + "";
  connection.query(querie, function (error, upres) {
    if (upres) {
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
  let querie = "DELETE FROM purchase  where id IN (" + ids + ")";
  connection.query(querie, function (error, upres) {
    if (upres) {
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
    } else {
      var resp = ({
        error: true,
        message: 'not deleted'
      });
      res.json(resp);
    }

  })
})

router.post('/addPurchaseApi', function (req, res) {


  // update Purchase
  if (req.body.id !== "") {

    let querie = "UPDATE purchase set account_id='" + req.body.account_id.id + "',item_type='" + req.body.item_type + "',quantity='" + req.body.quantity + "',total_price='" + req.body.price * req.body.quantity + "',date='" + yyyymmdd(req.body.date) + "', updated_at='" + yyyymmdd() + "'    where id = " + req.body.id + "";
    connection.query(querie, function (error, upres) {
      if (upres) {
        if (upres.affectedRows > 0) {
          var resp = ({
            error: false,
            message: 'success'
          });
          res.json(resp);
        }
      } else {
        var resp = ({
          error: true,
          message: 'not update'
        });
        res.json(resp);
      }


    })


  } else {
    getInvoiceNo(req.body.userId, function (invoiceNo) {
      if (req.body.price !== "" && req.body.price !== 0) {
        insertPurchase1(req, invoiceNo, req.body.price, req.body.account_id, function (insertedData) {
          if (insertedData) {
            if (insertedData.affectedRows > 0) {
              var resp = ({
                error: false,
                message: 'success.'
              });
              res.json(resp);
            } else {
              var resp = ({
                error: false,
                message: 'not insert.'
              });
              res.json(resp);
            }
          } else {
            var resp = ({
              error: false,
              message: 'not insert.'
            });
            res.json(resp);
          }

        });
      } else {
        getConfigPrice(req, function (price) {
          insertPurchase1(req, invoiceNo, price, req.body.account_id, function (insertedData) {
            if (insertedData) {
              if (insertedData.affectedRows > 0) {
                var resp = ({
                  error: false,
                  message: 'success.'
                });
                res.json(resp);
              } else {
                var resp = ({
                  error: false,
                  message: 'not insert.'
                });
                res.json(resp);
              }
            } else {
              var resp = ({
                error: false,
                message: 'not insert.'
              });
              res.json(resp);
            }

          })
        })
      }

    });
  }
  //-------------------------------------------
});

module.exports = router;
