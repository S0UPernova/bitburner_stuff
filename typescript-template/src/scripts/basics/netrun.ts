import { NS, ScriptArg } from "@ns"
import { node } from "/Types"
/** @param {NS} ns */
// import money from "money.js"
export async function main(ns: NS) {

  // todo get this interface working for the flags
  interface params {
    script: { [key: string]: ScriptArg | string[] },
    runOn: { [key: string]: ScriptArg | string[] },
    top: {[key: string]: ScriptArg | string[]},
    killRunning: {[key: string]: ScriptArg | string[]},
    scriptArgs: {[key: string]: ScriptArg | string[]}
  }

  const { one, two, three, four, five } = ns.flags([["script", "hack.js"], ["runOn", ""], ["top", 0], ["killRunning", false], ["scriptArgs", ""]])
  const script = one as string
  const runOn = two as string
  const top = three as number
  const killRunning = four as boolean
  const scriptArgs = five as ScriptArg | string[]


  
  if (typeof script !== "string" || typeof runOn !== "string" || typeof killRunning !== "boolean" || typeof scriptArgs === "number" && typeof scriptArgs === "boolean") return;
  ns.print('flags: ', top)
  ns.print("args: ", ns.args)
  /**
 * @typedef node
 * @type {object}
 * @property {string} host - the hostname
 * @property {string[] | undefined | []} connections - list of hostnames this machine is connected to.
 * @property {boolean} backdoorInstalled - boolean for if a backdoor is installed.
 * @property {boolean} root - boolean for if you have admin on this node.
 */

  // const [script, runON = "", ...scriptArgs] = ns.args
  const home = "home"
  // const host = runON

  function condition(): boolean {
    return (
      Array.isArray(scriptArgs) && scriptArgs.length > 0 
      || typeof scriptArgs === "string" && scriptArgs.length > 0 
      || typeof scriptArgs === "boolean" 
      || typeof scriptArgs === "number"
    )
  }

  function runScript(script: string, target: string, params: ScriptArg | string[]) {
    if (target !== home) {
      ns.scp(script, target)
    }
    if (killRunning) {
      ns.scriptKill(script, target)
    }
    const ramAvailable = (ns.getServerMaxRam(target) - ns.getServerUsedRam(target))
    const ramRequired = ns.getScriptRam(script, target)
    if (ramAvailable < ramRequired) return
    const threads = Math.floor(ramAvailable / ramRequired)
    if (threads === Infinity) return
    if (threads === 0) return
    if (Array.isArray(params)) {
      ns.exec(script, target, threads, ...params.slice())
    }
    else {
      ns.exec(script, target, threads, params)
    }
  }

  const fileName = "nodes.txt"
  if (!script) {
    ns.tprint(`missing script, arguments are: (script: string, runOnHome(run on self targeting network), arguments?: ...args<string>)`)
    return
  }

  ns.print(`script: ${script} args: ${scriptArgs}`)

  /**
   * @typedef NodeType
   * @property {string[]} connections
   * @typedef {Server & NodeType} Node
   */
  /**
   * @type {Node[]}
   */
  let nodes: node[] = JSON.parse(ns.read(fileName)).filter((node: node) => node.hostname !== home)
  if (typeof top !== "number") return
  if (top > 0) (
    nodes.sort((a: node, b: node) => {
      if (a?.moneyMax && b?.moneyMax) {
        return b.moneyMax - a.moneyMax
      }
      else return 0
    })//.slice(0, top)
  )

  /** @type node[] */
  const globals = nodes.filter(node => {
    return node.backdoorInstalled
  })
  ns.print("nodes", nodes)
  ns.print("globals", globals)

  if (runOn?.length > 0) {
    const temp: string[] = []

    nodes.filter(
      (node: node) => {
        if (node?.hasAdminRights && node.requiredHackingSkill && node.requiredHackingSkill <= ns.getHackingLevel()) return true
        else if (node?.hasAdminRights && node.requiredHackingSkill === undefined) return true
        else return false
        // (
        //   node.hasAdminRights
        //   && node.requiredHackingSkill <= ns.getHackingLevel()
        // )
      }
    )
      .slice(0, top > 0 ? top : nodes.length).forEach(node => {
        temp.push(node.hostname)
      })
    if (condition()) {
      runScript(script, runOn, scriptArgs)

    }
    else {

      runScript(script, runOn, temp)
    }
  }
  else {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node.connections) continue
      const connections = node.connections.filter(connection => connection !== home).filter(connection => connection.hasAdminRights)

      ns.print(`host: ${node.hostname}, connections: ${connections}`)

      if (scriptArgs.length > 0) {
        ns.print("scriptArgs: ", scriptArgs)
        await ns.sleep(100).then(() => {
          runScript(script, node.hostname, scriptArgs)
        })

      }
      else {
        await ns.sleep(100).then(() => {
          let temp = []
          connections.forEach(connection => temp.push(connection.hostname))
          globals.forEach(global => temp.push(global.hostname))
          if (top > 0) {
            temp = temp
              .sort((a, b) => (ns.getServer(b).moneyMax) - (ns.getServer(a).moneyMax))
              .slice(0, top > 0 ? top : nodes.length)
          }
          runScript(script, node.hostname, temp)
        })
      }
    }

  }
}