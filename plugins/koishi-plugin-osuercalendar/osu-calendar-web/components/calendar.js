// const monthContainer = document.querySelector(`[js-month]`)
// const dayOfWeekContainer = document.querySelector(`[js-dayOfWeek]`)
// const dateContainer = document.querySelector(`[js-date]`)

const SSR = typeof window === 'undefined'
// monthContainer.innerHTML = monthName
// dayOfWeekContainer.innerHTML = dayName
// dateContainer.innerHTML = dayNumber

export default function Calendar() {
    let monthName, dayName, dayNumber = undefined
    if (!SSR) {
        // const lang = navigator?.language || 'zh-cn'
        const lang = 'zh-cn'

        let date = new Date()
    
        monthName = date.toLocaleString(lang, { month: 'long' })
        dayName = date.toLocaleString(lang, { weekday: 'long' })
        dayNumber = date.getDate()
    }

    return (
        <div className="flex-col justify-center items-center rounded-lg bg-white overflow-hidden shadow-md">
            <div className="bg-blue-500 text-white py-1 px-4">
                <p className="text-m font-semibold text-white uppercase tracking-wide">{monthName}</p>
            </div>
            <div className="flex-col justify-center items-center">
                <p className="text-sm text-gray-400 text-center pt-2 px-4 leading-none">{dayName}</p>
                <p className="font-bold text-black text-center pb-2 px-4 leading-none" style={{"font-size": "40px"}}>{dayNumber}</p>
            </div>
        </div>
    )
}