import { getGeoQuery } from './targets/geo';
import { getSearchQuery } from './targets/search';
import { ConfigType, RSQuery } from './types';

export class Realm {
	config: ConfigType;

	constructor(config?: ConfigType) {
		if (config) {
			this.config = config;
		}
	}

	// TODO define type for mongo query
	query = (data: [RSQuery]) => {
		// TODO decide query format from set of multiple queries

		// pipeline used by mongodb aggregation
		// TODO set type as per mongo query type
		const aggPipeline: any = [];

		data.forEach((item) => {
			if (item.type === `search`) {
				aggPipeline.push(getSearchQuery(item));
			}

			if (item.type === `geo`) {
				aggPipeline.push(getGeoQuery(item));
			}

			aggPipeline.push({ $limit: item.size || 10 });
			aggPipeline.push({ $skip: item.from || 0 });
		});

		return aggPipeline;
	};
}
