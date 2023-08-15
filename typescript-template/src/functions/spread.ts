import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types"
import crack from "functions/crack"
import scanServers from "functions/scanServers"
import netNodeFromStrings from "functions/netNodesFromStrings"

/**
 * 
 * @param {NS} ns 
 * @param {number | undefined} maxDepth 
 * @returns {Promise<boolean>} true if new data is different from old data
 */
export async function spread(ns: NS, maxDepth: number): Promise<boolean> {
  const hostnameArr = scanServers(ns, maxDepth)
  await crack(ns, [...hostnameArr])
  // if (ns.getHostname() === "home") {
  const nodesArr = netNodeFromStrings(ns, hostnameArr)
  return makeFile(ns, nodesArr, "nodes.txt")
  // }
  // else return false
}

/**
 *  
 * @param {NS} ns
 * @param {SERVER_NET_NODE} arr 
 * @param {string} filename 
 * @returns {boolean}
 */
function makeFile(ns: NS, arr: SERVER_NET_NODE[], filename = "nodes.txt"): boolean {
  const hostname = ns.getHostname()
  if (ns.fileExists(filename), "home") {
    if (hostname !== "home") {
      ns.scp(filename, hostname, "home")
    }
    const oldData: SERVER_NET_NODE[] = JSON.parse(ns.read(filename))
    let changed = false
    for (let i = 0; i < arr.length; i++) {
      if (
        oldData !== undefined
        && (
          arr[i]?.hasAdminRights !== oldData[i]?.hasAdminRights
          || arr[i]?.backdoorInstalled !== oldData[i]?.backdoorInstalled
          || arr[i]?.openPortCount !== oldData[i]?.openPortCount
        )
      ) { changed = true }
    }

    if (!changed) {
      return false
    }
  }
  ns.write(filename, JSON.stringify(arr), 'w')
  if (hostname !== "home") {
    ns.scp(filename, "home", hostname)
  }
  return true
}