import { NS } from "@ns"
/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog("singularity.getDarkwebProgramCost")
  ns.disableLog("sleep")
  let done = false
  while (done === false) {
    await ns.sleep(0)
    done = true
    ns.singularity.getDarkwebPrograms().forEach(program => {
      const cost = ns.singularity.getDarkwebProgramCost(program)
      const money = ns.getPlayer().money
      if (cost > 0) {
        done = false
      }
      if (cost > 0 && cost < money) {
        ns.singularity.purchaseProgram(program)
      }
    })
  }
}