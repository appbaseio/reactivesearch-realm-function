import { ConfigType, RSFunctionQueryData, RSQuery } from './types/types';
import { getSearchQuery, getSearchSortByQuery } from './targets/search';

import { getGeoQuery } from './targets/geo';
import { getIncludeExcludeFields } from './targets/common';

export class Realm {
	config: ConfigType;

	constructor(config?: ConfigType) {
		if (config) {
			this.config = config;
		}
	}

	// TODO define type for mongo query
	query = (data: [RSQuery]): [] => {
		// TODO decide query format from set of multiple queries

		// pipeline used by mongodb aggregation
		// TODO set type as per mongo query type
		const aggPipeline: any = [];

		data.forEach((item) => {
			switch (item.type) {
				case 'search':
					aggPipeline.push(getSearchQuery(item));
					aggPipeline.push(getSearchSortByQuery(item));
					break;
				case 'geo':
					aggPipeline.push(getGeoQuery(item));
					break;
			}

			aggPipeline.push(...getIncludeExcludeFields(item));
			aggPipeline.push({ $limit: item.size || 10 });
			aggPipeline.push({ $skip: item.from || 0 });
		});

		return aggPipeline;
	};

	toRealmQuery = (data: [RSQuery]): RSFunctionQueryData => {
		return {
			config: this.config,
			searchQuery: this.query(data),
		};
	};
}
