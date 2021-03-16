const URL = require('url').URL;
const Base = require('./Base')
module.exports = class Music extends Base{
  constructor(attr){
    super(attr)
    this.type = 'music'
    this.attrtibutes.type = 'qq'
    this.attrtibutes.style = 1
  }

  id(id){
    this.attrtibutes.id = id
    return this
  }
  
  type(type){
    this.attrtibutes.type = type
    return this
  }

  style(style){
    if (style) this.attrtibutes.style = 1
    else delete this.attrtibutes.style
    return this
  }

  testRequiredFields(){
    if (!this.attrtibutes.title) throw new Error('need titles')
    try {
      new URL(this.attrtibutes.url)
    } catch (error) {
      throw new Error('url invalid')
    }
  }
}