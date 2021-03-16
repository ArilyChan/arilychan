const Base = require('./Base')
module.exports = class Poke extends Base{
  constructor(attr){
    super(attr)
    this.type = 'poke'
  }

  qq(qq){
    this.attrtibutes.qq = qq
    return this
  }
}