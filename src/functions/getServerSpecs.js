const os = require('os');
const { networkInterfaces } = require('os');

const getLocalIp = () => {
    const nets = networkInterfaces();
    let localIp = 'Not available';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
            }
        }
    }
    return localIp;
};

const getServerSpecs = () => {
    const localIp = getLocalIp();

    return {
        hostname: os.hostname(),
        platform: os.platform(),
        osType: os.type(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        cpuModel: os.cpus()[0].model.trim(),
        totalMemory: `${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
        nodeVersion: process.version,
        processId: process.pid,
        localIp
    };
};

module.exports = getServerSpecs;