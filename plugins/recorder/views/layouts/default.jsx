var React = require("react");

function DefaultLayout(props) {
  return (
    <html>
      <head>
        <title>{props.title}</title>
      </head>
      <body>{props.children}</body>
    </html>
  );
}
module.exports = DefaultLayout;
