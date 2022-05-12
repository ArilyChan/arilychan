declare module '@koishijs/plugin-console' {
  // eslint-disable-next-line no-unused-vars
  interface Events {
    'toolkit/assignee/searchChannel'(channle: string):void
  }
}

export interface ChannelRow {
  type: 'channel',
  id: string,
  platform: string,
}
export interface AssigneeRow {
  type: 'assignee'
  assignee: string,
  selects: Array<Partial<ChannelRow> & Pick<ChannelRow, 'id' | 'platform'>>
}
export interface PlatformRow {
  type: 'platform'
  platform: string,
  selects: Array<Partial<ChannelRow> & Pick<ChannelRow, 'id'>>
}
export type SearchChannelResult =
  ChannelRow | AssigneeRow | PlatformRow
