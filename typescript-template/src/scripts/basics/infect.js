
import { genPath } from "findPathTo.js"
/** @param {NS} ns */
export async function main(ns) {
  const { log } = ns.flags([["log", false]])
  const ramRequired = 3
  let depth = 0
  let maxDepth = ns.args[0] ? ns.args[0] : 5
  let keepGoing = true
  // const script = ["hack.js", "killScripts.js"]
  const nodesSet = new Set()
  const nodesArr = []

  /**
   * @typedef node
   * @type {object}
   * @property {string} host - the hostname
   * @property {string[] | undefined} connections - list of hostnames this machine is connected to
   */

  /**
   * @param {Array<node>} arr
   * @param {string} [filename] - default nodes.txt
   */
  function makeFile(arr, filename = "nodes.txt") {
    const data = JSON.stringify(arr)
    // ns.tprint('data: ', data)
    ns.write(filename, data, 'w')
  }



  /**
   * @param {string} target - hostname of target to crack
   */
  async function crack(target) {
    const skill = ns.getHackingLevel()
    const skillRequired = ns.getServerRequiredHackingLevel(target)
    if (!ns.hasRootAccess(target)) {
      const home = "home"
      let ports = 0
      if (ns.fileExists("BruteSSH.exe", home)) {
        ns.brutessh(target)
        ports++
      }
      if (ns.fileExists("FTPCrack.exe", home)) {
        ns.ftpcrack(target)
        ports++
      }
      if (ns.fileExists("relaySMTP.exe", home)) {
        ns.relaysmtp(target)
        ports++
      }
      if (ns.fileExists("HTTPWorm.exe", home)) {
        ns.httpworm(target)
        ports++
      }
      if (ns.fileExists("SQLInject.exe", home)) {
        ns.sqlinject(target)
        ports++
      }
      if (ns.getServerNumPortsRequired(target) <= ports) {

        ns.nuke(target)
      }
      // if (fileExists("Formulas.exe")) {
      //   await ns
      // }
    }
    if (ns.hasRootAccess(target)) {

      const tempServer = ns.getServer(target)
      tempServer.connections = ns.scan(target)
      if (
        skill >= skillRequired
        && tempServer.backdoorInstalled === false
        && tempServer.purchasedByPlayer === false
        && tempServer.hasAdminRights === true
      ) {
        ns.tprint("test")
        // todo make this work via netrun so that each server runs it on their own
        // ns.singularity.connect("home")
        const arrToTarget = await genPath(ns, tempServer)
        arrToTarget.forEach(server => {
          ns.tprint("server: ", server)
          ns.singularity.connect(server)

        })
        await ns.singularity.installBackdoor().then(() => {
          ns.singularity.connect("home")
        })
      }
    }
    const server = ns.getServer(target)
    server.connections = ns.scan(target)
    if (
      skill >= skillRequired
      && server.backdoorInstalled === false
      && server.purchasedByPlayer === false
      && server.hasAdminRights === true
    ) {

      const path = await genPath(ns, server)
      if (log) {
        ns.tprint(`need to backdoor ${target}, run: con ${path.join("; con ")}; bd`)
      }

    }
  }

  // nodesSet.add("home")
  ns.scan().forEach(node => {
    nodesSet.add(node)
  })
  let nodes = Array.from(nodesSet)

  // should add checked hash, and prevent rechecks
  while (keepGoing) {
    nodes.forEach((node, i) => {
      ns.scan(node).forEach(nextNode => {
        nodesSet.add(nextNode)
      })
      const temp = [...nodes]
      nodes = Array.from(nodesSet)
      if (Array.from(nodesSet) === temp.length || depth >= maxDepth) {
        keepGoing = false
      }
    })
    depth++
  }

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === 'home') continue
    await crack(nodes[i])
    const server = ns.getServer(nodes[i])
    server.connections = ns.scan(server.hostname)
    nodesArr.push(server)
  }
  makeFile(nodesArr, "nodes.txt")
}