import { Server } from "@ns";


  export interface node extends Server {
    connections?: string[] | []
  }
