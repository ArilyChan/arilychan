const URL = require('url').URL;
const Base = require('./Base')
module.exports = class Shake extends Base{
  constructor(attr){
    super(attr)
    this.type = 'shake'
  }

  toString(){
    return '[CQ:shake]'
  }
}