const express = require('express');
const router = express.Router();
const connection = require('../database/connection');
const Helper = require('../helper/helper');


router.get('/getTodayPurchaseCount/:userId/:parent_id', function (req, res) {
    var where = "";
    if (req.params.parent_id != 0) {
        where = "where userId = " + req.params.userId + " and date = '" + Helper.yyyymmdd() + "'";
    } else {
        where = "where parent_id = " + req.params.userId + " and date = '" + Helper.yyyymmdd() + "'";
    }
    let todayPurchaseCount = "SELECT *  from purchase " + where;
    connection.query(todayPurchaseCount, function (error, purchase) {
        if (purchase) {
            var resp = ({
                error: false,
                message: 'success.',
                result: purchase.length
            });
            res.json(resp);
        }
    })

})
module.exports = router;