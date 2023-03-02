"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playlistUniqueBySid = exports.sortByInsertionOrderDesc = exports.newerThan = void 0;
function newerThan(date) {
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
    ];
}
exports.newerThan = newerThan;
function sortByInsertionOrderDesc() {
    return [
        {
            $sort: {
                _id: -1
            }
        }
    ];
}
exports.sortByInsertionOrderDesc = sortByInsertionOrderDesc;
function playlistUniqueBySid() {
    return [
        {
            $group: {
                _id: '$sid',
                doc: { $first: '$$ROOT' }
            }
        }, {
            $replaceRoot: { newRoot: '$doc' }
        }
    ];
}
exports.playlistUniqueBySid = playlistUniqueBySid;
