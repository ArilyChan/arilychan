const mods = Object.entries({
  Nomod: <img className="drop-shadow"src="https://img.icons8.com/clouds/200/000000/null-symbol.png" />,
  HR: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/guitar.png" />,
  HD: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/opacity.png" />,
  DT: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/fast-forward.png" />,
  FL: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/light-on.png" />,
  EZ: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/christmas-candy.png" />,
  HT: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/drink-time.png" />,
  NF: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/float.png" />,
  SD: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/shark.png" />,
  PF: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/good-quality.png" />,
  Relax: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/hand-with-pen.png" />,
  Auto: <img className="drop-shadow"src="https://img.icons8.com/clouds/100/000000/futurama-bender.png" />,
  ScoreV2: <img className="drop-shadow"src="https://img.icons8.com/color/48/000000/osu-lazer.png" />,
}).reduce((acc, [k, icon]) => {
  acc[k] = (
    <div className="flex flex-col items-center relative">
      {icon}
      <p className="leading-none text-xs" style={{ position: 'absolute', bottom: '-0.5rem' }}>{k}</p>
    </div>
  )
  return acc
}, {})

const modComb = [
  [mods.Nomod],
  [mods.HR],
  [mods.HD],
  [mods.DT],
  [mods.HD, mods.HR],
  [mods.HR, mods.DT],
  [mods.HD, mods.DT],
  [mods.HD, mods.DT, mods.HR],
]

const modCombSpecial = [
  [mods.EZ, mods.DT],
  [mods.NF],
  [mods.SD],
  [mods.PF],
  [mods.FL],
  [mods.EZ, mods.HD],
  [mods.Relax],
  [mods.Auto],
  [mods.ScoreV2],
]

const j = require('../../osuercalendar-events.json')

const modEnum = [
  ...j.mods,
  ...j.modsSpecial,
]
const iconEnum = [
  ...modComb,
  ...modCombSpecial,
]

export default function Mods({ mod, size = '50px' } = {}) {
  const modI = modEnum.findIndex(m => m === mod)
  if (modI === -1)
    return <div></div>
  const modArr = iconEnum[modI]
  return (
    <div className="flex">
      {modArr.map(mod => <div style={{ width: size }}>{mod}</div>)}
    </div>
  )
}
