import { schema } from "./index";
const a = schema`
@required
array(string)
`;
const b = schema`{
  a: ${a},
  b: [string, number, 13],
  c: string,
  d: array(string),
  e: dict(string),
  f: string | number,
  f2: union([string, number])
  g: string & number
  g2: intersect([string, number]),
  h: any,
  i: never
  j: transform(number, ${(val: any) => val.toString()})
}`;
const [c, d] = schema`
@required
[string, number, 13]
{
  @description("string or number or true or false")
  @required
  b: string | number | bool
}
`

console.log('transform function bind:', b.dict.j.callback.toString())
