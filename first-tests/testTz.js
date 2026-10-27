const path = require('path');
const config = require(path.join(__dirname, '../config/config.json'));

const dorita980 = require('dorita980');
var myRobotViaLocal = new dorita980.Local(config.blid, config.password, config.ip);

myRobotViaLocal.setPreferences({
        timezone: 'Europe/Paris',
        tz: {
            ver: 0,
            events: [ { dt: 0, off: 60 }, { dt: 0, off: 0 }, { dt: 0, off: 0 } ]
        }
    })
    .then((result) => {
        console.log("## set tz:");
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });

myRobotViaLocal.getRobotState(['tz'])
    .then((result) => {
        console.log("## get tz:");
        console.log(result.tz);
    }).catch((err) => {
        console.log(err);
    });

myRobotViaLocal.getRobotState(['timezone'])
    .then((result) => {
        console.log("## get timezone:");
        console.log(result.timezone);
    }).catch((err) => {
        console.log(err);
    });

myRobotViaLocal.getRobotState(['utctime'])
    .then((result) => {
        console.log("## get utctime:");
        console.log(result.utctime);
    }).catch((err) => {
        console.log(err);
    });

myRobotViaLocal.getRobotState(['localtimeoffset'])
    .then((result) => {
        console.log("## get localtimeoffset:");
        console.log(result.localtimeoffset);
    }).catch((err) => {
        console.log(err);
    });
