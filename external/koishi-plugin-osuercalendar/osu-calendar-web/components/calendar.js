import { useRouter } from 'next/router'

// const monthContainer = document.querySelector(`[js-month]`)
// const dayOfWeekContainer = document.querySelector(`[js-dayOfWeek]`)
// const dateContainer = document.querySelector(`[js-date]`)

const SSR = typeof window === 'undefined'
// monthContainer.innerHTML = monthName
// dayOfWeekContainer.innerHTML = dayName
// dateContainer.innerHTML = dayNumber

export default function Calendar(props) {
  const date = props?.date ?? new Date()
  let monthName; let dayName; let dayNumber
  const dayOfWeek = date.getDay()
  const isWeekend = (dayOfWeek === 6) || (dayOfWeek === 0) // 6 = Saturday, 0 = Sunday
  if (!SSR) {
    const { query } = useRouter()
    const lang = query.lang || navigator?.language || 'zh-cn'
    monthName = date.toLocaleString(lang, { month: 'long' })
    dayName = date.toLocaleString(lang, { weekday: 'long' })
    dayNumber = date.getDate()
  }

  return (
    <div className="flex-col justify-center items-center rounded-lg bg-white overflow-hidden shadow-md">
      <div className="bg-red-700 text-white py-1 px-4">
        <p className="text-m font-semibold text-white uppercase tracking-wide">{monthName}</p>
      </div>
      <div className="flex-col justify-center items-center">
        <p className={`text-sm ${isWeekend ? 'text-red-300' : 'text-gray-400'} text-center pt-2 px-4 leading-none`}>{dayName}</p>
        <p className={`font-bold text-center pb-2 px-4 leading-none ${isWeekend ? 'text-red-800' : 'text-black'}`} style={{ fontSize: '40px' }}>{dayNumber}</p>
      </div>
    </div>
  )
}
