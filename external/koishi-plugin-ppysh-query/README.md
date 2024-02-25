# koishi-plugin-ppysh-query

### 使用
```javascript
config = {
    admin: ["123456"], // 管理员列表，必要
    apiKey: "把你的apiKey放这里", // osu Api token，必要
    // 以下都可省略
    host: "osu.ppy.sh", // osu网址，默认为"osu.ppy.sh"
    database: "./Opsbot-v1.db", // 数据库路径，默认为根目录下的Opsbot-v1.db
    prefixs: ["?", "？"], // 指令前缀，必须为单个字符，默认为["?", "？"]
    // 以下只是为了兼容旧版，不再使用
    // prefix: "*", // 指令前缀，必须为单个字符，默认为*
    // prefix2: "%" // 备用指令前缀，必须为单个字符，默认为%
}
```