
const express = require('express');
const router = express.Router();
const connection = require('../database/connection');
const Helper = require('../helper/helper');



///////////// functions ///////////////

// get invoice no by user id
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

// get count of the purchases
const getPurchaseReportAccountCount = (query, callback) => {
  connection.query(query, function (error, res) {
    // console.log(error);
    return callback(res.length);
  });
}



// insert purchase
const insertPurchase = (req, invouceNo, price, callback) => {
  var parent_id;
  if (req.body.parent_id != 0) {
    parent_id = req.body.parent_id;
  } else {
    parent_id = req.body.userId;
  }

  let insertData = 'INSERT INTO purchase (parent_id, userId, account_id, item_type, price, quantity, location, total_price, invoice_no, date, created_at) VALUES (' + parent_id + ', ' + req.body.userId + ',  ' + req.body.account_id.id + ', "' + req.body.item_type + '", ' + price + ',  ' + req.body.quantity + ',"' + req.body.location + '", ' + price * req.body.quantity + ',  "' + invouceNo + '", "' + req.body.date + '",  "' + Helper.yyyymmdd() + '")';
  connection.query(insertData, function (error, insertedResponse) {
    return callback(insertedResponse);
  });
}

// insert purchase for api
const insertPurchase1 = (req, invouceNo, price, account_id, callback) => {

  var parent_id;
  if (req.body.parent_id != 0) {
    parent_id = req.body.parent_id;
  } else {
    parent_id = req.body.userId;
  }
  let insertData = 'INSERT INTO purchase (parent_id, userId, account_id, item_type, price, quantity, location, total_price, invoice_no, date, created_at) VALUES (' + parent_id + ', ' + req.body.userId + ',  ' + account_id + ', "Cow", ' + price + ',  ' + req.body.quantity + ',"' + req.body.location + '", ' + price * req.body.quantity + ',  "' + invouceNo + '", "' + req.body.date + '",  "' + Helper.yyyymmdd() + '")';
  connection.query(insertData, function (error, insertedResponse) {
    return callback(insertedResponse);
  });
}

// get price
const getConfigPrice = (req, callback) => {
  let id;

  if (req.body.parent_id !== '0' && req.body.parent_id !== 0) {
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

/////////////// routes ////////////////

// new/edit purchase entry
router.post('/updatePurchase', function (req, res) {
  if (req.body.id !== "") {
    let querie = "UPDATE purchase set account_id='" + req.body.account_id.id + "',item_type='" + req.body.item_type + "',quantity='" + req.body.quantity + "',total_price='" + req.body.price * req.body.quantity + "',date='" + req.body.date + "', updated_at='" + Helper.yyyymmdd() + "'    where id = " + req.body.id + "";
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

// get all purchases
router.get('/allPurchase/:userId/:parent_id', function (req, res) {
  console.log("here")
  console.log(req.params)
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
        console.log(resp)
        res.json(resp);
      } else {
        var resp = ({
          error: false,
          message: 'not found.',
          result: []
        });
        console.log(resp)
        res.json(resp);
      }
    } else {
      var resp = ({
        error: false,
        message: 'not found.',
        result: []
      });
      console.log("not found 2")
      res.json(resp);
    }

  })

})

// get all purchases with pagination
router.get('/allPurchases/:userId/:parent_id/:sort/:column/:limit/:offset/:search', function (req, res) {
  // qs.escape(req.params.search);
  var search = "";
  if (req.params.search != 'null') {
    search = " AND (purchase.item_type LIKE '%" + req.params.search +
      "%'  OR purchase.price LIKE '%" + req.params.search +
      "%'  OR purchase.quantity LIKE '%" + req.params.search +
      "%'  OR purchase.total_price  LIKE '%" + req.params.search +
      "%'  OR purchase.location LIKE '%" + req.params.search +
      "%'  OR purchase.invoice_no LIKE '%" + req.params.search +
      "%'  OR purchase.date LIKE '%" + req.params.search +
      "%'  OR account.phone LIKE '%" + req.params.search +
      "%'  OR account.name LIKE '%" + req.params.search +
      "%' ) ";
  }

  var orderBycolumn = "";
  if (req.params.sort != 'null') {
    switch (req.params.column) {
      case 'id':
        orderBycolumn = 'Order By purchase.id ' + req.params.sort;
        break;
      case 'date':
        orderBycolumn = 'Order By purchase.date ' + req.params.sort;
        break;
      case 'invoice':
        orderBycolumn = 'Order By purchase.invoice_no ' + req.params.sort;
        break;
      case 'location':
        orderBycolumn = 'Order By purchase.location ' + req.params.sort;
        break;
      case 'account':
        orderBycolumn = 'Order By account.phone ' + req.params.sort;
        break;
      case 'quantity':
        orderBycolumn = 'Order By purchase.quantity ' + req.params.sort;
        break;
      case 'price':
        orderBycolumn = 'Order By purchase.price ' + req.params.sort;
        break;
      case 'total_price':
        orderBycolumn = 'Order By purchase.total_price ' + req.params.sort;
        break;
    }
  }
  var where = "";
  if (req.params.parent_id != 0) {
    where = "where purchase.userId = " + req.params.userId + "";
  } else {
    where = "where purchase.parent_id = " + req.params.userId + "";
  }
  let querieData = "SELECT purchase.*, account.name, account.phone  FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + search + " " + orderBycolumn + " " + " LIMIT " + req.params.limit + " OFFSET " + req.params.offset + "";
  let querieCount = "SELECT purchase.*, account.name, account.phone  FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + search + "";
  // console.log(querieCount);
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

  });
  // connection.query(querie, function (error, purchase) {
  //   if (purchase) {
  //     if (purchase.length > 0) {
  //       var resp = ({
  //         error: false,
  //         message: 'success.',
  //         result: purchase
  //       });
  //       res.json(resp);
  //     } else {
  //       var resp = ({
  //         error: false,
  //         message: 'not found.',
  //         result: []
  //       });
  //       res.json(resp);
  //     }
  //   } else {
  //     var resp = ({
  //       error: false,
  //       message: 'not found.',
  //       result: []
  //     });
  //     res.json(resp);
  //   }

  // })

})

