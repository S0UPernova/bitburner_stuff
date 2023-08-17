import { NS } from '@ns';
import React from 'lib/react';
import { netNodeFromString, netNodesFromStrings } from './functions/netNodesFromStrings';
import scanServers from './functions/scanServers';
import { hackable } from './functions/std/fliters';
import { messageChannels, portActionMessages } from './Types';
interface IMyContentProps {
  ns: NS
  feed: (string | number)[]
  channels: messageChannels
}
interface feedData {
  data: (string | number)[]
}
interface IStyles {
  [key: string]: React.CSSProperties
}

interface IChannels {
  ns: NS
  channels: messageChannels,
}
// todo refactor message ports to be a single port, and use the messages to sort them
const MyContent = ({ ns, feed, channels }: IMyContentProps) => {
  const styles: IStyles = {
    container: {
      display: "flex",
      gap: "1rem"
    },
    h1: {
      position: "relative",
      top: "0",
      bottom: "auto",
      width: "100%",
      textAlign: "center"
    }
  }
  return <>
    <div style={styles.container}>

      <div style={styles.feed}>
        <h1 style={styles.h1}>Check out your feed</h1>
        <Feed data={feed} />
      </div>
      <div>
        <Channels ns={ns} channels={channels} />
      </div>
    </div>
  </>;
}

const Feed = ({ data }: feedData) => {
  const styles: IStyles = {
    ul: {
      listStyle: "none",
      lineHeight: "1.2rem",
      margin: "0",
      padding: ".5rem"
    },
    li: {
      margin: "0.5rem"
    },
    liEvn: {
      background: "#222"
    },
    liOdd: {
      background: "#444"
    }
  }
  return <>
    <ul style={styles.ul}>
      {data.map((entry: string | number, i: number) => {
        const dynamicStyle = i % 2 === 0 ? styles.liEvn : styles.liOdd
        return <>
          <li style={{ ...styles.li, ...dynamicStyle }}>
            {entry}
          </li>
        </>
      })}
    </ul>
  </>
}

const Channels = ({ ns, channels }: IChannels) => {
  const styles: IStyles = {
    ul: {
      background: "#444",
      minHeight: "8rem",
      // marginBottom: "2rem"
    }
  }
  return (
    <>
      <h1>Your channels</h1>
      {
        Object.entries(channels).map(([channel, obj]) => {
          const divideBy = 100
          const money = Number(obj.server.moneyAvailable) // divideBy
          const maxMoney = Number(obj.server.moneyMax) // divideBy
          const format = (num: number, isMoney: boolean) => {
            if (isMoney) {
              return Intl.NumberFormat("en-us", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(num)
            }
            return Intl.NumberFormat("en-us", { maximumFractionDigits: 3 }).format(num)

          }
          return (
            <>
              <h2>{channel}</h2>
              <p><b>Security</b> level {obj.server.hackDifficulty}, min {obj.server.minDifficulty}, base {obj.server.baseDifficulty}</p>

              <p><b>Money</b> available {money ? format(money, true) : 0}, max {maxMoney ? format(money, true) : 0}</p>
              <ul style={styles.ul}>
                {obj.messages.map(message => {
                  enum verb {
                    hack = "hacked",
                    grow = "grew",
                    weaken = "weakend"
                  }
                  return <>
                    <li>{verb[message.action]} {message.target} {message.action === "hack" ? `for ${format(message.result, true)}` : `by ${format(message.result, false)}`}</li>
                  </>
                })}
              </ul>
            </>
          )
        })
      }
    </>
  )
}



function readPort(ns: NS, port: number, limit: number, oldArr?: Array<any>,): Array<any> {
  let data: (string | number)
  const arr = oldArr ? [...oldArr] : []
  while ((data = ns.readPort(port)) !== "NULL PORT DATA") {
    arr.unshift(data)
  }
  if (limit > 0 && arr.length > limit) {
    return arr.slice(0, limit)
  }
  return arr.slice()
}


export async function main(ns: NS) {
  const port = 3000
  const messagePort = 5500
  const limit = 20
  const messageLimit = 10
  ns.disableLog('ALL')

  // ns.disableLog("sleep")
  let feed: Array<string | number> = []
  let messageFeed = readPort(ns, port, -1)
  // ns.print("temp: ", temp)
  // ns.print("temp[0]: ", temp[0])

  const channels: messageChannels = {}
  netNodesFromStrings(ns, scanServers(ns, 1000))
    .forEach((node) => {
      channels[node.hostname] = { server: netNodeFromString(ns, node.hostname), messages: [] }
    })
  feed = readPort(ns, port, limit, feed)
  messageFeed = readPort(ns, messagePort, -1, messageFeed)

  // messageFeed.forEach(entry => {
  //   const message: portActionMessages = JSON.parse(entry) as portActionMessages
  //   const key: keyof messageChannel = message.hostname as keyof messageChannel
  //   channels[key] = message

  ns.printRaw(<MyContent ns={ns} feed={feed} channels={channels}></MyContent>);
  while (true) {
    feed = readPort(ns, port, limit, feed)
    messageFeed = readPort(ns, messagePort, -1)
    while (messageFeed.length > 0) {
      const poped = messageFeed.shift()
      if (poped !== undefined) {

        // Update messages for channel for the given message
        const message: portActionMessages = JSON.parse(poped)
        const temp = channels[message.hostname].messages.slice()
        temp.push(message)
        channels[message.hostname].messages = [...temp.slice(0, messageLimit)]

        // Update info for all channels
        netNodesFromStrings(ns, scanServers(ns, 1000))
          .forEach((node) => { channels[node.hostname].server = node })
      }
    }
    ns.clearLog()
    ns.printRaw(<MyContent ns={ns} feed={feed} channels={channels}></MyContent>);
    await ns.sleep(500)
  }
}