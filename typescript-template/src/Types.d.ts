import { Server } from "@ns";


  export interface SERVER_NET_NODE extends Server {
    connections?: string[] | []
  }

  interface portActionMessages {
    action: "grow" | "weaken" | "hack" 
    result: number
    target: string
    hostname: string
  }
  interface messageChannels {
    [key: string]: {server: SERVER_NET_NODE,messages: portActionMessages[]}
  }

