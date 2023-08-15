import { NS } from "@ns"

/** @param {NS} ns */
export async function main(ns: NS) {
  let targets = ns.args as string[]
  if (ns.args.length === 0) {
    targets.push(ns.getHostname())
  }
  for (; ;) {
    await ns.sleep(Math.random() * 1000)
    targets = targets.filter((node) => !ns.getPurchasedServers().includes(node)).sort(() => (Math.random() > .5) ? 1 : -1)
    ns.print(targets)
    // todo make it hit bigger targets more often
    for (let i = 0; i < targets.length; i++) {
      const max = ns.getServerMaxMoney(targets[i])
      const current = ns.getServerMoneyAvailable(targets[i])
      const level = ns.getServerSecurityLevel(targets[i])
      const minLevel = ns.getServerMinSecurityLevel(targets[i])
      // const baseLevel = ns.getServerBaseSecurityLevel(targets[i])
      const hackingLevelReq = ns.getServerRequiredHackingLevel(targets[i])
      const currHackingLevel = ns.getHackingLevel()
      if ((level - (minLevel / 4)) > minLevel) {
        await ns.weaken(targets[i])
        // await weakenServer(ns, targets[i])
      }
      else if (hackingLevelReq <= currHackingLevel) {
        if (current + (Math.random() * (current / 2)) < max) {
          await ns.grow(targets[i])
        }
        else {
          await ns.hack(targets[i])
          // ns.tprint(`${ns.getHostname()} is running hack() on ${targets[i]}`)
        }
      }
    }
  }
}