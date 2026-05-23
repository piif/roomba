// read robot configuration from environment variables, or thru config/config.json file

const fs = require('fs');
const path = require('path');

function readJsonIfExists(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

function resolveConfig(projectRoot = process.cwd()) {
    const envConfig = {
        blid: process.env.ROOMBA_BLID,
        password: process.env.ROOMBA_PASSWORD,
        ip: process.env.ROOMBA_IP
    };

    if (envConfig.blid && envConfig.password && envConfig.ip) {
        return envConfig;
    }

    const configPath = path.join(projectRoot, 'config', 'config.json');

    const fileConfig = readJsonIfExists(configPath);

    if (!fileConfig) {
        return null;
    }

    return {
        blid: fileConfig.blid,
        password: fileConfig.password,
        ip: fileConfig.ip
    };
}

module.exports = {
    resolveConfig
};
