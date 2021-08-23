/// <reference path="../../types/realm.d.ts" />

import {searchQuery} from '../../types/searchQuery'

exports = async ( query: searchQuery) => {
    const client = context.services.get("mongodb-atlas")
    const collection =  client.db(query.database)
                            .collection(query.documentCollection);
    const results = await collection.aggregate([
        {
            $search: {
                index: query.index,
                text: {
                    query: query.query,
                }
            }
        },
        { $limit: query.limit }
    ]);
    return results
}