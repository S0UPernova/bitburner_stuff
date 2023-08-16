import { NS } from "@ns"
import { SERVER_NET_NODE } from "/Types"

/**
 * Destructive modifies the array that was passed in.
 * @param {NS} ns 
 * @param {string[]} arr 
 */
export function sortFromHostnames(ns: NS, arr: string[]): void {
  arr.sort((a: string, b: string) => {
    const first = ns.getServer(a)
    const second = ns.getServer(b)
    if (first?.moneyMax && second?.moneyMax) {
      return second.moneyMax - first.moneyMax
    }
    else return 0
  })
}

/**
 * Destructive modifies the array that was passed in.
 * @param {NS} ns 
 * @param {SERVER_NET_NODE} arr 
 */
export function sortFromNetNodes(ns: NS, arr: SERVER_NET_NODE[]): void {
  arr.sort((a: SERVER_NET_NODE, b: SERVER_NET_NODE) => {
    if (a?.moneyMax && b?.moneyMax) {
      return b.moneyMax - a.moneyMax
    }
    else return 0
  })
}