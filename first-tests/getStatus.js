const path = require('path');
const config = require(path.join(__dirname, '../config/config.json'));

const dorita980 = require('dorita980');
var myRobotViaLocal = new dorita980.Local(config.blid, config.password, config.ip);

// myRobotViaLocal
//     .on('update', function (data) {
//         if (data.hasOwnProperty('state') && data.state.hasOwnProperty('reported')) {
//             console.log('onUpdate state.reported :');
//             // console.log(data.state.reported);
//             for (const p in data.state.reported) {
//                 console.log(p, data.state.reported[p]);
//             }
//         } else {
//             console.log('onUpdate :');
//             console.log(data);
//         }
//     })
//     .on('mission', function (data) {
//         console.log('onMission', data);
//     });


// myRobotViaLocal.getBasicMission()
//     .then((result) => {
//         console.log("## getBasicMission :");
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });

// myRobotViaLocal.getPreferences()
//     .then((result) => {
//         console.log("## getPreferences :");
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });

// myRobotViaLocal.getRobotState(['batPct', 'cleanSchedule'])
//     .then((result) => {
//         console.log("## getRobotState :");
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });

// myRobotViaLocal.getWirelessStatus()
//     .then((result) => {
//         console.log("## getWirelessStatus :");
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });

// myRobotViaLocal.getTime()
//     .then((result) => {
//         console.log("## getTime :");
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });
// myRobotViaLocal.getCloudConfig()
//     .then((result) => {
//         console.log("## getCloudConfig :");
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });

myRobotViaLocal.getRobotState(['lastCommand', 'tz', 'timezone'])
    .then((result) => {
        console.log("## get timezone:");
        console.log(result.timezone);
        console.log("## get tz:");
        console.log(result.tz);
        console.log("## get lastCommand:");
        console.log(result.lastCommand);
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