// report accounts
router.get('/getPurchaseReportAccount/:userId/:parent_id/:accountId/:startDate/:endDate/:groupBy/:sortDirection/:column/:pageSize/:offset', function (req, res) {
  var dateFormat = 'DATE_FORMAT(purchase.date, "%Y-%m-%d")';
  var selectDte = 'purchase.date as date';
  switch (req.params.groupBy) {
    case '1': //for days
      selectDte = 'DATE_FORMAT(purchase.date, "%d %M, %Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m-%d')";
      break;
    case '2': //for months
      selectDte = 'DATE_FORMAT(purchase.date, "%M, %Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m')";
      break;
    case '3': //for years
      selectDte = 'DATE_FORMAT(purchase.date, "%Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y')";
      break;

  }
  var orderBycolumn = "";
  if (req.params.sortDirection != 'null') {
    switch (req.params.column) {
      case 'date':
        orderBycolumn = 'Order By purchase.date ' + req.params.sortDirection;
        break;
      case 'account':
        orderBycolumn = 'Order By account.phone ' + req.params.sortDirection;
        break;
    }
  }

  var where = "";
  if (req.params.parent_id != 0) {
    where = "where purchase.userId = " + req.params.userId;
  } else {
    where = "where purchase.parent_id = " + req.params.userId;
  }
  var where2 = " AND purchase.date >= '" + req.params.startDate + "' AND purchase.date <= '" + req.params.endDate + "'";
  var where3 = '';
  if (req.params.accountId != '0' && req.params.accountId != 'All') {
    where3 = " AND purchase.account_id= '" + req.params.accountId + "'";
  }

  var select = selectDte + ", sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone";
  var limitOffset = " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset;
  let querieCount = "SELECT " + select + " FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + where2 + where3 + " Group By " + dateFormat + ", purchase.account_id";
  let querieData = "SELECT " + select + " FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + where2 + where3 + " Group By " + dateFormat + ", purchase.account_id " + orderBycolumn + " " + limitOffset + "";
  // console.log(querieData);
  // console.log(querieCount);
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

