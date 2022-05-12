import { shallowRef } from 'vue'
import { singleton } from './shared-state'

singleton.set('tools', [])

export default shallowRef(singleton.get('tools') as any[])
