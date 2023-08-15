import { NS, Server } from "/../NetscriptDefinitions"
import { hackable } from "./std/fliters"
import { SERVER_NET_NODE } from "@types"
export default function money(ns: NS, serverList: SERVER_NET_NODE[], limit: number = 0): string[] {
  const servers = hackable(ns, serverList)
    .sort((a: SERVER_NET_NODE, b: SERVER_NET_NODE): number => {
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