// report daily basis
router.get('/getPurchaseReportAccountDaily/:userId/:parent_id/:startDate/:sortDirection/:column/:pageSize/:offset', function (req, res) {
  var orderBycolumn = "";
  if (req.params.sortDirection != 'null') {
    switch (req.params.column) {
      case 'date':
        orderBycolumn = 'Order By purchase.date ' + req.params.sortDirection;
        break;
      case 'account':
        orderBycolumn = 'Order By account.phone ' + req.params.sortDirection;
        break;
    }
  }
  var where = "";
  if (req.params.parent_id != 0) {
    where = "WHERE account.parent_id = " + req.params.userId;
  }


  let querieCount = "SELECT DATE_FORMAT(purchase.date, '%Y-%m-%d') as date,  sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone FROM account LEFT JOIN purchase ON account.id = purchase.account_id  AND purchase.date = '" + req.params.startDate + "' " + where + " Group By account.id";
  let querieData = "SELECT DATE_FORMAT(purchase.date, '%Y-%m-%d') as date,  sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone FROM account LEFT JOIN purchase ON account.id = purchase.account_id  AND purchase.date = '" + req.params.startDate + "' " + where + " Group By account.id " + orderBycolumn + " " + " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset + "";
  // console.log(querieData);
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
// report admin wise
router.get('/getPurchaseReportAdmin/:userId/:adminId/:startDate/:endDate/:groupBy/:sortDirection/:column/:pageSize/:offset', function (req, res) {

  var dateFormat = 'DATE_FORMAT(purchase.date, "%Y-%m-%d")';
  var selectDte = 'purchase.date as date';
  switch (req.params.groupBy) {
    case '1': //for days
      selectDte = 'DATE_FORMAT(purchase.date, "%d %M, %Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m-%d')";
      break;
    case '2': //for months
      selectDte = 'DATE_FORMAT(purchase.date, "%M, %Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m')";
      break;
    case '3': //for years
      selectDte = 'DATE_FORMAT(purchase.date, "%Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y')";
      break;

  }
  var orderBycolumn = "";
  if (req.params.sortDirection != 'null') {
    switch (req.params.column) {
      case 'date':
        orderBycolumn = 'Order By purchase.date ' + req.params.sortDirection;
        break;
      case 'admin':
        orderBycolumn = 'Order By admin.phone ' + req.params.sortDirection;
        break;
    }
  }

  var where = "where purchase.parent_id = " + req.params.userId;
  var where2 = " AND purchase.date >= '" + req.params.startDate + "' AND purchase.date <= '" + req.params.endDate + "'";
  var where3 = '';
  if (req.params.adminId != '0' && req.params.adminId != 'All') {
    where3 = " AND purchase.userId= '" + req.params.adminId + "'";
  }

  var select = selectDte + ", sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, admin.name, admin.phone";
  var limitOffset = " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset;
  let querieCount = "SELECT " + select + " FROM purchase LEFT JOIN admin ON purchase.userId = admin.id " + where + where2 + where3 + " Group By " + dateFormat + ", purchase.userId";
  let querieData = "SELECT " + select + " FROM purchase LEFT JOIN admin ON purchase.userId = admin.id " + where + where2 + where3 + " Group By " + dateFormat + ", purchase.userId " + orderBycolumn + " " + limitOffset + "";
  // console.log(querieData);
  // console.log(querieCount);
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

// delete one row
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
// delete multiple rows
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




////////////////////// apis for mobile /////////////////////

// new purchase entry api 
router.post('/addPurchaseApi', function (req, res) {
  // update Purchase
  getInvoiceNo(req.body.userId, function (invoiceNo) {
    if (req.body.price !== "" && req.body.price !== '0' && req.body.price !== 0) {
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
  //-------------------------------------------
});

router.post('/updatePurchaseApi', function (req, res) {
  // update Purchase
    let querie = "UPDATE purchase set account_id='" + req.body.account_id + "',quantity='" + req.body.quantity + "',total_price='" + req.body.price * req.body.quantity + "',date='" + req.body.date + "', updated_at='" + Helper.yyyymmdd() + "'    where id = " + req.body.id + "";
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
  //-------------------------------------------
});

// report daily basis api
router.get('/getPurchaseReportAccountDailyApi/:userId/:parent_id/:date', function (req, res) {
  var where = "";
  if (req.params.parent_id != 0) {
    where = "WHERE account.parent_id = " + req.params.userId;
  }

  let querieData = "SELECT account.name, account.phone, DATE_FORMAT(purchase.date, '%Y-%m-%d') as date,  sum(purchase.quantity) as quantity, sum(purchase.total_price) as total_price FROM account LEFT JOIN purchase ON account.id = purchase.account_id  AND purchase.date = '" + req.params.date + "' " + where + " Group By account.id ORDER BY purchase.date DESC";
  connection.query(querieData, function (error, purchase) {
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
          message: 'data not found2.',
          result: []
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

})









//For mongoose
// router.post('/deleteManyUser', function (req, res) {

//   const ids = req.body;
//   Purchase.deleteMany({ _id: { $in: ids } }, function (err, purchaseResp) {
//     if (purchaseResp) {
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

//   Purchase.deleteOne({ _id: req.body._id }, function (err, purchaseResp) {
//     if (purchaseResp) {
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

// router.get('/allPurchase/:userId/:parent_id', function (req, res) {
//   var query = {};
//   if (req.params.parent_id !== '0') {
//     query = { userId: req.params.userId };
//   }
//   // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//   Purchase.find(query, null, { sort: { _id: -1 } }, function (err, purchases) {
//     if (purchases) {
//       res.json(purchases);
//     }
//   })
// })

// router.get('/getInvoiceNo/:userId/:parent_id', function (req, res) {

//   query = { userId: req.params.userId };
//   select = { invoice_no: 1, _id: 0 };
//   // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//   Purchase.findOne(query, select, { sort: { _id: -1 } }, function (err, invoiceNo) {
//     if (invoiceNo) {
//       res.json(parseInt(invoiceNo.invoice_no) + 1);
//     } else {
//       res.json(1001);
//     }
//   })
// })
// router.post('/updatePurchase', function (req, res) {


//   var newPurchase = new Purchase();
//   // update Purchase
//   if (req.body._id !== "") {

//     var where = { _id: req.body._id };
//     var query = { $set: { account_id: req.body.account_id, item_type: req.body.item_type, price: req.body.price, quantity: req.body.quantity, total_price: req.body.price * req.body.quantity, date: req.body.date } }
//     Purchase.updateOne(where, query, function (err, updateResponse) {
//       var resp = ({
//         error: false,
//         message: 'success',
//         result: updateResponse
//       });
//       res.json(resp);
//     })


//   } else { // insert Purchase

//     if (req.body.parent_id !== '0') {
//       query1 = { parent_id: req.body.parent_id };
//     } else {
//       query1 = { parent_id: req.body.userId };
//     }

//     adminConfig.findOne(query1, function (err, resConfig) {

//       if (resConfig) {
//         var purchasePrice = 0;
//         if (req.body.price !== "" && req.body.price !== "0") {
//           purchasePrice = req.body.price;
//         } else {
//           purchasePrice = resConfig.price;
//         }
//         newPurchase.parent_id = req.body.parent_id;
//         newPurchase.userId = req.body.userId;
//         newPurchase.account_id = req.body.account_id;
//         newPurchase.item_type = req.body.item_type;
//         newPurchase.price = purchasePrice;
//         newPurchase.quantity = req.body.quantity;
//         newPurchase.location = req.body.location;
//         newPurchase.total_price = purchasePrice * req.body.quantity;
//         newPurchase.invoice_no = req.body.invoice_no;
//         newPurchase.date = req.body.date;
//         newPurchase.created_at = dateTime;
//         newPurchase.save(function (err, insertedRes) {
//           if (insertedRes) {
//             res.json(insertedRes);
//           }
//         })
//       }
//     })

//   }
//   //-------------------------------------------
// });

// router.post('/addPurchaseApi', function (req, res) {


//   console.log(req.body);
//   var newPurchase = new Purchase();
//   // update Purchase
//   if (req.body._id !== "") {

//     var where = { _id: req.body._id };
//     var query = { $set: { account_id: req.body.account_id, item_type: req.body.item_type, price: req.body.price, quantity: req.body.quantity, total_price: req.body.price * req.body.quantity, date: req.body.date } }
//     Purchase.updateOne(where, query, function (err, updateResponse) {
//       var resp = ({
//         error: false,
//         message: 'success',
//         result: updateResponse
//       });
//       res.json(resp);
//     })


//   } else {
//     // insert Purchase
//     query = { parent_id: req.body.parent_id };
//     select = { invoice_no: 1, _id: 0 };
//     // Admin.find(query, null, {sort:{_id:-1}, skip:0, limit:20}, function (err, users) {
//     Purchase.findOne(query, select, { sort: { _id: -1 } }, function (err, invoiceNo) {
//       var newInvoiceNo = '';
//       if (invoiceNo) {
//         newInvoiceNo = parseInt(invoiceNo.invoice_no) + 1;
//       } else {
//         newInvoiceNo = 1001;
//       }
//       newPurchase.parent_id = req.body.parent_id;
//       newPurchase.account_id = req.body.account_id;
//       newPurchase.item_type = req.body.item_type;
//       newPurchase.price = req.body.price;
//       newPurchase.userId = req.body.userId;
//       newPurchase.quantity = req.body.quantity;
//       newPurchase.total_price = req.body.price * req.body.quantity;
//       newPurchase.invoice_no = newInvoiceNo;
//       newPurchase.location = req.body.location;
//       newPurchase.date = req.body.date;
//       newPurchase.created_at = dateTime;
//       newPurchase.save(function (err, insertedRes) {
//         if (insertedRes) {
//           var resp = ({
//             error: false,
//             message: 'success',
//             result: insertedRes
//           });
//         } else {
//           var resp = ({
//             error: true,
//             message: 'not inserted'
//           });
//         }
//         res.json(resp);

//       })
//     })
//   }
//   //-------------------------------------------
// });

module.exports = router;
