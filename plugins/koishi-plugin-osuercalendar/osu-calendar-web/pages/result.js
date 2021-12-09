import { useRouter } from 'next/router'
import { Fortune, FortuneBinding } from '../../lib'
const events = require('../../osuercalendar-events.json')


const FortuneResult = () => {
  const router = useRouter()
  const { seed, friendlyName } = router.query

  const fortune = new Fortune(events)
  const fortuneTeller = fortune.binding(seed)
  const activity = fortuneTeller.today
  const statList = activity.getStatList()

  // return <p> Post: { JSON.stringify(statList) } </p>
  return (
    <div>
      <h1>{ friendlyName ?? seed } 的运势</h1>
      <h2>今日运势: <b>{statList.luck}</b></h2>
      <h2>今日Mod: <b>{statList.mod}{ (statList.specialMod) ? statList.specialMod + '（？' : "" }</b></h2>
      <h2>宜: </h2>
      <ul>{statList.goodList.map((item) => 
          (<li key={item.name}>
            <div>
            {item.name}
            {"    "}
            <i>{item.good}</i>
            </div>
          </li>)
      )}</ul>
      <h2>忌: </h2>
      <ul>{statList.badList.map((item) => 
          (<li key={item.name}>
            <div>
            {item.name}
            {"    "}
            <i>{item.bad}</i>
            </div>
          </li>)
      )}</ul>
    </div>
  )
}
  
export default FortuneResult