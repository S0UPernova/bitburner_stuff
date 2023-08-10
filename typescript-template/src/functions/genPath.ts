import { NS } from "/../NetscriptDefinitions"
import node from "/types"

export default async function genPath(ns: NS, serverToFind: node): Promise<string[]> {
  const nodes: node[] = JSON.parse(ns.read('nodes.txt'))
  const start: node = ns.getServer()
  start.connections = ns.scan(start.hostname)
  const parentForCell: any = {}
  const queue: node[] = []

  queue.push(start)

  while (queue.length > 0) {
    // await ns.sleep(0)
    const current: node | undefined = queue.shift()
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

      const node: node | undefined = nodes.find(node => {
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
    if (current.hostname === 'home') break
    const { key, cell } = parentForCell[currentKey]
    current = cell
    currentKey = key
  }

  for (let i = path.length - 1; i > 0; i--) {
    if (ns.getServer(path[i]).backdoorInstalled) {
      path.splice(0, i)
      break
    }
  }

  return path
}