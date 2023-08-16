import { NS } from '@ns';
import React from 'lib/react';
interface IMyContentProps {
  feed: (string | number)[]
}
interface feedData {
  data: (string | number)[]
}
interface IStyles {
  [key: string]: React.CSSProperties
}

const MyContent = ({ feed }: IMyContentProps) => {
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
        <h1>Something else</h1>
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
export async function main(ns: NS) {
  const port = 3000
  const limit = 20
  ns.disableLog('ALL')
  // ns.disableLog("sleep")
  let feed: Array<string | number> = []
  feed = readFeed(ns, port, feed)
  ns.printRaw(<MyContent feed={feed}></MyContent>);
  while (true) {
    feed = readFeed(ns, port, feed)
    ns.clearLog()
    ns.printRaw(<MyContent feed={feed}></MyContent>);
    await ns.sleep(500)
  }
}
function readFeed(ns: NS, port: number, oldFeed: (number | string)[], limit: number = 20) {
  const feed = [...oldFeed]
  let data: (string | number)
  while ((data = ns.readPort(port)) !== "NULL PORT DATA") {
    feed.unshift(data)
    if (feed.length > limit) {
      return feed.slice(0, limit)
    }
  }
  return feed
  // return feed.slice()
}