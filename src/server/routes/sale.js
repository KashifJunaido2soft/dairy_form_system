
const express = require('express');
const router = express.Router();
const connection = require('../database/connection');
const Helper = require('../helper/helper');



///////////// functions ///////////////

// // get invoice no by user id
const getInvoiceNo = (userId, callback) => {
  let query = "SELECT * FROM sales where userId=" + userId + " ORDER BY id DESC LIMIT 1";
  connection.query(query, function (error, sales) {
    let invoiceNo;
    if (sales.length > 0) {
      var str = sales[0].invoice_no;
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

// // get count of the purchases
const getPurchaseReportAccountCount = (query, callback) => {
  connection.query(query, function (error, res) {
    return callback(res.length);
  });
}



// // insert purchase
const insertSales = (req, invouceNo, price, callback) => {
  var parent_id;
  if (req.body.parent_id != 0) {
    parent_id = req.body.parent_id;
  } else {
    parent_id = req.body.userId;
  }

  let insertData = 'INSERT INTO sales (parent_id, userId, company_id, price, quantity, total_price, invoice_no, date, created_at) VALUES (' + parent_id + ', ' + req.body.userId + ', ' + req.body.company_id.id + ',' + price + ',  ' + req.body.quantity + ', ' + price * req.body.quantity + ',  "' + invouceNo + '", "' + req.body.date + '",  "' + Helper.yyyymmdd() + '")';
  connection.query(insertData, function (error, insertedResponse) {
    return callback(insertedResponse);
  });
}

// // insert purchase for api
// const insertPurchase1 = (req, invouceNo, price, account_id, callback) => {

//   var parent_id;
//   if (req.body.parent_id != 0) {
//     parent_id = req.body.parent_id;
//   } else {
//     parent_id = req.body.userId;
//   }
//   let insertData = 'INSERT INTO purchase (parent_id, userId, account_id, item_type, price, quantity, location, total_price, invoice_no, date, created_at) VALUES (' + parent_id + ', ' + req.body.userId + ',  ' + account_id + ', "Cow", ' + price + ',  ' + req.body.quantity + ',"' + req.body.location + '", ' + price * req.body.quantity + ',  "' + invouceNo + '", "' + req.body.date + '",  "' + Helper.yyyymmdd() + '")';
//   connection.query(insertData, function (error, insertedResponse) {
//     return callback(insertedResponse);
//   });
// }

// // get price
// const getConfigPrice = (req, callback) => {
//   let id;

//   if (req.body.parent_id !== '0' && req.body.parent_id !== 0) {
//     id = req.body.parent_id;
//   } else {
//     id = req.body.userId;
//   }

//   let query = "SELECT * FROM admin_config where parent_id=" + id + " ORDER BY id DESC LIMIT 1";
//   connection.query(query, function (error, adminConfig) {
//     let price;
//     if (adminConfig.length > 0) {
//       price = adminConfig[0].price;
//     }
//     return callback(price);
//   });
// }

/////////////// routes ////////////////

// new/edit sale entry
router.post('/updateSale', function (req, res) {

  if (req.body.id !== "") {
    let querie = "UPDATE sales set company_id='" + req.body.company_id.id + "', quantity='" + req.body.quantity + "' , price='" + req.body.price + "', total_price='" + req.body.price * req.body.quantity + "', date='" + req.body.date + "', updated_at='" + Helper.yyyymmdd() + "' where id = " + req.body.id + "";
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
    // insert Sale
    getInvoiceNo(req.body.userId, function (invoiceNo) {
      insertSales(req, invoiceNo, req.body.price, function (insertedData) {
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
    });
  }
});

// get all purchases
// router.get('/allPurchase/:userId/:parent_id', function (req, res) {
//   var where = "";
//   if (req.params.parent_id != 0) {
//     where = "where purchase.userId = " + req.params.userId + "";
//   } else {
//     where = "where purchase.parent_id = " + req.params.userId + "";
//   }
//   let querie = "SELECT purchase.*, account.name, account.phone  FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + " Order By purchase.id DESC";
//   connection.query(querie, function (error, purchase) {
//     if (purchase) {
//       if (purchase.length > 0) {
//         var resp = ({
//           error: false,
//           message: 'success.',
//           result: purchase
//         });
//         res.json(resp);
//       } else {
//         var resp = ({
//           error: false,
//           message: 'not found.',
//           result: []
//         });
//         res.json(resp);
//       }
//     } else {
//       var resp = ({
//         error: false,
//         message: 'not found.',
//         result: []
//       });
//       res.json(resp);
//     }

//   })

// })

// get all sales with pagination
router.get('/allSales/:userId/:parent_id/:sort/:column/:limit/:offset/:search', function (req, res) {
  var search = "";
  if (req.params.search != 'null') {
    search = " AND ( sales.price LIKE '%" + req.params.search +
      "%'  OR sales.quantity LIKE '%" + req.params.search +
      "%'  OR sales.total_price  LIKE '%" + req.params.search +
      "%'  OR sales.invoice_no LIKE '%" + req.params.search +
      "%'  OR sales.date LIKE '%" + req.params.search +
      "%'  OR company.phone LIKE '%" + req.params.search +
      "%'  OR company.name LIKE '%" + req.params.search + "%') ";
  }
  var orderBycolumn = "";
  if (req.params.sort != 'null') {
    switch (req.params.column) {
      case 'id':
        orderBycolumn = 'Order By sales.id ' + req.params.sort;
        break;
      case 'date':
        orderBycolumn = 'Order By sales.date ' + req.params.sort;
        break;
      case 'invoice':
        orderBycolumn = 'Order By sales.invoice_no ' + req.params.sort;
        break;
      case 'company':
        orderBycolumn = 'Order By company.phone ' + req.params.sort;
        break;
      case 'quantity':
        orderBycolumn = 'Order By sales.quantity ' + req.params.sort;
        break;
      case 'price':
        orderBycolumn = 'Order By sales.price ' + req.params.sort;
        break;
      case 'total_price':
        orderBycolumn = 'Order By sales.total_price ' + req.params.sort;
        break;
    }
  }
  var where = "";
  if (req.params.parent_id != 0) {
    where = "where sales.userId = " + req.params.userId + "";
  } else {
    where = "where sales.parent_id = " + req.params.userId + "";
  }
  let querieData = "SELECT sales.*, company.name, company.phone, company.avatar  FROM sales LEFT JOIN company ON sales.company_id = company.id " + where + search + " " + orderBycolumn + " " + " LIMIT " + req.params.limit + " OFFSET " + req.params.offset + "";
  let querieCount = "SELECT sales.*, company.name, company.phone, company.avatar  FROM sales LEFT JOIN company ON sales.company_id = company.id " + where + search + "";
  getPurchaseReportAccountCount(querieCount, function (count) {
    if (count > 0) {
      connection.query(querieData, function (error, sales) {
        if (sales) {
          if (sales.length > 0) {
            var resp = ({
              error: false,
              message: 'success.',
              result: {
                count: count,
                data: sales
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
})

router.get('/getAvailableQty/:userId/:date', function (req, res) {
  let purchaseQuery = "select sum(quantity) as totalPQty from purchase where parent_id = '" + req.params.userId + "' And date = '" + req.params.date + "'";
  let salesQuery = "select sum(quantity) as totalPQty from sales where parent_id = '" + req.params.userId + "' And date = '" + req.params.date + "'";
  connection.query(purchaseQuery, function (error, purchaseResp) {
    var purchase = 0;
    var balance = 0;
    if (purchaseResp) {
      purchase = purchaseResp[0].totalPQty;
      connection.query(salesQuery, function (error, salesResp) {
        var sales = 0;
        if (salesResp) {
          sales = salesResp[0].totalPQty;
          balance = purchase - sales;
          var resp = ({
            error: false,
            message: 'success',
            result: balance
          });
          res.json(resp);
        } else {
          balance = purchase - sales;
          var resp = ({
            error: false,
            message: 'success',
            result: balance
          });
          res.json(resp);
        }
      })
    } else {
      balance = purchase - 0;
      var resp = ({
        error: false,
        message: 'success',
        result: balance
      });
      res.json(resp);
    }
  })
});

// report accounts
// router.get('/getPurchaseReportAccount/:userId/:parent_id/:accountId/:startDate/:endDate/:groupBy/:sortDirection/:column/:pageSize/:offset', function (req, res) {
//   var dateFormat = 'DATE_FORMAT(purchase.date, "%Y-%m-%d")';
//   var selectDte = 'purchase.date as date';
//   switch (req.params.groupBy) {
//     case '1': //for days
//       selectDte = 'DATE_FORMAT(purchase.date, "%d %M, %Y") as date';
//       dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m-%d')";
//       break;
//     case '2': //for months
//       selectDte = 'DATE_FORMAT(purchase.date, "%M, %Y") as date';
//       dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m')";
//       break;
//     case '3': //for years
//       selectDte = 'DATE_FORMAT(purchase.date, "%Y") as date';
//       dateFormat = "DATE_FORMAT(purchase.date, '%Y')";
//       break;

//   }
//   var orderBycolumn = "";
//   if (req.params.sortDirection != 'null') {
//     switch (req.params.column) {
//       case 'date':
//         orderBycolumn = 'Order By purchase.date ' + req.params.sortDirection;
//         break;
//       case 'account':
//         orderBycolumn = 'Order By account.phone ' + req.params.sortDirection;
//         break;
//     }
//   }

//   var where = "";
//   if (req.params.parent_id != 0) {
//     where = "where purchase.userId = " + req.params.userId;
//   } else {
//     where = "where purchase.parent_id = " + req.params.userId;
//   }
//   var where2 = " AND purchase.date >= '" + req.params.startDate + "' AND purchase.date <= '" + req.params.endDate + "'";
//   var where3 = '';
//   if (req.params.accountId != '0' && req.params.accountId != 'All') {
//     where3 = " AND purchase.account_id= '" + req.params.accountId + "'";
//   }

//   var select = selectDte + ", sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone";
//   var limitOffset = " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset;
//   let querieCount = "SELECT " + select + " FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + where2 + where3 + " Group By " + dateFormat + ", purchase.account_id";
//   let querieData = "SELECT " + select + " FROM purchase LEFT JOIN account ON purchase.account_id = account.id " + where + where2 + where3 + " Group By " + dateFormat + ", purchase.account_id " + orderBycolumn + " " + limitOffset + "";
//   // console.log(querieData);
//   // console.log(querieCount);
//   getPurchaseReportAccountCount(querieCount, function (count) {
//     if (count > 0) {
//       connection.query(querieData, function (error, purchase) {
//         if (purchase) {
//           if (purchase.length > 0) {
//             var resp = ({
//               error: false,
//               message: 'success.',
//               result: {
//                 count: count,
//                 data: purchase
//               }
//             });
//             res.json(resp);
//           } else {
//             var resp = ({
//               error: false,
//               message: 'data not found2.',
//               result: {
//                 count: 0,
//                 data: []
//               }
//             });
//             res.json(resp);
//           }
//         } else {
//           var resp = ({
//             error: false,
//             message: 'data not found2.',
//             result: {
//               count: 0,
//               data: []
//             }
//           });
//           res.json(resp);
//         }

//       })
//     } else {
//       var resp = ({
//         error: false,
//         message: 'data not found1.',
//         result: {
//           count: 0,
//           data: []
//         }
//       });
//       res.json(resp);
//     }

//   })

// })

// report daily basis
// router.get('/getPurchaseReportAccountDaily/:userId/:parent_id/:startDate/:sortDirection/:column/:pageSize/:offset', function (req, res) {
//   var orderBycolumn = "";
//   if (req.params.sortDirection != 'null') {
//     switch (req.params.column) {
//       case 'date':
//         orderBycolumn = 'Order By purchase.date ' + req.params.sortDirection;
//         break;
//       case 'account':
//         orderBycolumn = 'Order By account.phone ' + req.params.sortDirection;
//         break;
//     }
//   }
//   var where = "";
//   if (req.params.parent_id != 0) {
//     where = "WHERE account.parent_id = " + req.params.userId;
//   }


//   let querieCount = "SELECT DATE_FORMAT(purchase.date, '%Y-%m-%d') as date,  sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone FROM account LEFT JOIN purchase ON account.id = purchase.account_id  AND purchase.date = '" + req.params.startDate + "' " + where + " Group By account.id";
//   let querieData = "SELECT DATE_FORMAT(purchase.date, '%Y-%m-%d') as date,  sum(purchase.quantity) as total_quantity, sum(purchase.total_price) as total_price, account.name, account.phone FROM account LEFT JOIN purchase ON account.id = purchase.account_id  AND purchase.date = '" + req.params.startDate + "' " + where + " Group By account.id " + orderBycolumn + " " + " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset + "";
//   // console.log(querieData);
//   // console.log(querieData);
//   getPurchaseReportAccountCount(querieCount, function (count) {
//     if (count > 0) {
//       connection.query(querieData, function (error, purchase) {
//         if (purchase) {
//           if (purchase.length > 0) {
//             var resp = ({
//               error: false,
//               message: 'success.',
//               result: {
//                 count: count,
//                 data: purchase
//               }
//             });
//             res.json(resp);
//           } else {
//             var resp = ({
//               error: false,
//               message: 'data not found2.',
//               result: {
//                 count: 0,
//                 data: []
//               }
//             });
//             res.json(resp);
//           }
//         } else {
//           var resp = ({
//             error: false,
//             message: 'data not found2.',
//             result: {
//               count: 0,
//               data: []
//             }
//           });
//           res.json(resp);
//         }

//       })
//     } else {
//       var resp = ({
//         error: false,
//         message: 'data not found1.',
//         result: {
//           count: 0,
//           data: []
//         }
//       });
//       res.json(resp);
//     }

//   })

// })

router.get('/getSaleReportCompanyWise/:userId/:company_id/:startDate/:endDate/:groupBy/:sortDirection/:column/:pageSize/:offset', function (req, res) {
  // console.log(req.params);
  var dateFormat = 'DATE_FORMAT(sales.date, "%Y-%m-%d")';
  var selectDte = 'DATE_FORMAT(sales.date, "%d %b, %Y") as date';
  switch (req.params.groupBy) {
    case '1': //for days
      selectDte = 'DATE_FORMAT(sales.date, "%d %b, %Y") as date';
      dateFormat = "DATE_FORMAT(sales.date, '%Y-%m-%d')";
      break;
    case '2': //for months
      selectDte = 'DATE_FORMAT(sales.date, "%b, %Y") as date';
      dateFormat = "DATE_FORMAT(sales.date, '%Y-%m')";
      break;
    case '3': //for years
      selectDte = 'DATE_FORMAT(sales.date, "%Y") as date';
      dateFormat = "DATE_FORMAT(sales.date, '%Y')";
      break;

  }
  var orderBycolumn = "";
  if (req.params.sortDirection != 'null') {
    switch (req.params.column) {
      case 'date':
        orderBycolumn = 'Order By sales.date ' + req.params.sortDirection;
        break;
      case 'company':
        orderBycolumn = 'Order By company.phone ' + req.params.sortDirection;
        break;
    }
  }

  var where = "where sales.parent_id = " + req.params.userId;
  var where2 = " AND sales.date >= '" + req.params.startDate + "' AND sales.date <= '" + req.params.endDate + "'";
  var where3 = '';
  if (req.params.company_id != '0' && req.params.company_id != 'All') {
    where3 = " AND sales.company_id= '" + req.params.company_id + "'";
  }

  var select = selectDte + ", sum(sales.quantity) as total_quantity, sum(sales.total_price) as total_price, company.name, company.phone, company.avatar";

  var limitOffset = " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset;
  let querieCount = "SELECT " + select + " FROM sales LEFT JOIN company ON sales.company_id = company.id " + where + where2 + where3 + " Group By " + dateFormat + ", sales.company_id";
  let querieData = "SELECT " + select + " FROM sales LEFT JOIN company ON sales.company_id = company.id " + where + where2 + where3 + " Group By " + dateFormat + ", sales.company_id " + orderBycolumn + " " + limitOffset + "";

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

// report Sale 
router.get('/getSaleReportDateWise/:userId/:startDate/:endDate/:groupBy/:sortDirection/:column/:pageSize/:offset', function (req, res) {
  // console.log(req.params);
  var dateFormat = 'DATE_FORMAT(purchase.date, "%Y-%m-%d")';
  var dateFormatsales = 'DATE_FORMAT(sales.date, "%Y-%m-%d")';
  var selectDte = 'DATE_FORMAT(purchase.date, "%d %b, %Y") as date';
  switch (req.params.groupBy) {
    case '1': //for days
      selectDte = 'DATE_FORMAT(purchase.date, "%d %b, %Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m-%d')";
      dateFormatsales = "DATE_FORMAT(sales.date, '%Y-%m-%d')";
      break;
    case '2': //for months
      selectDte = 'DATE_FORMAT(purchase.date, "%b, %Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y-%m')";
      dateFormatsales = "DATE_FORMAT(sales.date, '%Y-%m')";
      break;
    case '3': //for years
      selectDte = 'DATE_FORMAT(purchase.date, "%Y") as date';
      dateFormat = "DATE_FORMAT(purchase.date, '%Y')";
      dateFormatsales = "DATE_FORMAT(sales.date, '%Y')";
      break;

  }
  var orderBycolumn = "";
  if (req.params.sortDirection != 'null') {
    switch (req.params.column) {
      case 'date':
        orderBycolumn = 'Order By purchase.date ' + req.params.sortDirection;
        break;
    }
  }

  var where = "where purchase.parent_id = " + req.params.userId;
  var where2 = " AND purchase.date >= '" + req.params.startDate + "' AND purchase.date <= '" + req.params.endDate + "'";
  var where3 = " where sales.date >= '" + req.params.startDate + "' AND sales.date <= '" + req.params.endDate + "'";

  var select = selectDte + ", IFNULL(sum(purchase.quantity),0) as total_purchase, IFNULL((sales.total_sales), 0) as total_sales, IFNULL( (SUM(purchase.total_price) / SUM(purchase.quantity)), 0)  as total_expense, sales.sale_date";

  var limitOffset = " LIMIT " + req.params.pageSize + " OFFSET " + req.params.offset;
  let querieCount = "SELECT " + select + " FROM purchase LEFT JOIN (SELECT DATE_FORMAT(sales.date, '%Y-%m-%d') as sale_date, sum(sales.quantity) as total_sales from sales " + where3 + " GROUP by " + dateFormatsales + ") as sales ON purchase.date = sales.sale_date " + where + where2 + " Group By " + dateFormat + "";
  let querieData = "SELECT " + select + " FROM purchase LEFT JOIN  (SELECT DATE_FORMAT(sales.date, '%Y-%m-%d') as sale_date, sum(sales.quantity) as total_sales from sales " + where3 + " GROUP by " + dateFormatsales + ") as sales ON purchase.date = sales.sale_date " + where + where2 + " Group By " + dateFormat + " " + orderBycolumn + " " + limitOffset + "";

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
  let querie = "DELETE FROM sales  where id = " + req.body.id + "";
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
  let querie = "DELETE FROM sales  where id IN (" + ids + ")";
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
// router.post('/addPurchaseApi', function (req, res) {
//   // update Purchase
//   getInvoiceNo(req.body.userId, function (invoiceNo) {
//     if (req.body.price !== "" && req.body.price !== '0' && req.body.price !== 0) {
//       insertPurchase1(req, invoiceNo, req.body.price, req.body.account_id, function (insertedData) {
//         if (insertedData) {
//           if (insertedData.affectedRows > 0) {
//             var resp = ({
//               error: false,
//               message: 'success.'
//             });
//             res.json(resp);
//           } else {
//             var resp = ({
//               error: false,
//               message: 'not insert.'
//             });
//             res.json(resp);
//           }
//         } else {
//           var resp = ({
//             error: false,
//             message: 'not insert.'
//           });
//           res.json(resp);
//         }

//       });
//     } else {
//       getConfigPrice(req, function (price) {
//         insertPurchase1(req, invoiceNo, price, req.body.account_id, function (insertedData) {
//           if (insertedData) {
//             if (insertedData.affectedRows > 0) {
//               var resp = ({
//                 error: false,
//                 message: 'success.'
//               });
//               res.json(resp);
//             } else {
//               var resp = ({
//                 error: false,
//                 message: 'not insert.'
//               });
//               res.json(resp);
//             }
//           } else {
//             var resp = ({
//               error: false,
//               message: 'not insert.'
//             });
//             res.json(resp);
//           }

//         })
//       })
//     }

//   });
//   //-------------------------------------------
// });

// router.post('/updatePurchaseApi', function (req, res) {
//   // update Purchase
//     let querie = "UPDATE purchase set account_id='" + req.body.account_id + "',quantity='" + req.body.quantity + "',total_price='" + req.body.price * req.body.quantity + "',date='" + req.body.date + "', updated_at='" + Helper.yyyymmdd() + "'    where id = " + req.body.id + "";
//     connection.query(querie, function (error, upres) {
//       if (upres) {
//         if (upres.affectedRows > 0) {
//           var resp = ({
//             error: false,
//             message: 'success'
//           });
//           res.json(resp);
//         }
//       } else {
//         var resp = ({
//           error: true,
//           message: 'not update'
//         });
//         res.json(resp);
//       }


//     })
//   //-------------------------------------------
// });

// // report daily basis api
// router.get('/getPurchaseReportAccountDailyApi/:userId/:parent_id/:date', function (req, res) {
//   var where = "";
//   if (req.params.parent_id != 0) {
//     where = "WHERE account.parent_id = " + req.params.userId;
//   }

//   let querieData = "SELECT account.name, account.phone, DATE_FORMAT(purchase.date, '%Y-%m-%d') as date,  sum(purchase.quantity) as quantity, sum(purchase.total_price) as total_price FROM account LEFT JOIN purchase ON account.id = purchase.account_id  AND purchase.date = '" + req.params.date + "' " + where + " Group By account.id ORDER BY purchase.date DESC";
//   connection.query(querieData, function (error, purchase) {
//     if (purchase) {
//       if (purchase.length > 0) {
//         var resp = ({
//           error: false,
//           message: 'success.',
//           result: purchase
//         });
//         res.json(resp);
//       } else {
//         var resp = ({
//           error: false,
//           message: 'data not found2.',
//           result: []
//         });
//         res.json(resp);
//       }
//     } else {
//       var resp = ({
//         error: false,
//         message: 'data not found2.',
//         result: {
//           count: 0,
//           data: []
//         }
//       });
//       res.json(resp);
//     }

//   })

// })









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
