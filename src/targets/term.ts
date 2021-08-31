import { is } from 'typescript-is';
import { RSQuery, SingleDataField } from 'src/types';

// TODO set return type
export const getTermQuery = (query: RSQuery): any => {
	try {
		if (!is<SingleDataField>(query.dataField)) {
			throw new Error(`invalid dataField value`);
		}

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
