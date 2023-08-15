
import { NS } from "@ns"
import {spread} from "functions/spread"

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const maxDepth = ns.args[0] as number ? ns.args[0] as number : 5
  await spread(ns, maxDepth)
}
