import propTypes from 'prop-types'
var React = require('react')
const style = `
html {
  font-family: "Indie Flower";
}
body {
  background-image: url("/BlackFarts/art/spikes.png");
  background-repeat: repeat-all;
}
ul {
  list-style: none;
  columns: 4;
  -webkit-columns: 4;
  -moz-columns: 4;
}`
function DefaultLayout (props) {
  return (
    <html>
      <style dangerouslySetInnerHTML={{ __html: style }}></style>
      <head>
        <title>{props.title}</title>
      </head>
      <body>{props.children}</body>
    </html>
  )
}
DefaultLayout.propTypes = {
  title: propTypes.string,
  children: propTypes.element
}
module.exports = DefaultLayout
