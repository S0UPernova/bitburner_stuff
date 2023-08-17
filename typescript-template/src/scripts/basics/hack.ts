import { NS } from "@ns"
import { portActionMessages, SERVER_NET_NODE } from "/Types"

export async function main(ns: NS) {
  const target = ns.args[0] as string
  const hostname: string = ns.args[1] as string
  const responsePort = ns.args[2] as number

  if (typeof target !== "string" || typeof hostname !== "string" || typeof responsePort !== "number") {
    ns.tprint("Failure due to incorrect params. target: string, hostname: string responsePort: number")
    return
  }
  
  while (true) {
    const moneyEarned = await ns.hack(target)
    const response: portActionMessages = {
      action: "hack",
      result: moneyEarned,
      target: target,
      hostname: hostname
    }
    ns.writePort(responsePort, JSON.stringify(response))
  }
}