import {
  StartServer,
  createHandler,
  renderAsync
} from 'solid-start/entry-server'

export default createHandler(
  renderAsync((context) => <StartServer context={context} />)
)

export const name = 'manual-on-web'

export function apply () {
  console.log('running')
}
