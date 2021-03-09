var React = require("react");
var DefaultLayout = require("./layouts/default.jsx");

function HelloMessage(props) {
  return (
    <DefaultLayout title={props.title}>
      <div>Hello {props.name}</div>
    </DefaultLayout>
  );
}

module.exports = HelloMessage;
