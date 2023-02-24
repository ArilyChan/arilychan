# nyan
koishi机器人变猫娘工具
## 参数
| 参数                              | 类型    |            默认值            | 功能                                                                               |
| --------------------------------- | ------- | :--------------------------: | ---------------------------------------------------------------------------------- |
| noises                            | Array   |           `['喵']`           | 您的bot会在最后发出什么声音?                                                       |
| transformLastLineOnly             | Boolean |            false             | 只在最后一行卖萌，默认每行都卖。                                                   |
| trailing                          | Object  |           `Object`           | 设置如何处理句尾                                                                   |
| trailing.append                   | String  |              ''              | 没有标点的句末后面会被加上这个，可以设置为比如`~`                                  |
| trailing.transform                | Array   | *`.` => `~`<br>`。` => `～`* | 替换掉句尾的标点符号，两个以上连在一起的标点符号不会被换掉。*只对标点符号有反应！* |
| trailing.transform\[].occurence   | String  |                              | 要被替换掉的标点符号                                                               |
| trailing.transform\[].replaceWith | String  |                              | 要替换为的标点符号                                                                 |
### 示例参数
```javascript
const nyanOption = {
    noises: ['喵'],
    transformLastLineOnly: false,
    trailing: {
        append: '',
        transform: [
            { occurrence: '.', replaceWith: '~' },
            { occurrence: '。', replaceWith: '～' }
        ]
    }
}

app.plugin('koishi-plugin-nyan', nyanOption)
```