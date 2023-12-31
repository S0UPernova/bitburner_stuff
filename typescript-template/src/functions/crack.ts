import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types"
import genPath from "functions/genPath"
import { connectToNode } from "functions/connectTo"

//? maybe make this take SERVER_NET_NODE | SERVER_NET_NODE[]

/**
 * @param {string} target - hostname of target to crack
 * @returns {Promise<void>}
 */
export default async function crack(ns: NS, targetOrTargets: string | string[], log: boolean = false): Promise<void> {
  ns.disableLog("disableLog")
  ns.disableLog("getHackingLevel")
  ns.disableLog("getServerRequiredHackingLevel")
  ns.disableLog("getServerNumPortsRequired")
  ns.disableLog("brutessh")
  ns.disableLog("ftpcrack")
  ns.disableLog("relaysmtp")
  ns.disableLog("httpworm")
  ns.disableLog("sqlinject")
  ns.disableLog("scp")

  const skill = ns.getHackingLevel()
  const targetArr = Array.isArray(targetOrTargets) ? [...targetOrTargets] : [targetOrTargets]
  const home: SERVER_NET_NODE = ns.getServer('home')
  home.connections = ns.scan('home')
  // ns.print("targetArr: ", targetArr)
  // targetArr.forEach(async (target) => {
  for (let i = 0; i < targetArr.length; i++) {
    await ns.sleep(100)
    // const targetArr[i] = targetArr[i]
    const skillRequired = ns.getServerRequiredHackingLevel(targetArr[i])

    if (!ns.hasRootAccess(targetArr[i])) {
      const home = "home"
      let ports = 0
      if (ns.fileExists("BruteSSH.exe", home)) {
        ns.brutessh(targetArr[i])
        ports++
      }
      if (ns.fileExists("FTPCrack.exe", home)) {
        ns.ftpcrack(targetArr[i])
        ports++
      }
      if (ns.fileExists("relaySMTP.exe", home)) {
        ns.relaysmtp(targetArr[i])
        ports++
      }
      if (ns.fileExists("HTTPWorm.exe", home)) {
        ns.httpworm(targetArr[i])
        ports++
      }
      if (ns.fileExists("SQLInject.exe", home)) {
        ns.sqlinject(targetArr[i])
        ports++
      }
      if (ns.getServerNumPortsRequired(targetArr[i]) <= ports) {

        ns.nuke(targetArr[i])
      }
    }
    const tempServer: SERVER_NET_NODE = ns.getServer(targetArr[i])
    tempServer.connections = ns.scan(targetArr[i])
    if (
      skill >= skillRequired
      && tempServer.hostname !== "home"
      && tempServer.backdoorInstalled === false
      && tempServer.purchasedByPlayer === false
      && tempServer.hasAdminRights === true
    ) {
      await connectToNode(ns, tempServer)
      ns.tprint(`installing backdoor on: ${targetArr[i]} from ${ns.getHostname()}`)
      await ns.singularity.installBackdoor().then(async () => {
        // return to initial server
        await connectToNode(ns, home)
        // ns.singularity.connect(home.hostname)
      })
    }
    await ns.sleep(100)
  }
}