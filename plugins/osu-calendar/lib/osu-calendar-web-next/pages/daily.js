import fs from 'fs/promises'
import getConfig from 'next/config'

import Fortune from '../../lib/Fortune'

import Page from '../components/page'
const { serverRuntimeConfig } = getConfig()

export async function getServerSideProps (context) {
  // const events = require(serverRuntimeConfig.fortunePath)
  // console.log(fs)
  const json = await fs.readFile(serverRuntimeConfig.fortunePath)
  const events = JSON.parse(json)

  // const router = useRouter()
  const { seed = 'guest', displayName = null } = context.query

  const fortune = new Fortune(events)
  const fortuneTeller = fortune.binding(seed)
  const activity = fortuneTeller.today
  const statList = activity.getStatList()
  return {
    props: {
      statList: {
        ...statList,
        date: statList.date.getTime()
      },
      displayName,
      seed
    }
  }
}

export default function Daily (props) {
  return <Page {...props} />
}
