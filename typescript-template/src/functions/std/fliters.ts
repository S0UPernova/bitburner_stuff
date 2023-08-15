import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types"

export function hackable(ns: NS, servers: SERVER_NET_NODE[]): SERVER_NET_NODE[] {
  return servers.filter((node: SERVER_NET_NODE) => { return node?.requiredHackingSkill ? node.requiredHackingSkill < ns.getHackingLevel() : false })
}