export declare function newerThan(date: Date): readonly [{
    readonly $addFields: {
        readonly insertDate: {
            readonly $toDate: "$_id";
        };
    };
}, {
    readonly $match: {
        readonly insertDate: {
            readonly $gt: Date;
        };
    };
}];
export declare function sortByInsertionOrderDesc(): readonly [{
    readonly $sort: {
        readonly _id: -1;
    };
}];
export declare function playlistUniqueBySid(): readonly [{
    readonly $group: {
        readonly _id: "$sid";
        readonly doc: {
            readonly $first: "$$ROOT";
        };
    };
}, {
    readonly $replaceRoot: {
        readonly newRoot: "$doc";
    };
}];
