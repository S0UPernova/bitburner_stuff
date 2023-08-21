import { NS } from "@ns"
import { connectToHostname } from "/functions/connectTo"
export async function main(ns: NS) {
  const target: string = ns.args[0] as string
  if (typeof target !== "string") {
    ns.tprint("target must be a string")
  }
  connectToHostname(ns, target)
}