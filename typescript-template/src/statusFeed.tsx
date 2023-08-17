import { NS } from '@ns';
import React from 'lib/react';
import { netNodesFromStrings } from './functions/netNodesFromStrings';
import scanServers from './functions/scanServers';
import { hackable } from './functions/std/fliters';
import { messageChannel } from './Types';
interface IMyContentProps {
  feed: (string | number)[]
  channels: messageChannel[]
  messageFeed: IMessageFeed
}
interface feedData {
  data: (string | number)[]
}
interface IStyles {
  [key: string]: React.CSSProperties
}

interface IMessageFeed {
  [key: string]: string[]
}
interface IChannels {
  channels: messageChannel[],
  messageFeed: IMessageFeed
}
// todo refactor message ports to be a single port, and use the messages to sort them
const MyContent = ({ feed, channels, messageFeed }: IMyContentProps) => {
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
        <Channels channels={channels} messageFeed={messageFeed} />
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

const Channels = ({ channels, messageFeed }: IChannels) => {
  const styles: IStyles = {
    ul: {
      marginBottom: "2rem"
    }
  }
  return (
    <>
      <h1>Your channels</h1>
      {channels.map((channel: messageChannel) => {
        return (
          <>
            <h2>{channel.hostname}</h2>
            <ul>
              {messageFeed[channel.port].map(message => <li>{message}</li>)}
            </ul>
          </>
        )
      })}
    </>
  )
}


function readPort(ns: NS, port: number, limit: number, oldArr?: Array<any>,): Array<any> {
  let data: (string | number)
  const arr = oldArr ? [...oldArr] : []
  while ((data = ns.readPort(port)) !== "NULL PORT DATA") {
    arr.unshift(data)
  }
  if (arr.length > limit) {
    return arr.slice(0, limit)
  }
  return arr.slice()
}


    export async function main(ns: NS) {
      const port = 3000
      const channelPort = 5500
      const limit = 20
      ns.disableLog('ALL')
    
    
    
    
    
      // ns.disableLog("sleep")
      let feed: Array<string | number> = []
      let temp = readPort(ns, port, 1)
      ns.print("temp: ", temp)
      ns.print("temp[0]: ", temp[0])
      const channels: messageChannel[] = netNodesFromStrings(ns, scanServers(ns, 1000))
        .filter(node => hackable(node, ns.getHackingLevel()))
        .map((node, i) => {
          return { hostname: node.hostname, port: i + 1 }
    
        })
      const messages: IMessageFeed = {}
      feed = readPort(ns, port, limit, feed)
      ns.printRaw(<MyContent feed={feed} channels={channels} messageFeed={messages}></MyContent>);
      while (true) {
        feed = readPort(ns, port, limit, feed)
        channels.forEach(channel => {
          messages[channel.port] = readPort(ns, channel.port, 5, messages[channel.port])
        })
        ns.clearLog()
        ns.printRaw(<MyContent feed={feed} channels={channels} messageFeed={messages}></MyContent>);
        await ns.sleep(500)
      }
    }