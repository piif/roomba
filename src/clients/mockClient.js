const { filterProperties, deepCopy } = require('../lib/tools');
const { RobotClient } = require('./robotClient');

class MockClient extends RobotClient {
    constructor() {
        super();
        this.state = {
            // static state
            netinfo: {
                dhcp: true,
                addr: 3232235788,
                mask: 4294967040,
                gw: 3232235777,
                dns1: 3232235777,
                dns2: 0,
                bssid: '11:22:33:44:55:66'
            },
            wifistat: { wifi: 1, uap: false, cloud: 6 },
            wlcfg: { sec: 7, ssid: '46616b6557696669' },
            mac: '77:88:99:AA:BB:CC',
            name: 'Roomba',
            batInfo: {
                mName: 'FakeBattery',
                mDate: '2020-01-01'
            },
            mobilityVer: '00',
            bootloaderVer: '10',
            soundVer: '20',
            batteryType: 'Dummy',
            sku: '12345',
            timezone: 'Europe/Paris',
            wifiSwVer: '30',
            softwareVer: '40',
            // state
            cleanMissionStatus: {
                cycle: 'none',
                phase: 'charge',
                error: 0,
                notReady: 0,
                mssnM: 0
            },
            batPct: 100,
            bin: {
                present: true,
                full: false
            },
            // planning
            cleanSchedule : {
                cycle: [
                    'none', 'start',
                    'start', 'start',
                    'start', 'start',
                    'none'
                ],
                h: [
                    9, 7, 7, 7,
                    7, 7, 9
                ],
                m: [
                    0, 15, 15, 15,
                    15, 15, 0
                ]
            }
        };
    }

    getRobotProperties(properties) {
        if (!properties) {
            return Promise.resolve(this.state);
        };
        return Promise.resolve(
            filterProperties(this.state, properties)
        );
    }

    setRobotProperties(properties) {
        return Promise.resolve(
            this.deepCopy(this.state, properties)
        );
    }
  
    start() {
        this.state.cleanMissionStatus.cycle = 'clean';
        this.state.cleanMissionStatus.phase = 'run';
        this.emitMission();
        return Promise.resolve({ ok: true, action: 'start' });
    }
  
    stop() {
        this.state.cleanMissionStatus.phase = 'stop';
        this.emitMission();
        return Promise.resolve({ ok: true, action: 'stop' });
    }
  
    clean() {
        return this.start();
    }
  
    dock() {
      this.state.cleanMissionStatus.phase = 'hmUsrDock';
      this.emitMission();
      return Promise.resolve({ ok: true, action: 'dock' });
    }
  
    emitMission() {
        this.emit('mission', this.state);
    
        this.emit('update', {
            state: {
                reported: this.state
            }
        });
    }
}

module.exports = {
    MockClient
};
