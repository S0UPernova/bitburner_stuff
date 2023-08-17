import {NS} from "@ns"
import scanServers from "/functions/scanServers"

export async function main(ns: NS) {
  ns.tprint(scanServers(ns, 1000))
}