import fs from 'node:fs/promises'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useState } from 'react'

import Fortune from '../../lib/Fortune'

import Page from '../components/page'

const { serverRuntimeConfig } = getConfig()

export async function getServerSideProps(context) {
  // const events = require(serverRuntimeConfig.fortunePath)
  // console.log(fs)
  const json = await fs.readFile(serverRuntimeConfig.fortunePath)
  const events = JSON.parse(json)

  // const router = useRouter()
  //   const { seed = 'guest', displayName = null } = context.query

  //   const fortune = new Fortune(events)
  //   const fortuneTeller = fortune.binding(seed)
  //   const activity = fortuneTeller.today
  //   const statList = activity.getStatList()
  //   return {
  //     props: {
  //       statList: {
  //         ...statList,
  //         date: statList.date.getTime()
  //       }, displayName, seed
  //     }
  //   }
  return {
    props: {
      events,
    },
  }
}

export default function ({ events }) {
  const router = useRouter()
  const { seed = 'guest', displayName = null } = router.query

  const fortune = new Fortune(events)
  const fortuneTeller = fortune.binding(seed)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const activity = fortuneTeller.from(oneWeekAgo).to(tomorrow)
  const [index, setIndex] = useState(activity.length - 2)
  const fortuneTheDay = () => activity[index].getStatList()
  const statList = fortuneTheDay()
  const children = (
    <div className="btn-group mx-auto">
      <button className={['btn', 'btn-wide', activity[index - 1] ? '' : 'btn-disabled'].join(' ')} onClick={() => activity[index - 1] && setIndex(index - 1)}>Yesterday</button>
      <button class="btn btn-active">{statList.date.toLocaleDateString()}</button>
      <button className={['btn btn-wide', activity[index + 1] ? '' : 'btn-disabled'].join(' ')} onClick={() => activity[index + 1] && setIndex(index + 1)}>Tomorrow</button>
    </div>
  )
  return (
    <Page statList={statList} displayName={displayName} seed={seed}>
      {children}
    </Page>
  )
}
