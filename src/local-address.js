import os from "node:os";

// Loopback is local by definition (RFC 1122 section 3.2.1.3, RFC 4291 section 2.5.3), so answer
// without consulting interface enumeration: where enumeration is unavailable the lookup below
// throws and the catch would wrongly report loopback as absent. Atlas adaptation - upstream
// enumerates unconditionally; this only differs where enumeration throws, from wrong to right.
// Every other host keeps the fail-closed answer, which stays load-bearing: a recovery signal for
// an address that never came back would restart the server on every CLI invocation.
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1"]);

export function isLocalAddressPresent(host) {
  if (typeof host !== "string" || host === "") return false;
  if (LOOPBACK_HOSTS.has(host)) return true;
  try {
    for (const entries of Object.values(os.networkInterfaces() || {})) {
      for (const entry of entries || []) {
        if (entry?.address === host) return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}
