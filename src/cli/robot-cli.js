#!/usr/bin/env node

const { createRobotClient } = require('../app/robotService');

const allowedCommands = [
    'start', 'stop', 'clean', 'dock',
    'config', 'status', 'watch', 'planning' ];

function parseArgs(argv) {
    var otherArgs = [];
    var mode = 'real';
    var commands = [];
    for (var a of argv.slice(2)) {
        if (allowedCommands.includes(a)) {
            commands.push(a);
        } else if (a.startsWith('--mode=')) {
            mode = a.split('=')[1];
        } else {
            otherArgs.push(a);
        }
    }

    return { mode, commands, otherArgs };
}

function printUsage() {
    console.error(
        'Usage: node src/cli/robot-cli.js [--mode=real|mock] <start|stop|clean|dock|config|status|watch|planning [ "hh:mm,hh:mm,..." ]>'
    );
}

async function run() {
    var { mode, commands, otherArgs } = parseArgs(process.argv);

    if (commands.length == 0) {
        printUsage();
        process.exit(1);
    }

    if (!['real', 'mock'].includes(mode)) {
        console.error('Invalid mode. Expected --mode=real or --mode=mock.');
        process.exit(1);
    }

    const client = createRobotClient(mode);

    for (command of commands) {
        if (command === 'watch') {
            client
                .on('mission', (data) => {
                    console.log(JSON.stringify({ event: 'mission', data }, null, 2));
                })
                .on('update', (data) => {
                    console.log(JSON.stringify({ event: 'update', data }, null, 2));
                });

            console.log(JSON.stringify({ ok: true, mode, command: 'watch', info: 'Watching events. Press Ctrl+C to stop.' }));

            if (mode === 'mock') {
                setInterval(() => {
                    client.mission().catch((error) => {
                    console.error(error.message);
                    });
                }, 1000);
            } else {
                await client.mission();
            }

        } else {

            if (command === 'planning' && otherArgs.length != 0) {
                days = otherArgs[0].split(',');
                if (days.length != 7) {
                    console.error('Invalid planning : expected 7 comma separated values');
                    process.exit(1);
                }
                planning = [];
                for (d of days) {
                    if (d == '') {
                        planning.push(null);
                    } else {
                        const hm = d.split(':')
                        planning.push([ Number.parseInt(hm[0]), Number.parseInt(hm[1]) ])
                    }
                }
                otherArgs = [ planning ];
            }
            const response = await client[command].apply(client, otherArgs);

            console.log(JSON.stringify({ ok: true, mode, command, response }, null, 2));
        }
    }
}

run()
    .then((_) => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error); //JSON.stringify({ ok: false, error: error.message }, null, 2));
        process.exit(1);
    });
