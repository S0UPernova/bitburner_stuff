import { NS } from "@ns"
export async function main(ns: NS) {
  let targets = ns.args as string[]
  for (; ;) {
    for (let i = 0; i < targets.length; i++) {
      await ns.weaken(targets[i])
    }
  }
}