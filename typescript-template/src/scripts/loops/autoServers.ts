import { NS } from "@ns"
export async function main(ns: NS) {
  const numberOfServersToHit: number = ns.args[0] as number
  if (Number.isNaN(numberOfServersToHit)) {
    ns.tprint("Must include how many top money servers to hit")
  }
  ns.disableLog("getServerMaxRam")
  ns.disableLog("sleep")
  ns.disableLog("run")
  const purchaseRam = Math.pow(2, 3) // ns.getPurchasedServerMaxRam()
  const cost = ns.getPurchasedServerCost(purchaseRam)
  const maxServers = ns.getPurchasedServerLimit()
  const maxRam = ns.getPurchasedServerMaxRam()
  const runOn = "home"
  while (true) {
    await ns.sleep(1000)
    const servers = ns.getPurchasedServers()
    if (servers.length === maxServers) {
      break
    }
    if (ns.getPlayer().money > cost) {
      const serverName = `server${servers.length}`
      ns.purchaseServer(serverName, purchaseRam)
      // ns.exec("scripts/infect.js", runOn, 1, "1000")
      // await ns.sleep(1000 * 30)
      ns.exec("scripts/netrun.js", runOn, 1, "--script", "hack.js", "--limit", numberOfServersToHit ? numberOfServersToHit : 10, "--runOn", serverName, "--time")
    }
  }

  let keepGoing = true
  while (keepGoing) {
    await ns.sleep(1000)
    keepGoing = false
    
    const servers = ns.getPurchasedServers()
    let weakestServer = ""

    for (let i = 0; i < servers.length; i++) {
      if (ns.getServerMaxRam(servers[i]) < maxRam) {
        keepGoing = true
        if (weakestServer === "" || ns.getServerMaxRam(servers[i]) < ns.getServerMaxRam(weakestServer)) {
          weakestServer = servers[i]
        }
      }
    }
    const upgrayeddRam = ns.getServerMaxRam(weakestServer)
    const upgrayeddCost = ns.getPurchasedServerUpgradeCost(weakestServer, upgrayeddRam * 2)
    if (upgrayeddRam < maxRam && upgrayeddCost < ns.getPlayer().money) {
      ns.print(`upgrayedding ${weakestServer} ram from ${upgrayeddRam} to ${upgrayeddRam * 2} for \$${Intl.NumberFormat('en-us').format(upgrayeddCost)}`)
      ns.upgradePurchasedServer(weakestServer, upgrayeddRam * 2)
      // ns.exec("scripts/infect.js", runOn, 1, "1000")
      // await ns.sleep(1000 * 30)
      ns.exec("scripts/netrun.js", runOn, 1, "--script", "scripts/hack.js", "--runOn", weakestServer, "--limit", numberOfServersToHit ? numberOfServersToHit : 10, "--time", "--killRunning")
    }
  }
  ns.tprint("You are at your server limit, and their ram is maxed out")
}