import os from 'os';

const interfaces = os.networkInterfaces();
console.log("All Interfaces:");
console.log(JSON.stringify(interfaces, null, 2));

console.log("\nCurrent Detection Logic:");
for (const ifaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[ifaceName]) {
        console.log(`Checking ${ifaceName}: Family=${iface.family}, Internal=${iface.internal}, Addr=${iface.address}`);
        if (iface.family === "IPv4" && !iface.internal) {
            console.log("✅ MATCH FOUND: " + iface.address);
        }
    }
}
