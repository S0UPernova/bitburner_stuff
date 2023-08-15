import { NS } from "@ns"
import { spread } from "functions/spread"
// import { infect } from "functions/infect"
export async function main(ns: NS) {
  // if (ns.getHostname() !== "home") {
  //   const result = ns.scp(
  //     [
  //       "functions/spread.js",
  //       "functions/crack.js",
  //       "functions/scanServers.js",
  //       "functions/netNodesFromStrings.js",
  //       "nodes.txt"
  //     ],
  //     ns.getHostname(),
  //     "home"
  //     )
  // }
  while (true) {
    await spread(ns, 1000)
    await ns.sleep((1000 * 30))
    ns.exec("scripts/netrun.js", "home", 1, "--script", "scripts/hack.js", "--top", "10")
  }
}