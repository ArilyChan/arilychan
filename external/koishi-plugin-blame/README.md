# koishi-plugin-blame

[![npm](https://img.shields.io/npm/v/koishi-plugin-blame?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-blame)

 notice you when unhandled error

## version
### v1
for koishi v1
### v2
for koishi v2
### v3
for koishi v3

## options

### options.catch
* type: `Array`
* for: v1, v2, v3
* default: `["unhandledRejection", "uncaughtException"]`

An array of errors or rejections. mapped as `error` in `process.on(error, handler)`
### options.send
* type: `Object`
* for: v1, v2, v3
* default: ...

Group of contact to send the error messages. (use default if you want error handling only)

**v3 requires all elements to be a string contains platform and id (formatted as `{platform}:{id}`)**
| Key | Type | Version | Default | Description | 
|-----|------|--------:|---------|-------------|
| private | Array | v1, v2, v3 | [] | Contacts you want to send the error message to.
| group | Array | v1, v2, v3 | [] | Groups you want to send the error message to.
| channel | Array | v3 | [] | Channels you want to send the error message to.<br> will be merged with `options.send.group`

### options.sender
* type: `Array`
* for: v3
* default: `[]`

Bots you want to set as a sender. requires elements to be a string contains platform and id (formatted as `{platform}:{id}`)

this plugin will find a suitable bot for you if the bot for the target platform is not exists.

the bot you defined will be prioritized.