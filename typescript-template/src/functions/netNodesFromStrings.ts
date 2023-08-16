import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types";

export function netNodesFromStrings(ns: NS, hostnameOrNames: string | string[]): SERVER_NET_NODE[] {
  const nodesArr = []
  // for (let i = 0; i < hostnameOrNames.length; i++) {
  if (Array.isArray(hostnameOrNames)) {
    hostnameOrNames.forEach(hostname => {
      nodesArr.push(netNodeFromString(ns, hostname))
    })
  }
  else if (typeof hostnameOrNames === "string") {
    nodesArr.push(netNodeFromString(ns, hostnameOrNames))
  }
  // }
  return nodesArr
}
export function netNodeFromString(ns: NS, hostname: string): SERVER_NET_NODE {
  return {
    ...ns.getServer(hostname),
    connections: ns.scan(hostname)
  }
}