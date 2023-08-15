import {NS} from "@ns"
import scanServers from "/functions/scanServers"
/** @param {NS} ns */
export async function main(ns: NS) {
  const hosts = scanServers(ns, 1000)

  // ns.tprint("killScripts, host: ", hosts)
  hosts.forEach(async host => {
    host = host.toString()
    ns.tprint(`RUNNING: killall(${host})`)
    ns.killall(host)
  })
}