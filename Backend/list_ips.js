import os from 'os';

const interfaces = os.networkInterfaces();
console.log("--- INTERFACES ---");
Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`Name: ${name} | IP: ${iface.address}`);
        }
    });
});
console.log("--- END ---");
