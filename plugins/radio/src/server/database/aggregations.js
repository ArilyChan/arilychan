export function newerThan (date) {
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
  ]
}
export function sortByInsertionOrderDesc () {
  return [
    {
      $sort: {
        _id: -1
      }
    }
  ]
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
  ]
}
