// get dateformat
const moment = require('moment-timezone');

class Helper {
    static yyyymmdd(date = new Date) {
        var toDateString = new Date(date).toDateString();
        var toISOString = new Date(toDateString + "UTC").toISOString();
        // var convertToZone = moment.tz(toISOString, "Asia/Karachi");
        // var convertToZone1 = moment.tz(date, "Asia/Karachi");
        // console.log(convertToZone.format());
        // console.log(convertToZone1.format());
        console.log(toISOString);
        var now = new Date(toISOString)
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
    }

    //  static toDateString(date) {
    //     return new Date(date).toDateString();
    // }
    // static toISOString(date) {
    //     return new Date(date + "UTC").toISOString()
    // }

    //   new Date("Jul 8, 2005").toISOString()            // "2005-07-08T07:00:00.000Z"
    // new Date("2005-07-08T00:00-07:00").toISOString() // "2005-07-08T07:00:00.000Z"
    // // UTC dates
    // new Date("Jul 8, 2005 UTC").toISOString()        // "2005-07-08T00:00:00.000Z"
    // new Date("2005-07-08").toISOString()   


    //     console.log(req.body.date);
    //   var dat = new Date(req.body.date).toDateString();
    // console.log(dat);

    //   console.log(new Date(dat + "UTC").toISOString());
    // console.log(new Date(Date.UTC(dat)));
    // console.log(new Date(req.body.date));
    // console.log(new Date(Date.parse(req.body.date)));
    // console.log(new Date(Date.UTC(req.body.date)));
    // console.log(new Date(req.body.date).toISOString());
    // console.log(new Date(req.body.date).toDateString());
    // console.log(new Date(req.body.date).toUTCString());
    //   console.log(Helper.yyyymmdd(new Date(dat + "UTC").toISOString()));
}
module.exports = Helper;