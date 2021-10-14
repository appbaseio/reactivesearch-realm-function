import { ASCENDING, DESCENDING } from '../constants';
import { DataField, RSQuery } from '../types/types';
import {
	getAutoCompleteQuery,
	getFieldsFromDataField,
	getFuzziness,
	getIncludeExcludeFields,
	getPaginationMap,
	getStringFieldsFromDataField,
	getSynonymsQuery,
} from './common';

export const getSearchAggregation = (
	query: RSQuery<string>,
	isWildCardHighlightSearch: boolean = false,
): any => {
	const { value, dataField, highlightField } = query;
	const fields = getFieldsFromDataField(dataField);
	if (fields) {
		const fuzziness = getFuzziness(query);
		const search = {
			compound: {
				must: fields.map((x) => ({
					text: {
						path:
							x.field === '*' || isWildCardHighlightSearch
								? { wildcard: isWildCardHighlightSearch ? highlightField : '*' }
								: x.field,
						query: value,
						score: { boost: { value: x.weight } },
						...fuzziness,
					},
				})),
			},
		};
		return search;
	}
	return null;
};

// TODO set return type
export const getSearchQuery = (query: RSQuery<string>): any => {
	try {
		let searchQuery: any = [];
		const { value } = query;

		if (value && value.length) {
			const shouldAggregation = [];
			const highlightQuery = getHighlightQuery(query);
			const isWildCardHighlightSearch =
				highlightQuery?.highlight?.path?.wildcard !== undefined;

			const search = getSearchAggregation(query, isWildCardHighlightSearch);
			if (search) {
				shouldAggregation.push(search);
			}

			const synonyms = getSynonymsQuery(query);
			if (synonyms) {
				shouldAggregation.push(synonyms);
			}

			const autocomplete = getAutoCompleteQuery(query);
			if (autocomplete) {
				shouldAggregation.push(autocomplete);
			}

			const compoundQuery: any = {
				compound: {
					should: shouldAggregation,
				},
			};

			const q = { $search: { ...compoundQuery, ...highlightQuery } };
			if (query.index) {
				q.$search.index = query.index;
			}
			searchQuery.push(q);
		}

		const projectTarget = getIncludeExcludeFields(query);
		if (projectTarget) {
			searchQuery.push(projectTarget);
		}

		if (query.sortBy) {
			searchQuery.push(getSearchSortByQuery(query));
		}

		searchQuery.push(getPaginationMap(query));

		return searchQuery;
	} catch (err) {
		throw err;
	}
};

export const getSearchSortByQuery = (query: RSQuery<string>): any => {
	let sortBy = DESCENDING;
	let field: string = '_id';
	if (query.sortBy) {
		sortBy = query.sortBy === `asc` ? ASCENDING : DESCENDING;
	}
	if (query.dataField) {
		const _field = _getFirstDataFieldValue(query.dataField);
		if (_field) {
			field = _field;
		} else {
			return { $sort: { score: { $meta: 'textScore' }, [field]: sortBy } };
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

export const getQueryStringQuery = (query: RSQuery<string>): any => {
	const { queryString = false, dataField, value } = query;
	if (queryString && dataField && value) {
		const field = _getFirstDataFieldValue(dataField);
		if (field) {
			return {
				queryString: {
					defaultPath: field,
					query: value,
				},
			};
		}
	}
	return {};
};

const _getFirstDataFieldValue = (
	dataField: string | Array<string | DataField>,
): string | null => {
	let field = null;
	if (Array.isArray(dataField)) {
		if (dataField.length > 0) {
			const queryField = dataField[0];
			if (typeof queryField === 'string' || queryField instanceof String) {
				field = queryField as string;
			} else {
				field = queryField.field;
			}
		}
	} else {
		field = dataField as string;
	}
	return field;
};

export const getHighlightQuery = (query: RSQuery<string>): any => {
	const {
		highlight = false,
		highlightField,
		highlightConfig,
		dataField,
	} = query;
	const { maxCharsToExamine = 500000, maxNumPassages = 5 } =
		highlightConfig || {};

	if (highlight) {
		let fields: string[] | Object = [];
		if (highlightField) {
			if (typeof highlightField === 'string') {
				if (highlightField.indexOf('*') > -1) {
					fields = {
						wildcard: highlightField,
					};
				} else {
					fields = [highlightField as string];
				}
			} else {
				fields = highlightField as string[];
			}
		} else {
			const _fields = getStringFieldsFromDataField(dataField);
			if (_fields) {
				fields = _fields;
			} else {
				return {};
			}
		}
		return {
			highlight: {
				path: fields,
				maxCharsToExamine,
				maxNumPassages,
			},
		};
	} else {
		return {};
	}
};
