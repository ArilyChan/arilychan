const Base = require('./Base')
module.exports = class Face extends Base{
  constructor(attr){
    super(attr)
    this.type = 'face'
  }

  id(id){
    this.attrtibutes.id = id
    return this
  }
}