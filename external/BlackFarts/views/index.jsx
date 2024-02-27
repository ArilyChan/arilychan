import propTypes from 'prop-types'

const React = require('react')
const DefaultLayout = require('./layouts/default.jsx')

function HelloMessage(props) {
  return (
    <DefaultLayout title={props.title}>
      <div>
        Hello
        {props.name}
      </div>
    </DefaultLayout>
  )
}
HelloMessage.propTypes = {
  title: propTypes.string,
  name: propTypes.string,
}
module.exports = HelloMessage
