#!/usr/bin/env node

const { createRobotClient } = require('../app/robotService');
const { deepEquals } = require('../lib/tools');

const allowedCommands = [
    'start', 'stop', 'clean', 'dock',
    'config', 'status', 'all',
    'watch', 'planning'
];

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
        'Usage: node src/cli/robot-cli.js [--mode=real|mock] <start|stop|clean|dock|config|status|all|watch|planning [ "hh:mm,hh:mm,..." ]>'
    );
}

async function runCommand(client, mode, command, otherArgs) {
    if (command === 'watch') {
        var lastEvents = {};
        client
            .on('mission', (data) => {
                if (lastEvents.hasOwnProperty('mission')
                    && deepEquals(lastEvents.mission, data)) {
                    data = null;
                } else {
                    lastEvents.mission = data;
                }
                console.log(JSON.stringify({ event: 'mission', data }, null, 2));
            })
            .on('update', (data) => {
                if (lastEvents.hasOwnProperty('update')
                    && deepEquals(lastEvents.update, data)) {
                    data = null;
                } else {
                    lastEvents.update = data;
                }
                console.log(JSON.stringify({ event: 'update', data }, null, 2));
            });

        console.log(JSON.stringify({ ok: true, mode, command: 'watch', info: 'Watching events. Press Ctrl+C to stop.' }));

        if (mode === 'mock') {
            setInterval(() => {
                client.emitMission().catch((error) => {
                    console.error(error.message);
                });
            }, 1000);
        }
        return undefined;

    } else {

        if (command === 'planning' && otherArgs.length != 0) {
            const days = otherArgs[0].split(',');
            if (days.length != 7) {
                console.error('Invalid planning : expected 7 comma separated values');
                return 1;
            }
            const planning = days.map(
                (d) => (
                    d=='' ? null : d.split(':').map(
                        (n)=>Number.parseInt(n)
                    )
                )
            );
            otherArgs = [ planning ];
        }
        const response = await client[command].apply(client, otherArgs);

        console.log(JSON.stringify({ ok: true, mode, command, response }, null, 2));

        return 0;
    }
}

async function run() {
    var { mode, commands, otherArgs } = parseArgs(process.argv);

    if (commands.length == 0) {
        printUsage();
        return 1;
    }

    if (!['real', 'mock'].includes(mode)) {
        console.error('Invalid mode. Expected --mode=real or --mode=mock.');
        return 1;
    }

    const client = createRobotClient(mode);

    for (command of commands) {
        status = await runCommand(client, mode, command, otherArgs);
        if (status !== 0) {
            return status; // error or "wait forever"
        }
    }
    return 0;
}

run()
    .then((status) => {
        if (status !== undefined) {
            process.exit(status);
        }
        // else, background tasks will continue until Ctrl-C
    })
    .catch((error) => {
        console.error(error); //JSON.stringify({ ok: false, error: error.message }, null, 2));
        process.exit(1);
    });
