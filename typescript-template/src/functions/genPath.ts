import { NS } from "/../NetscriptDefinitions"
import { SERVER_NET_NODE } from "@types"
import scanServers from "functions/scanServers"

export default async function genPath(ns: NS, serverToFind: SERVER_NET_NODE, trim: boolean = true): Promise<string[]> {
  const nodes: SERVER_NET_NODE[] = scanServers(ns, 1000).map(hostname => {
    return {...ns.getServer(hostname), connections: ns.scan(hostname)}
  })
  const start: SERVER_NET_NODE = ns.getServer()
  start.connections = ns.scan(start.hostname)
  const parentForCell: any = {}
  const queue: SERVER_NET_NODE[] = []

  queue.push(start)

  while (queue.length > 0) {
    // await ns.sleep(0)
    const current: SERVER_NET_NODE | undefined = queue.shift()
    if (!current?.hostname) continue
    if (!current?.connections) continue
    const currentKey = current.hostname
    for (let i = 0; i < current.connections.length; i++) {
      const key: string = current.connections[i]

      if (key in parentForCell) {
        continue
      }

      parentForCell[key] = {
        key: currentKey,
        cell: current
      }

      const node: SERVER_NET_NODE | undefined = nodes.find(node => {
        if (current?.connections !== undefined && current?.connections[i] !== undefined) {
          return node.hostname === current.connections[i]
        }
        else {
          return false
        }
      })

      if (node) {
        queue.push(node)
      }
    }
  }

  const path: string[] = []
  let current = serverToFind
  let currentKey = serverToFind.hostname

  while (/* currentKey !== start.hostname && */ currentKey && parentForCell[currentKey]) {
    path.unshift(current.hostname)
    if (current.hostname === start.hostname) break
    const { key, cell } = parentForCell[currentKey]
    current = cell
    currentKey = key
  }
  if (trim) {
    for (let i = path.length - 1; i > 0; i--) {
      if (ns.getServer(path[i]).backdoorInstalled) {
        path.splice(0, i)
        break
      }
    }
  }

  return path
}