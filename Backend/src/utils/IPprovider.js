// utils/network.js
import os from "os";

export async function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // Storage for candidates
  let hotspotIP = null;
  let preferredIP = null;
  let firstIPv4 = null;

  for (const ifaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[ifaceName]) {
      // Must be IPv4 and not internal
      if (iface.family === "IPv4" && !iface.internal) {

        const ip = iface.address;

        // 1. STRICT PRIORITY: Windows Hotspot Default IP Range (192.168.137.x)
        if (ip.startsWith("192.168.137.")) {
          console.log("🔥 Found Hotspot IP:", ip);
          return ip; // Return immediately if found, this is the one we want.
        }

        // 2. Hotspot Adapter by Name (secondary check)
        if (ifaceName.includes("Local Area Connection") && !hotspotIP) {
          hotspotIP = ip;
        }

        // 3. Preferred LAN (exclude VirtualBox/VMware usually 192.168.56.x)
        if (!preferredIP && !ip.startsWith("192.168.56.")) {
          if (ip.startsWith("192.168.") || ip.startsWith("10.")) {
            preferredIP = ip;
          }
        }

        if (!firstIPv4) firstIPv4 = ip;
      }
    }
  }

  // Priority Return
  return hotspotIP || preferredIP || firstIPv4 || "127.0.0.1";
}
