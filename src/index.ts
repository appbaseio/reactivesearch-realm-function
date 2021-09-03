import { ConfigType, RSFunctionQueryData, RSQuery } from './types/types';
import { getSearchQuery, getSearchSortByQuery } from './targets/search';

import { getGeoQuery } from './targets/geo';
import { getIncludeExcludeFields } from './targets/common';
import { getRangeQuery } from './targets/range';
import { getTermQuery } from './targets/term';

export class Realm {
	config: ConfigType;

	constructor(config?: ConfigType) {
		if (config) {
			this.config = config;
		}
	}

	// TODO define type for mongo query
	query = (data: any[]) => {
		// TODO decide query format from set of multiple queries

		// pipeline used by mongodb aggregation
		// TODO set type as per mongo query type
		let aggPipeline: any = [];

		data.forEach((item) => {
			if (item.type === `search`) {
				aggPipeline = [...aggPipeline, ...getSearchQuery(item)];
			}

			if (item.type === `geo`) {
				aggPipeline = [...aggPipeline, ...getGeoQuery(item)];
			}

			if (item.type == `term`) {
				aggPipeline.push(getTermQuery(item));
			}

			if (item.type == `range`) {
				aggPipeline = [...aggPipeline, ...getRangeQuery(item)];
			}
		});

		return aggPipeline;
	};

	toRealmQuery = (data: [RSQuery<any>]): RSFunctionQueryData => {
		return {
			config: this.config,
			searchQuery: this.query(data),
		};
	};
}
