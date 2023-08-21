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
  /** integer greater than 0 */
  const numberOfServersToAttack: number = 5
  ns.disableLog("ALL")


  const targets: SERVER_NET_NODE[] = netNodesFromStrings(ns, scanServers(ns, 1000))
    .filter(node => hackable(node, ns.getHackingLevel()))
  sortFromNetNodes(ns, targets, "money")

  const nodes = netNodesFromStrings(ns, scanServers(ns, 1000))
  sortFromNetNodes(ns, nodes, "ram")
  let threadsAvailable = 0
  nodes.forEach(node => {
    threadsAvailable += calcThreads(ns, node.hostname, weakenScript)
  })
  const fraction: number = Math.round((threadsAvailable / 100) / numberOfServersToAttack)
  const ratio = {
    weaken: Math.floor(fraction * 30),
    grow: Math.floor(fraction * 65),
    hack: Math.floor(fraction * 5)
  }
  targets.forEach((target: SERVER_NET_NODE, i: number) => {

    // todo refactor to all use the same port for all and filter it later
    loopThroughNodes(ns, nodes, target.hostname, messagePort, ratio)
  })
}


function loopThroughNodes(ns: NS, nodes: SERVER_NET_NODE[], target: string, responsePort: number, ratio: ratio): ratio {
  const ratioUsed = {
    weaken: 0,
    grow: 0,
    hack: 0
  }
  nodes.filter(node => node.hasAdminRights).forEach(node => {
    let weakenReq = ratio.weaken - ratioUsed.weaken
    let growReq = ratio.grow - ratioUsed.grow
    let hackReq = ratio.hack - ratioUsed.hack
    ns.print("hostname: ", node.hostname)
    if (weakenReq > 0) {
      const threadsUsed = callScript(ns, node.hostname, target, weakenScript, weakenReq, responsePort)
      weakenReq -= threadsUsed
      ratioUsed.weaken += threadsUsed
    }
    if (growReq > 0) {
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
  ns.scp(script, hostname, "home")
  const maxThreads = calcThreads(ns, hostname, script)
  const threads = Math.min(maxThreads, remainingThreadRequirement)
  if (threads > 0) {
    ns.exec(script, hostname, threads, target, hostname, responsePort)
    return threads
  }
  return 0
}

function calcThreads(ns: NS, hostname: string, script: string) {
  const ramAvailable = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
  const ramRequired = ns.getScriptRam(script, hostname)
  if (ramAvailable < ramRequired || ramAvailable === 0 || ramRequired === 0) return 0
  const threads = Math.floor(ramAvailable / ramRequired)
  return threads
}