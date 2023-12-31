import { NS } from "@ns"

/** @param {NS} ns */
export async function main(ns: NS) {
  const hostname = ns.getHostname()
  const port = 3000
  let targets = ns.args as string[]
  if (ns.args.length === 0) {
    targets.push(hostname)
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
        ns.tryWritePort(port, `${hostname} is weakening ${targets[i]}`)
        const serverWeakendBy = await ns.weaken(targets[i])
        // await weakenServer(ns, targets[i])
        if (serverWeakendBy > 0) {
          ns.tryWritePort(port, `${hostname} weakend ${targets[i]} by ${serverWeakendBy.toFixed(3)}`)
        }
      }
      else if (hackingLevelReq <= currHackingLevel) {
        if (current + (Math.random() * (current / 2)) < max) {
          ns.tryWritePort(port, `${hostname} is growing ${targets[i]}`)
          const serverGrownBy = await ns.grow(targets[i])
          if (serverGrownBy > 0) {
            ns.tryWritePort(port, `${hostname} grew ${targets[i]} by ${Intl.NumberFormat("en-us").format(serverGrownBy)}`)
          }
        }
        else {
          ns.tryWritePort(port, `${hostname} is hacking ${targets[i]}`)
          const moneyEarned = await ns.hack(targets[i])
          if (moneyEarned > 0) {
            ns.tryWritePort(port, `${hostname} hacked ${targets[i]} for ${Intl.NumberFormat("en-us").format(moneyEarned)}`)
          }
          // ns.tprint(`${ns.getHostname()} is running hack() on ${targets[i]}`)
        }
      }
    }
  }
}