'use strict'

class AskObject {
  constructor (message) {
    this.ask = message

    // this.replaceCQObjects = []
    // this.replaceCQTexts = []

    // this.replaceQuoteObjects = []
    // this.replaceQuoteTexts = []
  }

  // 取最后一句话
  getLastSentence () {
    this.ask = this.ask.match(/[^,，。]+$/g)[0]
  }

  // html转意符换成普通字符
  escape2Html () {
    const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' }
    this.ask = this.ask.replace(/&(lt|gt|nbsp|amp|quot);/ig, (all, t) => { return arrEntities[t] })
  }

  // 删除换行符
  removeReturn () {
    this.ask = this.ask.replace(/\r?\n/g, '')
  }

  // 将CQCode保存起来并用其他字符替换
  cutCQCode () {
    // TODO no longer supported

    // this.ask = this.ask.replace(/\[(.+?)\]/g, (matchString, group, index) => {
    //   const replacedIndex = this.replaceCQObjects.indexOf(matchString)
    //   if (replacedIndex < 0) {
    //     const replaceText = '[cqObject' + index + ']'
    //     this.replaceCQTexts.push(replaceText)
    //     this.replaceCQObjects.push(matchString)
    //     return replaceText
    //   }
    //   return this.replaceCQTexts[replacedIndex]
    // })
  }

  // 将引用保存起来并用其他字符替换
  cutQuote () {
    // TODO no longer supported

    // this.ask = this.ask.replace(/["'“【「『《](.+?)["'”】」』》]/g, (matchString, group, index) => {
    //   const replacedIndex = this.replaceQuoteObjects.indexOf(matchString)
    //   if (replacedIndex < 0) {
    //     const replaceText = '[quoteObject' + index + ']'
    //     this.replaceQuoteTexts.push(replaceText)
    //     this.replaceQuoteObjects.push(matchString)
    //     return replaceText
    //   }
    //   return this.replaceQuoteTexts[replacedIndex]
    // })
  }

  // 将CQCode替换回去
  reputCQCode (replyMsg) {
    // TODO no longer supported
    return replyMsg
    // return replyMsg.replace(/\[(cqObject[0-9]+)\]/g, (matchString) => {
    //   const replacedIndex = this.replaceCQTexts.indexOf(matchString)
    //   if (replacedIndex < 0) return matchString
    //   return this.replaceCQObjects[replacedIndex]
    // })
  }

  // 将引用替换回去
  reputQuote (replyMsg) {
    // TODO no longer supported
    return replyMsg
    // return replyMsg.replace(/\[(quoteObject[0-9]+)\]/g, (matchString) => {
    //   const replacedIndex = this.replaceQuoteTexts.indexOf(matchString)
    //   if (replacedIndex < 0) return matchString
    //   return this.replaceQuoteObjects[replacedIndex]
    // })
  }

  // 为避免文字后续处理错误，先替换掉特殊格式字符
  removeSpecialStrings () {
    // 注意顺序
    this.escape2Html()
    this.removeReturn()
    // this.cutCQCode()
    // this.cutQuote()
    // this.getLastSentence()
    return this.ask
  }

  // 将特殊格式字符替换回去
  reputSpecialStrings (str) {
    // 注意顺序
    return this.reputCQCode(this.reputQuote(str))
  }
}

module.exports = AskObject
