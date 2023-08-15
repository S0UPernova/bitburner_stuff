import { NS, ScriptArg } from "@ns"
import { SERVER_NET_NODE } from "/Types"
/** @param {NS} ns */
// import money from "money.js"
export async function main(ns: NS) {
  const { script, runOn, top, killRunning, scriptArgs, threads, deps } = ns.flags([["script", "hack.js"], ["runOn", ""], ["top", 0], ["killRunning", false], ["scriptArgs", ""], ["threads", 0], ["deps", ""]])

  if (typeof script !== "string" || typeof runOn !== "string" || typeof killRunning !== "boolean" || typeof threads !== "number" || typeof deps !== "string") return;
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

  function runScript(script: string, target: string, threadsNum: number, params: ScriptArg | string[]) {
    if (target !== home) {
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
    const threadCount = threadsNum > 0 ? threadsNum : Math.floor(ramAvailable / ramRequired)
    if (threadCount === Infinity) return
    if (threadCount === 0) return
    if (Array.isArray(params)) {
      ns.exec(script, target, threadCount, ...params.slice())
    }
    else {
      ns.exec(script, target, threadCount, params)
    }
  }

  const fileName = "nodes.txt"
  if (!script) {
    ns.tprint(`missing script, arguments are: (script: string, runOnHome(run on self targeting network), arguments?: ...args<string>)`)
    return
  }

  ns.print(`script: ${script} args: ${scriptArgs}`)

  let nodes: SERVER_NET_NODE[] = JSON.parse(ns.read(fileName)).filter((node: SERVER_NET_NODE) => node.hostname !== home)
  if (typeof top !== "number") return
  // if (top > 0) (
  //   nodes.sort((a: SERVER_NET_NODE, b: SERVER_NET_NODE) => {
  //     if (a?.moneyMax && b?.moneyMax) {
  //       return b.moneyMax - a.moneyMax
  //     }
  //     else return 0
  //   })//.slice(0, top)
  // )

  const globals: SERVER_NET_NODE[] = nodes.filter(node => {
    return (node.backdoorInstalled && !node.purchasedByPlayer)
  })
  ns.print("nodes", nodes)
  ns.print("globals", globals)

  if (runOn?.length > 0) {
    const temp: string[] = []

    nodes.filter((node: SERVER_NET_NODE) => {
      if (node?.hasAdminRights && node.requiredHackingSkill && node.requiredHackingSkill <= ns.getHackingLevel()) return true
      else if (node?.hasAdminRights && node.requiredHackingSkill === undefined) return true
      else return false
    })
      .slice(0, top > 0 ? top : nodes.length).forEach(node => {
        temp.push(node.hostname)
      })
    if (top > 0) {
      srt(ns, temp)
    }
    if (condition()) {
      runScript(script, runOn, threads, scriptArgs)

    }
    else {

      runScript(script, runOn, threads, temp)
    }
  }
  else {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node.connections) continue
      const connections = node.connections.filter((connection) => (connection !== home && !ns.getServer(connection).purchasedByPlayer && ns.getServer(connection).hasAdminRights))

      ns.print(`host: ${node.hostname}, connections: ${connections}`)

      if (scriptArgs !== "" && scriptArgs !== undefined) {
        ns.print("scriptArgs: ", scriptArgs)
        await ns.sleep(100).then(() => {
          runScript(script, node.hostname, threads, scriptArgs)
        })

      }
      else {
        await ns.sleep(100).then(() => {
          let temp: string[] = []
          connections.forEach(connection => temp.push(connection))
          globals.filter(global => !global.purchasedByPlayer).forEach(global => temp.push(global.hostname))
          if (top > 0) {
            srt(ns, temp)
            temp = temp.slice(0, top > 0 ? top : temp.length)
          }
          runScript(script, node.hostname, threads, temp)
        })
      }
    }

  }
}

function srt(ns: NS, arr: string[]): void {
  arr.sort((a: string, b: string) => {
    const first = ns.getServer(a)
    const second = ns.getServer(b)
    if (first?.moneyMax && second?.moneyMax) {
      return second.moneyMax - first.moneyMax
    }
    else return 0
  })
}