var dorita980 = require('dorita980');
var config = require('./config.json');

var myRobotViaLocal = new dorita980.Local(config.blid, config.password, config.ip);

const commands = ['--stop', '--start', '--clean', '--dock'];
const arg = process.argv.find(a => commands.includes(a));

if (!arg) {
  console.error('Usage: node stop.js --stop | --start | --clean | --dock');
  process.exit(1);
}

const action = arg.slice(2); // strip leading '--'

myRobotViaLocal[action]()
  .then((result) => {
    console.log(result);
    console.log("End.");
    process.exit(0);
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });

