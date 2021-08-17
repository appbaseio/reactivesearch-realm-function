import { RSQuery } from 'src/types';

// TODO set return type
export const getSearchQuery = (query: RSQuery): any => {
	return {
		$search: {
			index: query.index || `default`,
			text: {
				query: query.value,
				path: query.dataField,
			},
		},
	};
};
