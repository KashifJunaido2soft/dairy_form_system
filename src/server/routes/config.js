/**
 * Created by Dell on 8/8/2018.
 */
const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

/////////////// routes ////////////////

// update language
router.get('/updateLang/:langId/:configId', function (req, res) {

  let querie = "UPDATE admin_config set lang='" + req.params.langId + "' where id = " + req.params.configId + "";
  connection.query(querie, function (error, upres) {

    if (upres.affectedRows > 0) {
      let querie2 = "SELECT * FROM admin_config  where id = " + req.params.configId + "";
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





// for Mongoose
// router.get('/updateLang/:langId/:configId', function (req, res) {
//   var where = { _id: req.params.configId };
//   var query = { lang: req.params.langId }
//   AdminConfig.updateOne(where, query, function (err, updateResponse) {
//     if (updateResponse) {
//       AdminConfig.findOne(where, function (err1, res1) {
//         var resp = ({
//           error: false,
//           message: 'success',
//           result: res1
//         });
//         res.json(resp);
//       });
//     }
//   });
// });

module.exports = router;
