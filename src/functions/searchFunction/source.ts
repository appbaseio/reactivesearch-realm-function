// jshint ignore: start
/// <reference path="../../types/realm.d.ts" />

"use strict";

import { RSFunctionQueryData } from '../../types/types'

// @ts-ignore
export = async (payload:any) => {
    // @ts-expect-error
    const query:RSFunctionQueryData = EJSON.parse(payload.body.text());
    const { config, searchQuery } = query;
    const client = context.services.get("mongodb-atlas")
    const collection = client.db(config.database)
        .collection(config.documentCollection);
    const results = await collection.aggregate(searchQuery);
    return results
} 