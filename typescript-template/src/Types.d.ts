import { Server } from "@ns";


  interface node extends Server {
    connections?: string[] | []
  }

export default node