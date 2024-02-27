import Calendar from '../components/calendar'
import Mods from '../components/mod'

export default function Result({ statList, displayName, seed, children }) {
  statList.date = new Date(statList.date)
  return (
    <div className="hero min-h-screen bg-base-300">
      <div className="flex flex-col">
        {children}
        <div className="stack p-4 mb-4">
          <div className="shadow-md card bg-base-200 ">
            <div className="card-body">
              <div className="absolute right-3 top-3"><Calendar date={statList.date} /></div>
              <p className="card-title flex items-center">
                <img className="pr-1 drop-shadow-md" src="https://img.icons8.com/clouds/200/000000/fortune-teller.png" style={{ height: '70px', marginLeft: '-10px' }} />
                <b className="pr-1">{displayName ?? seed}</b>
                的运势
              </p>
              <div>
                <p className="flex items-center">
                  <img class="pr-2 drop-shadow" src="https://img.icons8.com/clouds/200/000000/today.png" style={{ height: '50px' }} />
                  <b>{statList.luck}</b>
                </p>
                <div className="flex items-start">
                  <div className="pr-1 flex items-center">
                    <img className="drop-shadow" src="https://img.icons8.com/clouds/100/000000/osu.png" style={{ height: '50px' }} />
                    {' '}
                  </div>
                  {/* <p className="pr-1">Mod: </p><b>{statList.mod}{(statList.specialMod) ? statList.specialMod + '（？' : ''}</b> */}
                  <Mods mod={statList.mod} />
                </div>
              </div>
              <div class="divider"></div>
              <div className="flex flex-col w-full lg:flex-row">
                <div className="grid flex-grow ">
                  <div className="grid-flow-row shadow stats">
                    {statList.goodList.map(item =>
                      (
                        <div className="stat" key={item.name}>
                          <div className="flex align-baseline">
                            <div className="stat-title pr-1 py-0 my-0">宜: </div>
                            <div className="stat-value text-lg py-0 my-0">{item.name}</div>
                          </div>
                          <div className="stat-desc">{item.good}</div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="divider lg:divider-vertical"></div>
                <div className="grid flex-grow">
                  <div className="grid-flow-row shadow stats">
                    {statList.badList.map(item =>
                      (
                        <div className="stat" key={item.name}>
                          <div className="flex align-baseline">
                            <div className="stat-title pr-1 py-0 my-0">忌: </div>
                            <div className="stat-value text-lg py-0 my-0">{item.name}</div>
                          </div>
                          <div className="stat-desc">{item.bad}</div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="shadow card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Notification 2</h2>
              <p>You have 3 unread messages. Tap here to see.</p>
            </div>
          </div>
          <div className="shadow-sm card bg-base-200 opacity-60">
            <div className="card-body">
              <h2 className="card-title">Notification 3</h2>
              <p>You have 3 unread messages. Tap here to see.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
