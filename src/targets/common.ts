import {
	ALL_FIELDS,
	EXCLUDE_FIELD,
	FUZZINESS_AUTO,
	INCLUDE_FIELD,
} from '../constants';
import { DataField, RSQuery } from 'src/types/types';

export const getFieldsFromDataField = (
	dataField: string | Array<string | DataField> | undefined,
) => {
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

export const getIncludeExcludeFields = (query: RSQuery<any>): any => {
	let { includeFields = [], excludeFields = [] } = query;

	if (includeFields.length === 0 && excludeFields.length === 0) {
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

	if (query.highlight) {
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
			return {};
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
	const { fuzziness, enableSynonyms, synonymsField, value, dataField } = query;
	if (fuzziness && enableSynonyms) {
		throw new Error("Fuzziness and Synonyms can't be used together");
	}

	if (enableSynonyms) {
		const fields = getFieldsFromDataField(dataField);
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
	if (autocompleteField) {
		return {
			autocomplete: {
				query: value,
				path: autocompleteField,
				...getFuzziness(query),
			},
		};
	}
	return null;
};
