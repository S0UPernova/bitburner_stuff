import { NS } from "@ns"
import { SERVER_NET_NODE } from "@types"


export function hackable(target: SERVER_NET_NODE, hackingLevel: number): boolean {
  if (
    !target.purchasedByPlayer
    && target.hostname !== "home"
    && target.backdoorInstalled
    && target?.requiredHackingSkill
    && target.requiredHackingSkill <= hackingLevel
    && target?.moneyMax
    && target.moneyMax > 0
  ) {
    return true
  }
  else {
    return false
  }
}