import { RSQuery } from 'src/types';

// TODO set return type
//
// Target remains $search for geo query as well
// ref: https://docs.atlas.mongodb.com/reference/atlas-search/geoWithin/
export const getGeoQuery = (query: RSQuery): any => {
	const search: any = {
		geoWithin: {
			circle: query.value,
			path: query.dataField,
		},
	};

	if (query.index) {
		search.index = query.index;
	}

	return {
		$search: search,
	};
};
