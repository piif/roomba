const { MockClient } = require('../clients/mockClient');
const { resolveConfig } = require('../config/loadConfig');

function createRobotClient(mode) {
    if (mode === 'mock') {
        return new MockClient();
    }

    const { DoritaClient } = require('../clients/doritaClient');

    const config = resolveConfig();
    if (!config) {
        throw new Error(
            'Missing robot config. Provide config/config.json or ROOMBA_BLID/ROOMBA_PASSWORD/ROOMBA_IP env vars.'
        );
    }

    return new DoritaClient(config);
}

module.exports = {
    createRobotClient
};
