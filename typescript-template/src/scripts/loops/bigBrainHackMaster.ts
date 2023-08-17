import { NS } from "@ns"
import { netNodesFromStrings } from "/functions/netNodesFromStrings"
import scanServers from "/functions/scanServers"
import { hackable } from "/functions/std/fliters"
import { sortFromNetNodes } from "/functions/std/sorts"
import { SERVER_NET_NODE } from "/Types"

interface ratio {
  weaken: number
  grow: number
  hack: number
}
const hackScript = "scripts/basics/hack.js"
const weakenScript = "scripts/basics/weaken.js"
const growScript = "scripts/basics/grow.js"
const messagePort = 5500
export function main(ns: NS) {
  const ratio = {
    weaken: 35,
    grow: 60,
    hack: 5
  }
  const targets = netNodesFromStrings(ns, scanServers(ns, 1000))
    .filter(node => hackable(node, ns.getHackingLevel()))

  sortFromNetNodes(ns, targets)

  targets.forEach((target: SERVER_NET_NODE, i: number) => {
    // todo refactor to all use the same port for all and filter it later
    loopThroughNodes(ns, target.hostname, messagePort, ratio)
  })
}

function loopThroughNodes(ns: NS, target: string, responsePort: number, ratio: ratio): ratio {
  const ratioUsed = {
    weaken: 0,
    grow: 0,
    hack: 0
  }
  const nodes = netNodesFromStrings(ns, scanServers(ns, 1000))
  nodes.forEach(node => {
    let weakenReq = ratio.weaken - ratioUsed.weaken
    let growReq = ratio.grow - ratioUsed.grow
    let hackReq = ratio.hack - ratioUsed.hack

    if (weakenReq > 0) {
      const threadsUsed = callScript(ns, node.hostname, target, weakenScript, weakenReq, responsePort)
      weakenReq -= threadsUsed
      ratioUsed.weaken += threadsUsed
    }
    else if (growReq > 0) {
      const threadsUsed = callScript(ns, node.hostname, target, growScript, growReq, responsePort)
      growReq -= threadsUsed
      ratioUsed.grow += threadsUsed
    }
    if (hackReq > 0) {
      const threadsUsed = callScript(ns, node.hostname, target, hackScript, hackReq, responsePort)
      hackReq -= threadsUsed
      ratioUsed.hack += threadsUsed
    }
  })

  return ratioUsed
}

function callScript(ns: NS, hostname: string, target: string, script: string, remainingThreadRequirement: number, responsePort: number): number {
  ns.scp(script, target, "home")
  const ramAvailable = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
  const ramRequired = ns.getScriptRam(script, hostname)
  if (ramAvailable < ramRequired || ramAvailable === 0 || ramRequired === 0) return 0
  const maxThreads = Math.floor(ramAvailable / ramRequired)
  const threads = Math.min(maxThreads, remainingThreadRequirement)
  ns.exec(script, hostname, threads, target, hostname, responsePort)
  return threads
}