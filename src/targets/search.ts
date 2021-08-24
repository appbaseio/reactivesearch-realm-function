import { RSQuery } from 'src/types/types';

// TODO set return type
export const getSearchQuery = (query: RSQuery): any => {
	const search: any = {
		text: {
			query: query.value,
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
