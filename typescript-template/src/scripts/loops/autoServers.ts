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
      await ns.sleep(1000 * 30)
      ns.exec("scripts/netrun.js", runOn, 1, "--script", "hack.js", "--top", numberOfServersToHit, "--runOn", serverName)
    }
  }

  let keepGoing = true
  while (keepGoing) {
    await ns.sleep(1000)
    const servers = ns.getPurchasedServers()

    keepGoing = false
    for (let i = 0; i < servers.length; i++) {
      const upgrayeddRam = ns.getServerMaxRam(servers[i])
      if (upgrayeddRam < maxRam) {

        keepGoing = true
      }
      const upgrayeddCost = ns.getPurchasedServerUpgradeCost(servers[i], upgrayeddRam * 2)
      if (upgrayeddRam < maxRam && upgrayeddCost < ns.getPlayer().money) {
        ns.print(`upgrayedding ${servers[i]} ram from ${upgrayeddRam} to ${upgrayeddRam * 2} for \$${Intl.NumberFormat('en-us').format(upgrayeddCost)}`)
        ns.upgradePurchasedServer(servers[i], upgrayeddRam * 2)
        // ns.exec("scripts/infect.js", runOn, 1, "1000")
        await ns.sleep(1000 * 30)
        ns.exec("scripts/netrun.js", runOn, 1, "--script", "scripts/hack.js", "--runOn", servers[i], "--top", "10", "--killRunning")
      }
    }
  }
  ns.tprint("You are at your server limit, and their ram is maxed out")
}