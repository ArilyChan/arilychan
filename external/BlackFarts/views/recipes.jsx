import propTypes from 'prop-types'
const React = require('react')
const DefaultLayout = require('./layouts/default.jsx')
const Menu = require('./components/menu.jsx')
function HelloMessage (props) {
  return (
    <DefaultLayout title={props.title}>
      return (<div>
        {Object.entries(props.recipes).map(([menu, recipes]) => {
          if (recipes.length) { return <Menu menu={menu} recipes={recipes} key={`menu-${menu}`} /> }
        }
        )}
      </div>)
    </DefaultLayout>
  )
}
HelloMessage.propTypes = {
  title: propTypes.string,
  recipes: propTypes.object
}
module.exports = HelloMessage
