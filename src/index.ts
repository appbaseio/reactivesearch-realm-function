import { ConfigType } from './types/types';
import { getGeoQuery } from './targets/geo';
import { getRangeQuery } from './targets/range';
import { getSearchQuery } from './targets/search';
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

		return data.map((item) => {
			if (item.type === `search`) {
				return getSearchQuery(item);
			}

			if (item.type === `geo`) {
				return getGeoQuery(item);
			}

			if (item.type == `term`) {
				return getTermQuery(item);
			}

			if (item.type == `range`) {
				return getRangeQuery(item);
			}
		});
	};
}
