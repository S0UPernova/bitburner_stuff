import { NS } from "@ns"

/** @param {NS} ns @param {string} hostname */
export async function hackServer(ns: NS, hostname: string) {
  if (typeof hostname === "string") {
    while (true) {
      await ns.hack(hostname)
    }
  }
}

/** @param {NS} ns @param {string} hostname */
export async function growServer(ns: NS, hostname: string): Promise<void> {
  if (typeof hostname === "string") {
    while (true) {
      await ns.grow(hostname)
    }
  }
}

/** @param {NS} ns @param {string} hostname */
export async function weakenServer(ns: NS, hostname: string): Promise<void> {
  if (typeof hostname === "string") {
    while (true) {
      await ns.weaken(hostname)
    }
  }
}

/** @param {NS} ns @param {string} hostname */
export async function hackServerOnce(ns: NS, hostname: string): Promise<void> {
  if (typeof hostname === "string") {
    await ns.hack(hostname)
  }
}

/** @param {NS} ns @param {string} hostname */
export async function growServerOnce(ns: NS, hostname: string): Promise<void> {
  if (typeof hostname === "string") {
    await ns.grow(hostname)
  }
}

/** @param {NS} ns @param {string} hostname */
export async function weakenServerOnce(ns: NS, hostname: string): Promise<void> {
  if (typeof hostname === "string") {
    await ns.weaken(hostname)
  }
}