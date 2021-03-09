const React = require("react");
const DefaultLayout = require("./layouts/default.jsx");
const message = require("./components/message.jsx");

function HelloMessage(props) {
  const ElementsOfMessage = props.messages.map((m) =>
    new message({ message: m }).render()
  );
  return (
    <DefaultLayout title={props.title}>
      <div>{ElementsOfMessage}</div>
    </DefaultLayout>
  );
}

module.exports = HelloMessage;
