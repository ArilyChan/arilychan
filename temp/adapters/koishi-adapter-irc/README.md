# adapter-irc

## options

| key | type | requirement / defaults | description |
|-----|------|------------------------|-------------|
| type | String | | needs to be 'irc' |
| port | Number | default to undefined(irc defaults to 6667) | port of the irc server |
| host | String | required| host of the irc server |
| nickname | String | required | irc nick |
| username | String | | irc username (for sasl) |
| list | Array | required if server is not supporting "LIST" command | joinable channels, will fetch automatically if unset |
| password | String |  | require if server needs auth |
| ... | Any | | all params will be passed to 'node-irc' Client constructor as options. see https://node-irc.readthedocs.io/en/latest/ for more information |
