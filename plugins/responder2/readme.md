# koishi-plugin-responder2

[![npm](https://img.shields.io/npm/v/koishi-plugin-responder2?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-responder2)

可以让你在配置里写函数
## 命令
|command|usage|
|--|--|
|responder2.test|测试语法是否合法|
|responder2.explain|解释语法，可多行|
|responder2.explain current|解释配置中的语法|
## 语法
### 示例
假如收到'hi'就回复'hi~'
```js
$ === 'hi' -> 'hi~'
```
```js
// responder2.explain
[0]:
|| 触发条件:
|| session.content === 'hi'
|| ⬇️
|| 固定回复:
|| 'hi~'
```
自定义 Matcher function
```js
// 多行 其实是可以的.
// 写注释也可以。
$ -> session.userId === 'onebot:12345'
  -> '您被ban了'
```
```js
// responder2.explain
[0]:
注释:  多行 其实是可以的.
[1]:
注释:  写注释也可以。
[2]:
|| 自定义触发函数:  [inline] 
|| (session, context) => session.userId === 'onebot:12345'
|| ⬇️
|| 固定回复:
|| '您被ban了'
```
自定义 Action function
```js
// 假如消息以'教我'开头，就调用'help'命令 （会将‘教我’后面的部分传给help）
$startsWith '教我' -> session.execute(`help ${session.content.slice(2)}`)
```
```js
// responder2.explain
[0]:
注释:  假如消息以`教我`开头，就调用`help`命令 （会将`教我`后面的部分传给help）
[1]:
|| 触发条件:
|| session.content.startsWith('教我')
|| ⬇️
|| 自定义回复函数:  [inline] 
|| (session, context) => session.execute(`help ${session.content.slice(2)}`)
```

### 结构
以下所有im为incomingMessage的简写

`im`  `keyword`  `Literal` -> `Literal`

`im`  `keyword`  `Literal` -> `ActionFunction` | `AsyncActionFunction`

`im` -> `MatcherFunction` | `AsyncMatcherFunction` -> `Literal`

`im` -> `MatcherFunction` | `AsyncMatcherFunction` ->  `ActionFunction` | `AsyncActionFunction`

### incomingMessage 的别名
|alias|example
|--|--｜
`incomingMessage`  | `incomingMessage includes 'sb'`|
`im`  | `im includes 'sb'`|
`on`  | `on includes 'sb'`|
`$`   | `$includes 'sb'`|
### keywords
|keyword|explain|example|
|--|--|--|
`includes` | `im` includes `'string'` | `$includes 'sb'`|
`startsWith` | `im` startsWith `'string'` | `$startsWith 'sb'`|
`=` | `im` eqeq `'string'` (prints error) | `$ == 'sb'`|
`==` | `im` eqeq `'string'` | `$ == 'sb'`|
`===` | `im` eqeqeq `'string'` | `$ === 'sb'`|
`is` | `im` eqeqeq `'string'` | `$ is 'sb'`|
`equals` | `im` eqeqeq `'string'` | `$ euals 'sb'`|

### 操作符
|op|explain|example|
|--|--|--|
|->|`matcher` -> `action`|`$includes 'sb'` -> `'triggered'`|
|->|`im` -> `Function`|`$` -> `session => session.userId === '12345'`|

### 函数
|type|params|returns|
|--|--|--|
|MatcherFunction|`(session: Session, context: Context)`| `boolean`
|MatcherAsyncFunction|`(session: Session, context: Context)`| `Promise<boolean>`
|ActionFunction|`(session: Session, context: Context)`| `string \| void`
|ActionoAsyncFunction|`(session: Session, context: Context)`| `Promise<string \| void>`

函数可以省略parameters 会默认用session, context作为parameters
```
$ -> session.userId === 12345 -> 'sb'
```
由于函数以外的部分并不是js语言解释的结果，书写体验与js"略有不同"

以下每一行的运行结果都是相同的：回复每条消息'???'
```
$ -> (customNameForSession, customNameForContext) => true -> async await '???'
$ -> () => { return true } -> async await '???'
$ -> { return true } -> async '???'
$ -> () => true -> async await '???'
$ -> true -> () => '???'
$ -> true -> '???'
```

### 类型
|type|explain|examples|
|--|--|--|
|Literal| string | `'sb'`|
|Function| Match | `session => session.userId === 12345`|
|AsyncFunction| Match | `async session => session.userId === 12345`|
|Function| Action | `(session, ctx) => session.execute('help')`|
|AsyncFunction| Action | `async session => session.userId === 12345`|