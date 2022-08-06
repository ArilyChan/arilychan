# koishi-plugin-responder2

[![npm](https://img.shields.io/npm/v/koishi-plugin-responder2?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-responder2)

可以让你在配置里写函数 

(对于一部分人来说这份文档从后往前看更好理解)

# 配置
当前版本你需要控制台插件才可以使用。
- 打开控制台-插件配置-responder2 (假设你的控制台开设在 http://localhost:10000/console/)
http://localhost:10000/console/plugins/responder2
- rules 中就可以写配置了。 
- 暂时rules是string的数组。更新到v2后会有breaking change, 格式会变成 `{ enabled: Boolean, rule: String }`
# 命令
本插件附赠一些命令可以帮你更轻松的理解和测试配置。
|command|usage|
|--|--|
|responder2.test|测试语法是否合法|
|responder2.explain|解释语法|
|responder2.explain current|解释当前配置中的语法|
# 语法
本插件主要有三个概念：
- `Matcher`
- `Action`
- `Literal` (也是`String`)

我会慢慢引入这些概念。
## 示例
假如机器人收到`'hi'` 就回复`'hi~'`
```js
$ === 'hi' -> 'hi~'
```
这里的`'hi'`和`'hi~'` 就是两个 `Literal`。
使用 [responder2.explain](#命令) 命令解释下上面的语法会得到以下结果：
```js
// responder2.explain $ === 'hi' -> 'hi~'
[0]:
|| 触发条件:
|| session.content === 'hi'
|| ⬇️
|| 固定回复:
|| 'hi~'
```
上面的 `"触发条件"` 就是一种 `Matcher`，`"固定回复"` 就是一种 `Action`。

`Matcher` 除了 `===` 以外还有一些其他[运算符](#keywords)，后面会完整的列出。
### 自定义 MatcherFunction
`Matcher` 除了利用[运算符](#keywords)以外，你还可以自己编写一些[函数](#函数)来实现更复杂的功能。

```js
// 顺便一提，虽然暂时插件配置页面中一列rule只能写一行，但其实你可以写多行的。
/* 
 * 又顺便一提，作为一门语言，写注释的能力也是必不可少的。
 * 本插件 自然是支持的。（很帅的脸）
 */
$ -> session.userId === 'onebot:12345'
  -> '您被ban了'
```
上面的配置看起来和[函数](#函数)似乎不沾边儿，但其实这是本插件语言中[函数](#函数)的最小实现。
[(想要现在立刻马上了解函数的结构的话点我)](#由于函数以外的部分并不是js语言解释的结果书写体验与js略有不同)

用 explain 解释一下这条配置，会得到下面的结果：
```js
// responder2.explain /* 连带注释的语法 */
[0]:
注释:  顺便一提，虽然暂时插件配置页面中一列rule只能写一行，但其实你可以写多行的。
[1]:
注释:  
 * 又顺便一提，作为一门语言，写注释的能力也是必不可少的。
 * 本插件 自然是支持的。（很帅的脸）

[2]:
|| 自定义触发函数:  [inline] 
|| (session, context, resolve, reject) => session.userId === 'onebot:12345'
|| ⬇️
|| 固定回复:
|| '您被ban了'
```
`session.userId === 'onebot:12345'` 被翻译成了 `(session, context, resolve, reject) => session.userId === 'onebot:12345'`。

函数的返回值会被转换为 `Boolean` 用来判断是否运行 `Action`。

熟悉 `Promise` 的你看到 `resolve, reject` 一定会感到很熟悉。
但这并不是 `Promise` 接口，它是另一种与插件通信的方式。

除了 `return xxx` 以外 你还可以 通过 `resolve(xxx)` 或 `reject()` 来控制是否运行 `Action`。
我更推荐这种方式，你可以多次调用 `resolve` 或 `reject`。并且，**只有最后一次调用的结果有效**。
你可以写很少状态机了！

要注意的是 `resolve()` 的返回值也会被当作 `Boolean` 判断是否运行 `Action`。 所以你可能需要写 `resolve(true)`。

[函数](#函数)的返回值会有其他的用处，下一章就有写。
### 自定义 ActionFunction
和 [自定义 MatcherFunction](#自定义-matcher-function) 一样，`Action` 也是可以自行实现[函数](#函数)的。
```js
// 假如消息以'教我'开头，就调用'help'命令 （会将‘教我’后面的部分传给help）
$startsWith '教我' -> session.execute(`help ${session.content.slice(2)}`)
```
上面的是一个 `ActionFunction` 的最小实现。
```js
// responder2.explain
[0]:
注释:  假如消息以`教我`开头，就调用`help`命令 （会将`教我`后面的部分传给help）
[1]:
|| 触发条件:
|| session.content.startsWith('教我')
|| ⬇️
|| 自定义回复函数:  [inline] 
|| (session, context, returnedValue) => session.execute(`help ${session.content.slice(2)}`)
```
翻译结果和上面的 `MatcherFunction` 差不多，但参数不一样。
少了 `resolve` 和 `reject`，多了 `returnedValue`。

上面提到了 函数的返回值会有其他的用处，就是它了。

`MatcherFunction` 的返回值会作为第三个参数传给 `ActionFunction`。

#### 关于 return 和 resolve() 的优先级
如果 `MatcherFunction` 调用过 `resolve(xxx)` 或 `reject()`，`return` 的值就会被忽略。传给 `ActionFunction` 的将会是 `resolve()` 的参数。
## 结构
到目前为止，本文渐进式的介绍了概念和两种Function。接下来介绍一下语言结构。

结构其实就是 `[Matcher]` -> `[Action]`。

细讲一下，有一些关键词需要介绍一下：

#### Matcher 相关的关键词
##### `incomingMessage`
每一条Matcher都需要以 `incomingMessage` 开头。前文中一直使用的 `$` 就是 `incomingMessage` 的[别名](#incomingmessage-的别名)之一。

##### `keyword`
前文中我们也提到过，除了 `===` 以外还有其他的[运算符](#keywords)。这些[运算符](#keywords)都是 `keyword`。

下面是全部的写法：

[ Matcher: `incomingMessage` + `keyword` + `Literal` ] -> [ Action: `Literal` ]
```js
$ === 'hi' -> 'hello~'
```
[ Matcher: `incomingMessage` + `keyword` + `Literal` ] -> [ Action: `ActionFunction` | `AsyncActionFunction` ]
```js
$ === 'hi' -> { session.send('hello~') }
```

`incomingMessage` 和 `MatcherFunction` 中间 需要一个 `exec` 关键词。前文中所有 `$ -> {}` 中的 `->` 就是 `exec` 关键词。 

`incomingMessage` + `exec` + `MatcherFunction` | `AsyncMatcherFunction` -> `Literal`
```js
$ -> { resolve(session.content  === 'hi') } -> 'hello~'
```
`incomingMessage` + `exec` + `MatcherFunction` | `AsyncMatcherFunction` ->  `ActionFunction` | `AsyncActionFunction`
```js
$ -> { resolve(session.content  === 'hi') } -> { session.send('hello~') }
```
## incomingMessage 的别名
|alias|example|
|--|--|
`incomingMessage`  | `incomingMessage includes 'sb'`|
`im`  | `im includes 'sb'`|
`on`  | `on includes 'sb'`|
`$`   | `$includes 'sb'`|

一些例子：
```js
$ equals 'sb' -> 'sb'
incomingMessage includes 'sb' -> '*sb*'
on startsWith 'sb' -> 'sb*'
```
## keywords
|keyword|explain|example|
|--|--|--|
`includes` | `im` includes `'string'` | `$includes 'sb'`|
`startsWith` | `im` startsWith `'string'` | `$startsWith 'sb'`|
`=` | `im` eqeq `'string'` (prints error) | `$ == 'sb'`|
`==` | `im` eqeq `'string'` | `$ == 'sb'`|
`===` | `im` eqeqeq `'string'` | `$ === 'sb'`|
`is` | `im` eqeqeq `'string'` | `$ is 'sb'`|
`equals` | `im` eqeqeq `'string'` | `$ euals 'sb'`|
|**exec keyword**|||
|`->`| `im` ->  `MatcherFunction` | `$ -> [MatcherFunction]` |
|`exec`| `im` exec  `MatcherFunction` | `$ exec [MatcherFunction]` |


## 函数
接下来我们细说函数。熟悉TS的朋友们可以看一下下面的定义：
```ts
// MatcherFunction
/* $ -> */ (
  session: Session,
  context: Context,
  resolve: (returnValue: any) => void,
  reject: () => void
): any /* -> ActionFunction | Literal */

// async MatcherFunction
/* $ -> */ async (
  session: Session,
  context: Context,
  resolve: (returnValue: any) => void,
  reject: () => void
): Promise<any> /* -> ActionFunction | Literal */

// ActionFunction
/* $ -> true -> */ (
  session: Session,
  context: Context,
  returnedValue: any
) => string | false | undefined

// async ActionFunction
/* $ -> true -> */ async (
  session: Session,
  context: Context,
  returnedValue: any
) => Promise<string | false | undefined>
```
**本插件目前只支持箭头函数的写法。**（写成 function () {} 也很没有意义拜托。。。）
#### 由于函数以外的部分并不是js语言解释的结果，书写体验与 js **略 有 不 同**。

本文到目前为止的所有例子中均只写出了 function body。
因为**函数可以省略 parameters**。
(会默认用 `session, context, resolve, reject` 作为 parameters)。

但你也可以声明函数的 parameters。 写法如下：
```js
// 这个会报错。
$ -> () => {
  // 因为没有声明任何参数，所以你没有 session, context, resolve 和 reject .
  resolve(true) // error: resolve is undefined
} -> () => {
  // 那么 ActionFunction 也就不会运行了。
  // 当然这个 ActionFunction 也拿不到 session, context 和 returnValue
}

// 使用其他 Parameter Names:
$ -> (customNameForSession, customNameForContext) => {
  return customNameForContext.user.authority > 1
} -> (session, ctx, rtnVal) => {
  session.send(`your authority: ${rtnVal}`)
}

// async 函数
$ -> async (session, ctx) => {
  const keywords = await ctx.http.get('https://example.com/triggers')
    .then(res => res.json())
  return keywords.some(keyword => session.content.includes(keyword))
} -> async (session) => {
  const reply = await session.get('https://example.com/reply', {
    message: session.content
  }).then(res => res.json())
  return reply?.message ?? reply.errorMessage ?? 'something went wrong...'
}
```

我们的函数定义真的很自由!!! 以下每一行的运行结果都是相同的：回复每条消息'???' 
```js
$ -> (customNameForSession, customNameForContext) => true -> '???'
$ -> () => { return true } -> async '???'
$ -> async { return true } -> async await '???'
$ -> async (_, _, res) => res(true) -> async () => await '???'
$ -> true -> () => '???'
$ -> async true -> async '???'
```
需要任何帮助或发现新的bug，你可以开 issue 或尝试在 discord 群组, qq 群找到我。
玩得愉快！