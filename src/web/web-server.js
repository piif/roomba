#!/usr/bin/env node

const path = require('path');
const express = require('express');
const { createRobotClient } = require('../app/robotService');

function parseArgs(argv) {
    const options = {
        mode: 'real',
        lang: 'en',
        port: 3000
    };

    argv.slice(2).forEach((arg) => {
        if (arg.startsWith('--mode=')) {
            options.mode = arg.split('=')[1];
        } else if (arg.startsWith('--lang=')) {
            options.lang = arg.split('=')[1];
        } else if (arg.startsWith('--port=')) {
            options.port = Number.parseInt(arg.split('=')[1], 10);
        }
    });

    return options;
}

function validateOptions(options) {
    if (!['real', 'mock'].includes(options.mode)) {
        throw new Error('Invalid mode. Expected --mode=real or --mode=mock.');
    }

    if (!['en', 'fr'].includes(options.lang)) {
        throw new Error('Invalid language. Expected --lang=en or --lang=fr.');
    }

    if (Number.isNaN(options.port) || options.port <= 0) {
        throw new Error('Invalid port. Expected --port=<positive integer>.');
    }
}

function serializeError(error) {
    if (error && error.message) {
        return error.message;
    }
    return 'Unknown error';
}

async function main() {
    const options = parseArgs(process.argv);
    validateOptions(options);

    const robot = createRobotClient(options.mode);

    const app = express();
    const publicDir = path.join(__dirname, 'public');

    app.use(express.json());
    app.use(express.static(publicDir));

    app.get('/', (_req, res) => {
        res.sendFile(path.join(publicDir, 'index.html'));
    });

    app.get('/app-config.js', (_req, res) => {
        res.type('application/javascript');
        res.send(`window.APP_CONFIG = ${JSON.stringify({ lang: options.lang })};`);
    });

    app.get('/api/status', async (_req, res) => {
        try {
            const [config, status] = await Promise.all([robot.config(), robot.status()]);
            res.json({ config, status });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.post('/api/actions/clean', async (_req, res) => {
        try {
            const response = await robot.clean();
            res.json({ ok: true, response });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.post('/api/actions/stop', async (_req, res) => {
        try {
            const response = await robot.stop();
            res.json({ ok: true, response });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.post('/api/actions/dock', async (_req, res) => {
        try {
            const response = await robot.dock();
            res.json({ ok: true, response });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.get('/api/planning', async (_req, res) => {
        try {
            const planning = await robot.planning();
            res.json({ planning });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.put('/api/planning', async (req, res) => {
        try {
            const planning = req.body && req.body.planning;
            const updatedPlanning = await robot.planning(planning);
            res.json({ planning: updatedPlanning });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.get('/api/details', async (_req, res) => {
        try {
            const details = await robot.config();
            res.json({ details });
        } catch (error) {
            res.status(500).json({ error: serializeError(error) });
        }
    });

    app.listen(options.port, () => {
        console.log(`Roomba web server listening on http://localhost:${options.port} (mode=${options.mode}, lang=${options.lang})`);
    });
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
