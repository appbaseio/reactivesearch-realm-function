/// <reference path="../../types/realm.d.ts" />

import { RSFunctionQueryData } from '../../types/types'

exports = async (query: RSFunctionQueryData) => {
    const { config, searchQuery } = query;
    const client = context.services.get("mongodb-atlas")
    const collection = client.db(config.database)
        .collection(config.documentCollection);
    const results = await collection.aggregate(searchQuery);
    return results
}