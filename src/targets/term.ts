import { RSQuery } from 'src/types';
import { validateSingleDataField } from 'src/utils';

// TODO set return type
export const getTermQuery = (query: RSQuery): any => {
	try {
		validateSingleDataField(<string | string[]>query.dataField);

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
