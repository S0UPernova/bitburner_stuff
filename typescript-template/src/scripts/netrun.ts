import { NS, ScriptArg, Server } from "@ns"
import { netNodeFromString, netNodesFromStrings } from "/functions/netNodesFromStrings";
import scanServers from "/functions/scanServers";
import { sortFromHostnames } from "/functions/std/sorts";
import { SERVER_NET_NODE } from "/Types"

/** @param {NS} ns */
export async function main(ns: NS) {
  // // replace with flags
  const maxDepth = 1000
  const hackingLevel = ns.getHackingLevel()
  const { script, runOn, top, killRunning, scriptArgs, threads, deps } = ns.flags([
    ["script", "hack.js"],
    ["runOn", ""], ["top", 0],
    ["killRunning", false],
    ["scriptArgs", ""],
    ["threads", 0],
    ["deps", ""]
  ])
  if (typeof script !== "string" || typeof runOn !== "string" || typeof killRunning !== "boolean" || typeof threads !== "number" || typeof deps !== "string" || typeof top !== "number") return;

  const nodes: SERVER_NET_NODE[] = netNodesFromStrings(ns, scanServers(ns, maxDepth))
    .filter((server: SERVER_NET_NODE) => server.hasAdminRights)
  const globalTargets: SERVER_NET_NODE[] = nodes.filter(node => filterFunction(node, hackingLevel))
  if (runOn?.length === 0) {
    ns.print("not using runOn.")
    nodes.forEach((node: SERVER_NET_NODE) => {
      const targets: string[] = [...ns.scan(node.hostname).filter(connection => filterFunction(netNodeFromString(ns, connection), hackingLevel))]
      globalTargets.forEach(t => targets.push(t.hostname))
      if (top > 0) {
        sortFromHostnames(ns, targets)
      }
      if (scriptArgs) {
        runScript(ns, script, node.hostname, !Number.isNaN(threads) ? Number(threads) : 0, scriptArgs, killRunning, deps)
      }
      else {
        runScript(ns, script, node.hostname, !Number.isNaN(threads) ? Number(threads) : 0, targets.slice(0, (top) > 0 ? top : targets.length), killRunning, deps)
      }

    })
  }
  else if (runOn?.length > 0) {
    ns.print("using runOn.")
    const targets: string[] = [...ns.scan(runOn).filter(connection => filterFunction(netNodeFromString(ns, connection), hackingLevel))]
    globalTargets.forEach(t => targets.push(t.hostname))
    if (top > 0) {
      sortFromHostnames(ns, targets)
    }
    if (scriptArgs) {
      runScript(ns, script, runOn, !Number.isNaN(threads) ? Number(threads) : 0, scriptArgs, killRunning, deps)
    }
    else {
      runScript(ns, script, runOn, !Number.isNaN(threads) ? Number(threads) : 0, targets.slice(0, (top) > 0 ? top : targets.length), killRunning, deps)
    }
  }
}

/**
 * @param {NS} ns
 * @param {string} script 
 * @param {string} target 
 * @param {number} threadsNum - int if non positive it will take up as much as it can
 * @param {ScriptArg | string[]} params 
 * @returns 
 */
function runScript(ns: NS, script: string, target: string, threadsNum: number, params?: ScriptArg | string[], killRunning?: boolean, deps?: string) {
  if (target !== "home") {
    ns.scp(script, target)
    if (deps) {
      const depList = deps.toString().split(", ")
      ns.scp(depList, target)
    }
  }
  if (killRunning) {
    ns.scriptKill(script, target)
  }
  const ramAvailable = (ns.getServerMaxRam(target) - ns.getServerUsedRam(target))
  const ramRequired = ns.getScriptRam(script, target)
  if (ramAvailable < ramRequired) return
  const maxThreads = threadsNum > 0 ? threadsNum : Math.floor(ramAvailable / ramRequired)
  if (maxThreads === Infinity) return
  if (maxThreads === 0) return
  if (Number.isNaN(maxThreads)) return
  if (Array.isArray(params)) {
    ns.exec(script, target, maxThreads, ...params.slice())
  }
  else if (params) {
    ns.exec(script, target, maxThreads, params)
  }
  else {
    ns.exec(script, target, maxThreads)

  }
}

/**
 * Filters nodes to only allow nodes that are hackable
 * @param {SERVER_NET_NODE} target 
 * @param {number} hackingLevel 
 * @returns {boolean}
 */
function filterFunction(target: SERVER_NET_NODE, hackingLevel: number): boolean {
  if (
    !target.purchasedByPlayer
    && target.hostname !== "home"
    && target.backdoorInstalled
    && target?.requiredHackingSkill
    && target.requiredHackingSkill <= hackingLevel
    && target?.moneyMax
    && target.moneyMax > 0
  ) {
    return true
  }
  else {
    return false
  }
}