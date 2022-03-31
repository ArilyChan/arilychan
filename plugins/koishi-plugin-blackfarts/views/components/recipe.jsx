import PropTypes from 'prop-types'
const React = require('react')
class Recipe extends React.Component {
  render () {
    // console.log(this.props)
    return (
      <li key={this.props.recipe}>
        {this.props.recipe}
      </li>
    )
  }
}
Recipe.propTypes = {
  recipe: PropTypes.string
}
module.exports = Recipe
