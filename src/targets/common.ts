import {
	ALL_FIELDS,
	EXCLUDE_FIELD,
	FUZZINESS_AUTO,
	INCLUDE_FIELD,
} from '../constants';
import { DataField, RSQuery } from '../types/types';

export const getStringFieldsFromDataField = (
	dataField: string | Array<string | DataField> | undefined,
): string[] | null => {
	let fields = null;
	if (dataField) {
		if (typeof dataField === 'string') {
			fields = [dataField];
		} else {
			// It's an array
			if (dataField.length > 0) {
				const queryField = dataField[0];
				if (typeof queryField === 'string' || queryField instanceof String) {
					fields = dataField as string[];
				} else {
					fields = dataField.map((value: any) => value.field);
				}
			}
		}
	}
	return fields;
};

export const getFieldsFromDataField = (
	fields: string | Array<string | DataField> | undefined,
): DataField[] | null => {
	let dataFields: DataField[] | null = null;
	if (fields) {
		if (typeof fields === 'string') {
			dataFields = [{ field: fields, weight: 1 }];
		} else {
			// It's an array
			if (fields.length > 0) {
				const queryField = fields[0];
				if (typeof queryField === 'string' || queryField instanceof String) {
					dataFields = fields.map((field) => ({
						field: field as string,
						weight: 1,
					}));
				} else {
					dataFields = fields as DataField[];
				}
			}
		}
	}
	return dataFields;
};

export const getIncludeExcludeFields = (query: RSQuery<any>): any => {
	let { includeFields = [], excludeFields = [], highlight } = query;

	if (
		includeFields.length === 0 &&
		excludeFields.length === 0 &&
		highlight !== true
	) {
		return null;
	}

	if (excludeFields.includes(ALL_FIELDS)) {
		return {
			$project: {
				_0923biu3g4h: INCLUDE_FIELD,
			},
		};
	}

	if (includeFields.includes(ALL_FIELDS)) {
		if (excludeFields.length === 0) {
			// Don't run the pipeline
			return null;
		} else {
			includeFields = includeFields.filter((item) => item !== ALL_FIELDS);
		}
	}

	// Exclude pipeline should be run before include
	let excludeAggregation = {},
		includeAggregation = {};
	if (excludeFields.length > 0) {
		excludeAggregation = Object.assign(
			{},
			...Array.from(excludeFields, (field) => ({ [field]: EXCLUDE_FIELD })),
		);
	}

	if (includeFields.length > 0) {
		includeAggregation = Object.assign(
			{},
			...Array.from(includeFields, (field) => ({ [field]: INCLUDE_FIELD })),
		);
	}

	const res = {
		$project: { ...excludeAggregation, ...includeAggregation },
	};

	if (highlight) {
		res.$project = {
			...res.$project,
			highlights: { $meta: 'searchHighlights' },
		};
	}

	if (Object.keys(res).length) {
		return res;
	}

	return null;
};

export const getPaginationMap = (query: RSQuery<any>) => {
	const hits: any = [];
	let size = query.size;

	if (query.from) {
		hits.push({ $skip: query.from });
	}

	if (size && size < 0) {
		throw new Error(`Invalid size. Size should be >= 0`);
	}

	if (size === undefined) {
		size = 10;
	}

	if (size === 0) {
		size = 1;
	}

	hits.push({ $limit: query.size || 10 });
	return {
		$facet: {
			hits,
			total: [
				{
					$count: 'count',
				},
			],
		},
	};
};

export const generateTermRelevantQuery = (
	relevantRSQuery: RSQuery<string | string[] | number | number[]>,
): any => {
	let isValidValue = Boolean(relevantRSQuery.value);
	if (Array.isArray(relevantRSQuery.value) && !relevantRSQuery.value.length) {
		isValidValue = false;
	}
	// allow value like 0
	if (
		!Array.isArray(relevantRSQuery.value) &&
		typeof relevantRSQuery.value === 'number'
	) {
		isValidValue = true;
	}

	if (isValidValue) {
		if (relevantRSQuery.queryFormat === 'and') {
			let filter: any = {};
			if (Array.isArray(relevantRSQuery.value)) {
				filter = relevantRSQuery.value.map((v) => ({
					phrase: {
						query: [v],
						path: relevantRSQuery.dataField,
					},
				}));
			} else {
				filter = [
					{
						phrase: {
							query: [relevantRSQuery.value],
							path: relevantRSQuery.dataField,
						},
					},
				];
			}
			return {
				compound: {
					filter,
				},
			};
		}
		// by default returns for OR query format
		return {
			compound: {
				filter: {
					phrase: {
						query: Array.isArray(relevantRSQuery.value)
							? relevantRSQuery.value
							: [relevantRSQuery.value],
						path: relevantRSQuery.dataField,
					},
				},
			},
		};
	}

	return null;
};

export const getFuzziness = (
	query: RSQuery<string>,
):
	| {
		fuzzy: {
			maxEdits: number;
		};
	}
	| {} => {
	const queryLength = query?.value?.length || 0;
	let fuzziness: string | number | undefined = query.fuzziness;

	if (fuzziness === undefined) {
		return {};
	}

	if (typeof fuzziness === 'string') {
		if (fuzziness.toUpperCase() === FUZZINESS_AUTO) {
			if (queryLength > 5) {
				fuzziness = 2;
			} else if (queryLength >= 3) {
				fuzziness = 1;
			} else {
				fuzziness = 0;
			}
		} else {
			if (isNaN(Number(fuzziness))) {
				return {};
			}
			fuzziness = parseInt(fuzziness);
		}
	}
	if (fuzziness > 2) {
		throw new Error("Fuzziness value can't be greater than 2");
	}
	if (fuzziness === 0) {
		return {};
	}
	return {
		fuzzy: {
			maxEdits: fuzziness,
		},
	};
};

export const getSynonymsQuery = (query: RSQuery<string>): any => {
	const { enableSynonyms, synonymsField, value, dataField } = query;

	if (enableSynonyms && synonymsField) {
		const fields = getStringFieldsFromDataField(dataField);
		if (fields) {
			return {
				text: {
					query: value,
					path: fields,
					synonyms: synonymsField,
				},
			};
		}
	}
	return null;
};

export const getAutoCompleteQuery = (query: RSQuery<string>): any => {
	const { autocompleteField, value } = query;
	let fields: DataField[] | null = getFieldsFromDataField(autocompleteField);
	if (fields) {
		const fuzziness = getFuzziness(query);
		return {
			compound: {
				should: fields.map((x) => ({
					autocomplete: {
						path: x.field,
						query: value,
						score: { boost: { value: x.weight } },
						...fuzziness,
					},
				})),
			},
		};
	}
	return null;
};

export const getPhraseQuery = (query: RSQuery<string>): any => {
	const { value } = query;
	let fields: DataField[] | null = getFieldsFromDataField(query.dataField);
	if (fields) {
		return {
			compound: {
				should: fields.map((x) => ({
					phrase: {
						path: x.field,
						query: value,
						score: { boost: { value: x.weight } },
					},
				})),
			},
		};
	}
	return null;
};
