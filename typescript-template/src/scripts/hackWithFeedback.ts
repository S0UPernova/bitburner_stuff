import { NS } from "@ns"

/** @param {NS} ns */
export async function main(ns: NS) {
  let { targets, port } = ns.flags([
    ["targets", []],
    ["port", 0],
  ])
  if (!Array.isArray(targets) || typeof port !== 'number') return
  // let targets = ns.args as string[]
  if (ns.args.length === 0) {
    targets.push(ns.getHostname())
  }
  for (; ;) {
    await ns.sleep(Math.random() * 1000)
    targets = targets.filter((node) => !ns.getPurchasedServers().includes(node)).sort(() => (Math.random() > .5) ? 1 : -1)
    ns.print(targets)
    // todo make it hit bigger targets more often
    for (let i = 0; i < targets.length; i++) {
      let action = ""
      const max = ns.getServerMaxMoney(targets[i])
      const current = ns.getServerMoneyAvailable(targets[i])
      const level = ns.getServerSecurityLevel(targets[i])
      const minLevel = ns.getServerMinSecurityLevel(targets[i])
      // const baseLevel = ns.getServerBaseSecurityLevel(targets[i])
      const hackingLevelReq = ns.getServerRequiredHackingLevel(targets[i])
      const currHackingLevel = ns.getHackingLevel()
      if ((level - (minLevel / 4)) > minLevel) {
        action = "weaken"
        await ns.weaken(targets[i])
        // await weakenServer(ns, targets[i])
      }
      else if (hackingLevelReq <= currHackingLevel) {
        if (current + (Math.random() * (current / 2)) < max) {
          action = "grow"
          await ns.grow(targets[i])
        }
        else {
          let earnedMoney = await ns.hack(targets[i])
          ns.tryWritePort(port, `Earned ${Intl.NumberFormat("en-us").format(earnedMoney)}`)
          // ns.tprint(`${ns.getHostname()} is running hack() on ${targets[i]}`)
        }
      }
      ns.tryWritePort(port, "")
    }
  }
}