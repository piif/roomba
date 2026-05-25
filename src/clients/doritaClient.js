const dorita980 = require('dorita980');
const { filterProperties } = require('../lib/tools');

const { RobotClient } = require('./robotClient');

class DoritaClient extends RobotClient {
    constructor(config) {
        super();
        this.local = new dorita980.Local(config.blid, config.password, config.ip);
    }

    getRobotProperties(properties) {
        if (!properties) {
            return this.local.getPreferences();
        };
        return this.local.getRobotState(properties)
            .then((state) => filterProperties(state, properties));
    }
    setRobotProperties(properties) {
        return this.local.setPreferences(properties);
    }

    start() {
        return this.local.start();
    }

    stop() {
        return this.local.stop();
    }

    clean() {
        // TODO: if error status, or already in "cleaning" state, refuse
        // TODO: if not started, send "start" until status updated
        return this.local.clean();
    }

    dock() {
        // TODO: if error status, or already at dock, refuse
        // TODO: check if we have to "stop" before sending "dock" order ?
        return this.local.dock();
    }

    on(eventName, handler) {
        this.local.on(eventName, handler);
        return this;
    }

    off(eventName, handler) {
        this.local.off(eventName, handler);
        return this;
    }
}

module.exports = {
    DoritaClient
};
