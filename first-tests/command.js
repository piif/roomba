const path = require('path');
const config = require(path.join(__dirname, '../config/config.json'));

const commands = ['--stop', '--start', '--clean', '--dock', '--mission', '--battery', '--sys'];
const arg = process.argv.find(a => commands.includes(a));

if (!arg) {
  console.error('Usage: node stop.js --stop | --start | --clean | --dock | --mission | --battery | --sys');
  process.exit(1);
}

const dorita980 = require('dorita980');
var myRobotViaLocal = new dorita980.Local(config.blid, config.password, config.ip);

const action = arg.slice(2); // strip leading '--'

switch(action) {
  case 'start':
  case 'stop':
  case 'clean':
  case 'dock':
    method = action;
    args = [];
    break;
  case 'battery':
    method = 'getRobotState';
    args = [ ['batPct'] ];
    break;
  case 'sys':
    method = 'getSys';
    args = [];
    break;
  case 'mission':
    method = 'getBasicMission';
    args = [];
    break;
}

// myRobotViaLocal
//   .on('update', function (data) {
//   console.log('onUpdate', data);
//   })
//   .on('mission', function (data) {
//   console.log('onMission', data);
//   });

myRobotViaLocal[method].apply(myRobotViaLocal, args)
  .then((result) => {
    console.log(result);
    console.log("End.");
    process.exit(0);
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });

