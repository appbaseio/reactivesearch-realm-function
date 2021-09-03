import { ASCENDING, DESCENDING } from '../../src/constants';

import { RSQuery } from 'src/types/types';

// TODO set return type
export const getSearchQuery = (query: RSQuery<string>): any => {
	const search: any = {
		text: {
			query: query.value,
			path: query.dataField,
		},
	};

	if (query.index) {
		search.index = query.index;
	}

	return [
		{ $search: search },
		{ $limit: query.size || 10 },
		{ $skip: query.from || 0 },
	];
};

export const getSearchSortByQuery = (query: RSQuery<string>): any => {
	let sortBy = DESCENDING;
	let field: string = '_id';
	if (query.sortBy) {
		sortBy = query.sortBy === `asc` ? ASCENDING : DESCENDING;
	}
	if (query.dataField) {
		if (Array.isArray(query.dataField)) {
			if (query.dataField.length > 0) {
				const queryField = query.dataField[0];
				if (typeof queryField === 'string' || queryField instanceof String) {
					field = queryField as string;
				} else {
					field = queryField.field;
				}
			} else {
				/*
					From MongoDB documentation
					In the { <sort-key> } document, set the { $meta: "textScore" } expression 
					to an arbitrary field name. The field name is ignored by the query system.
				*/
				return { $sort: { score: { $meta: 'textScore' }, [field]: sortBy } };
			}
		} else {
			field = query.dataField as string;
		}
		return { $sort: { [field]: sortBy } };
	} else {
		/*
			From MongoDB documentation
			In the { <sort-key> } document, set the { $meta: "textScore" } expression 
			to an arbitrary field name. The field name is ignored by the query system.
		*/
		return { $sort: { score: { $meta: 'textScore' }, [field]: sortBy } };
	}
};
