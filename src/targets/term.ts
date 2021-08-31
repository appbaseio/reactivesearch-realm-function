import { RSQuery } from 'src/types';

// TODO set return type
export const getTermQuery = (
	query: RSQuery<string | string[] | number | number[]>,
): any => {
	try {
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
	} catch (err) {
		throw err;
	}
};
