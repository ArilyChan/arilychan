export function newerThan (date: Date) {
  return [
    {
      $addFields: {
        insertDate: {
          $toDate: '$_id'
        }
      }
    }, {
      $match: {
        insertDate: {
          $gt: date
        }
      }
    }
  ] as const
}
export function sortByInsertionOrderDesc () {
  return [
    {
      $sort: {
        _id: -1
      }
    }
  ] as const
}
export function playlistUniqueBySid () {
  return [
    {
      $group: {
        _id: '$sid',
        doc: { $first: '$$ROOT' }
      }
    }, {
      $replaceRoot: { newRoot: '$doc' }
    }
  ] as const
}
