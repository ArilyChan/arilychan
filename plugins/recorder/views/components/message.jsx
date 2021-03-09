const React = require("react");
// import the react-json-view component
// import ReactJson from 'react-json-view'
// const ReactJson = require("react-json-view").default;

// module.exports = function (this.props) {
//   const show = false;

// };
class Message extends React.Component {
  constructor(props) {
    super(props);
    // this.show = this.show.bind(this);
    // this.state = { showUser: false };
  }

  // show() {
  //   this.setState((state, props) => ({
  //     show: !state.show,
  //   }));
  // }

  render() {
    return (
      <p key={this.props.message.messageId}>
        <span onClick={this.show}>
          {this.props.message.sender.nickname}(
          {this.props.message.sender.userId})
          {["group", "discuss"].includes(this.props.message.messageType)
            ? "@".concat(this.props.message.groupId)
            : ""}
          :
        </span>
        <span>{this.props.message.message}</span>
        {/* {show && <ReactJson src={my_json_object} />} */}
      </p>
    );
  }
}
module.exports = Message;
