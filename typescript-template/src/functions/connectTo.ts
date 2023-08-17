import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types"
import genPath from "functions/genPath"
export async function connectToNode(ns: NS, destination: SERVER_NET_NODE) {
  const arrToTarget: string[] = await genPath(ns, destination, false)
  // ns.print("path: ", arrToTarget)
  for (let j = 0; j < arrToTarget.length; j++) {
    // ns.print("connecting to: ", arrToTarget[j])
    ns.singularity.connect(arrToTarget[j])
  }
}

export async function connectToHostname(ns: NS, destHostname: string) {
  const destination: SERVER_NET_NODE = { ...ns.getServer(destHostname), connections: ns.scan(destHostname) }
  const arrToTarget: string[] = await genPath(ns, destination, false)
  // ns.print("path: ", arrToTarget)
  for (let j = 0; j < arrToTarget.length; j++) {
    // ns.print("connecting to: ", arrToTarget[j])
    ns.singularity.connect(arrToTarget[j])
  }
}