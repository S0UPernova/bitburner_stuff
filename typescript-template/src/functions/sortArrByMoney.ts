import { NS, Server } from "/../NetscriptDefinitions"
import node from "/types"

export default function money(ns: NS, limit: number, servers: node[]): string[] {

  servers.filter((node: node) => { return node?.requiredHackingSkill ? node.requiredHackingSkill < ns.getHackingLevel() : false })
    .sort((a: node, b: node): number => {
      if (!a?.moneyMax || !b?.moneyMax) {
        return 0
      }
      return b.moneyMax - a.moneyMax
    })

  const arr: string[] = []
  servers.forEach(server => arr.push(server.hostname))
  if (limit > 0) {
    return arr.slice(0, limit)
  }
  else {
    return arr.slice()

  }
}