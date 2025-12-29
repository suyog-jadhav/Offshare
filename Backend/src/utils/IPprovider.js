// utils/network.js
import os from "os";

export async function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const ifaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[ifaceName]) {
      // IPv4 & not internal (not 127.0.0.1)
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  // fallback
  return "127.0.0.1";
}
