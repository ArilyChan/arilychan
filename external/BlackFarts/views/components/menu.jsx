import PropTypes from 'prop-types'
const React = require('react')
const Recipe = require('./recipe.jsx')
class Menu extends React.Component {
  render () {
    return (
      <div key={this.props.menu}>
        <h2>{this.props.menu}:</h2>
        <ul>
          {this.props.recipes.map((recipe) => <Recipe recipe={recipe} key={`recipe-${this.props.menu}-${recipe}`}/>) }
        </ul>
      </div>
    )
  }
}
Menu.propTypes = {
  recipes: PropTypes.array,
  menu: PropTypes.string
}
module.exports = Menu
