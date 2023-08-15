import { NS } from "@ns"
export default function scanServers(ns: NS, maxDepth: number = 5, log: boolean = false): string[] {
  let keepGoing = true
  const nodesSet: Set<string> = new Set()
  let depth = 0
  if (!log) {
    ns.disableLog("scan")
    ns.disableLog("sleep")
  }
  ns.scan("home").forEach((node: string) => {
    nodesSet.add(node)
  })
  while (keepGoing) {
    nodesSet.forEach((node: string) => {
      ns.scan(node).forEach((nextNode: string) => {
        nodesSet.add(nextNode)
      })
      if (depth >= maxDepth) {
        keepGoing = false
      }
    })
    depth++
  }
  return Array.from(nodesSet)
}