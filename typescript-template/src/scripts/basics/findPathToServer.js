import "../../Types.js"
import genPath from "/functions/std/genPath.js"
/** @param {NS} ns */
export async function main(ns) {
  const [...servers] = ns.args
  const list = []
  servers.forEach(server => {
    const temp = ns.getServer(server)
    temp.connections = ns.scan(server)
    list.push(temp)
  })


  // const serverToFind = nodes.find(node => node.hostname === ns.args[0])


  // await genPath(root)
  const arr = []
  for (let i = 0; i < list.length; i++) {
    ns.print('server: ', list[i])
    await ns.sleep(0)
    const path = await genPath(ns, list[i])
    arr.push(path)
  }
  ns.tprint("paths: ", arr)
  return arr
}