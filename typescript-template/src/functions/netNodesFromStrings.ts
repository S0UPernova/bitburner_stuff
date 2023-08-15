import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types";

export default function netNodeFromStrings(ns: NS, hostnameOrNames: string | string[]): SERVER_NET_NODE[] {
  const nodesArr = []
  for (let i = 0; i < hostnameOrNames.length; i++) {
    if (hostnameOrNames[i] === 'home') continue
    const server: SERVER_NET_NODE = ns.getServer(hostnameOrNames[i])
    server.connections = ns.scan(server.hostname)
    nodesArr.push(server)
  }
  return nodesArr
}