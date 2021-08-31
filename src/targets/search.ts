import { ASCENDING, DESCENDING } from 'src/constants';
import { DataField, RSQuery } from 'src/types/types';

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

export const getSearchSortByQuery = (query: RSQuery): any => {
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
			}
		} else {
			field = query.dataField as string;
		}
	}
	/*
		From MongoDB documentation
		 In the { <sort-key> } document, set the { $meta: "textScore" } expression 
		 to an arbitrary field name. The field name is ignored by the query system.
	*/
	return { $sort: { score: { $meta: 'textScore' }, [field]: sortBy } };
};
