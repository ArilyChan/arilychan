import { Schema } from 'koishi'
import { schema } from '.'
const config = <Schema<unknown, {a: boolean, b: number }>>schema`{
  @required
  a: true,
  @default(1)
  b: number
} | {
  @required
  a: false,
  @default(2)
  b: number
}`

console.log(config({ a: false }))
