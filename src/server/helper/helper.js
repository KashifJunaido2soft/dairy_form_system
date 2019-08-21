// get dateformat
const moment = require('moment-timezone');

class Helper {
    static yyyymmdd(date = new Date) {
        var convertToZone = moment.tz(date, "Asia/Karachi");
        var now = new Date(convertToZone.format())
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
    }
}
module.exports = Helper;