/** @param {NS} ns */
// import money from "money.js"
export async function main(ns) {
  // function money(ns, limit, servers) {
  //   servers.filter(node => { return node.requiredHackingSkill < ns.getHackingLevel() })
  //     .sort((a, b) => b.moneyMax - a.moneyMax)
  //   const arr = []
  //   servers.forEach(server => arr.push(server.hostname))
  //   if (limit > 0) {
  //     return arr.slice(0, limit)
  //   }
  //   else {
  //     return arr.slice()
  //   }
  // }
  /**
     * @param {string} script
     * @param {string} runOn
     * @param {string} [scriptArgs] - arguments
     */
  const { script, runOn, top, killRunning, scriptArgs } = ns.flags([["script", "hack.js"], ["runOn", ""], ["top", 0], ["killRunning", false], ["scriptArgs", ""]])
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

  /**
   * @param {string} script
   * @param {string} target
   * @param {(number | string | boolean)[]} params
   */
  function runScript(script, target, params) {
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
    // move the files to the target
    // if (ns.isRunning(script, target, ...params.slice())) {
    // }
    // todo have it make threads default to the max for the server given the script
    ns.exec(script, target, threads, ...params.slice())
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
  let nodes = JSON.parse(ns.read(fileName)).filter(node => node.hostname !== home)
  if (top > 0) (
    nodes.sort((a, b) => b.moneyMax - a.moneyMax)//.slice(0, top)
  )

  /** @type node[] */
  const globals = nodes.filter(node => {
    return node.backdoorInstalled
  })
  ns.print("nodes", nodes)
  ns.print("globals", globals)

  if (runOn?.length > 0) {
    const temp = []

    nodes.filter(
      node => {
        return (
          node.hasAdminRights
          && node.requiredHackingSkill <= ns.getHackingLevel()
        )
      }
    )
      .slice(0, top > 0 ? top : nodes.length).forEach(node => {
        temp.push(node.hostname)
      })
    if (scriptArgs.length > 0) {
      runScript(script, runOn, scriptArgs)

    }
    else {

      runScript(script, runOn, temp)
    }
  }
  else {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
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