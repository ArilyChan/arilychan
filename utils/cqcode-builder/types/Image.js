const Base = require('./Base')
module.exports = class Image extends Base{
  constructor(attr){
    super(attr)
    this.type = 'image'
  }

  cache(cache){
    if(cache) { delete this.attrtibutes }
    else { this.attrtibutes.cache = 0 }
    return this
  }

  url(url){
    this.attrtibutes.url = url
    return this
  }

  file(file){
    this.attrtibutes.title = title
    return this
  }
}