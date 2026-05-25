const EventEmitter = require('events');
const { machine } = require('os');
const { intToIP, unhex } = require('../lib/tools');

class RobotClient extends EventEmitter {

    getRobotProperties(properties) {
        throw new Error('RobotClient.getRobotProperties must be implemented by subclass');
    }
    setRobotProperties(properties) {
        throw new Error('RobotClient.setRobotProperties must be implemented by subclass');
    }

    convertFromScheduleFormat(apiSchedule) {
        console.log("convertFromScheduleFormat", apiSchedule);
        if (!apiSchedule || !apiSchedule.cycle || !apiSchedule.h || !apiSchedule.m) {
            return null;
        }

        return apiSchedule.cycle.map((cycle, index) => {
            if (cycle === 'none') {
                return null;
            }
            return [apiSchedule.h[index], apiSchedule.m[index]];
        });
    }

    convertToScheduleFormat(userSchedule) {
        if (!Array.isArray(userSchedule) || userSchedule.length !== 7) {
            return null;
        }

        const result = {
            cycle: [],
            h: [],
            m: []
        };

        userSchedule.forEach((entry) => {
        if (entry === null) {
            result.cycle.push('none');
            result.h.push(0);
            result.m.push(0);
            return;
        }

        if (Array.isArray(entry) && entry.length === 2) {
            result.cycle.push('start');
            result.h.push(entry[0]);
            result.m.push(entry[1]);
        }
        });

        return result;
    }

    config() {
        return this.getRobotProperties([
            'netinfo', 'wlcfg', 'mac', 'name', 'batInfo',
            'sku', 'timezone', 'wifiSwVer', 'softwareVer', 'mobilityVer',
            'bootloaderVer', 'soundVer', 'batteryType'
        ]).then((rawInfo) => {
            return {
                name: rawInfo.name,
                mac: rawInfo.mac,
                IP: intToIP(rawInfo.netinfo.addr),
                wifi: unhex(rawInfo.wlcfg.ssid),
                sku: rawInfo.sku,
                battery: {
                    name: rawInfo.batInfo.mName,
                    type: rawInfo.batteryType
                },
                versions: {
                    mobilityVer: rawInfo.mobilityVer,
                    bootloaderVer: rawInfo.bootloaderVer,
                    soundVer: rawInfo.soundVer,
                    wifiSwVer: rawInfo.wifiSwVer,
                    softwareVer: rawInfo.softwareVer
                }
            };
        });
    }

    status() {
        return this.getRobotProperties([
            'cleanMissionStatus', 'bin', 'batPct'
        ]).then((rawInfo) => {
            var status, mission;
            if (rawInfo.cleanMissionStatus.error == 0) {
                if (rawInfo.cleanMissionStatus.notReady != 0) {
                    status = "NotReady";
                } else {
                    status = "Ready";
                }
            } else {
                status = `Error ${rawInfo.cleanMissionStatus.error}`
            }
            if (rawInfo.cleanMissionStatus.cycle == "none") {
                mission = "none";
            } else {
                mission = `${rawInfo.cleanMissionStatus.cycle}:${rawInfo.cleanMissionStatus.phase}`
            }
            return {
                status,
                mission,
                battery: {
                    charging: (rawInfo.cleanMissionStatus.phase == 'charge'),
                    percent: rawInfo.batPct
                },
                bin: {
                    present: rawInfo.bin.present,
                    full: rawInfo.bin.full
                }
            };
        });
    }

    planning(newPlanning = null) {
        if (newPlanning) {
            // TODO : set planning from array
            const rawPlanning = this.convertToScheduleFormat(newPlanning);
            console.log("rawPlanning=",newPlanning, "=>", rawPlanning);
            return this.setRobotProperties({cleanSchedule: rawPlanning})
                .then((state) => {
                    console.log("then", state)
                    return this.getRobotProperties(['cleanSchedule'])
                        .then((rawPlanning) => {
                            console.log("then2", state)
                            return this.convertFromScheduleFormat(rawPlanning.cleanSchedule)
                        });
                });
        }
        return this.getRobotProperties(['cleanSchedule'])
            .then((rawPlanning) => this.convertFromScheduleFormat(rawPlanning.cleanSchedule));
    }
}

module.exports = {
  RobotClient
};
