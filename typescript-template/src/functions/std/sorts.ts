import { NS } from "@ns"
import { SERVER_NET_NODE } from "/Types"

type ISortBy = "money" | "ram"

/**
 * Destructive modifies the array that was passed in.
 * @param {NS} ns 
 * @param {string[]} arr 
 */
export function sortFromHostnames(ns: NS, arr: string[], sortBy?: ISortBy): void {
  switch (sortBy) {
    case "money":
      HostnameMoneySort(ns, arr)
      break
    case "ram":
      HostnameRamSort(ns, arr)
      break

    default:
      HostnameRamSort(ns, arr)
      break
  }
}

function HostnameMoneySort(ns: NS, arr: string[]): void {
  arr.sort((a: string, b: string) => {
    const first = ns.getServer(a)
    const second = ns.getServer(b)
    if (first?.moneyMax && second?.moneyMax) {
      return second.moneyMax - first.moneyMax
    }
    else return 0
  })
}

function HostnameRamSort(ns: NS, arr: string[]): void {
  arr.sort((a: string, b: string) => {
    const first = ns.getServer(a)
    const second = ns.getServer(b)
    return second.maxRam - first.maxRam
  })
}


/**
 * Destructive modifies the array that was passed in.
 * @param {NS} ns 
 * @param {SERVER_NET_NODE} arr 
 * @param {} sortBy
 */
export function sortFromNetNodes(arr: SERVER_NET_NODE[], sortBy?: ISortBy): void {
  // if (sortBy === undefined) {
  //   sortBy = "money"
  // }
  switch (sortBy) {
    case "money":
      NodesMoneySort(arr)
      break
    case "ram":
      NodesRamSort(arr)
      break

    default:
      NodesMoneySort(arr)
      break
  }
}

function NodesMoneySort(arr: SERVER_NET_NODE[]): void {
  arr.sort((a: SERVER_NET_NODE, b: SERVER_NET_NODE) => {
    if (a?.moneyMax && b?.moneyMax) {
      return b.moneyMax - a.moneyMax
    }
    else return 0
  })
}

function NodesRamSort(arr: SERVER_NET_NODE[]): void {
  arr.sort((a: SERVER_NET_NODE, b: SERVER_NET_NODE) => {
    return b.maxRam - a.maxRam
  })
}