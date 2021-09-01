import { ALL_FIELDS, EXCLUDE_FIELD, INCLUDE_FIELD } from 'src/constants';

import { RSQuery } from 'src/types/types';

export const getIncludeExcludeFields = (query: RSQuery): any[] => {
	const { includeFields = [], excludeFields = [] } = query;

	if (ALL_FIELDS in includeFields) {
		// Don't run the pipeline
		return [];
	}
	if (ALL_FIELDS in excludeFields) {
		return [
			{
				$project: {
					_0923biu3g4h: INCLUDE_FIELD,
				},
			},
		];
	}

	const aggPipeline: any = [];

	// Exclude pipeline should be run before include
	if (excludeFields.length > 0) {
		const excludeAggregation = Object.assign(
			{},
			...Array.from(excludeFields, (field) => ({ [field]: EXCLUDE_FIELD })),
		);
		aggPipeline.push({ $project: excludeAggregation });
	}

	if (includeFields.length > 0) {
		const includeAggregation = Object.assign(
			{},
			...Array.from(includeFields, (field) => ({ [field]: INCLUDE_FIELD })),
		);
		aggPipeline.push({ $project: includeAggregation });
	}
	return aggPipeline;
};
