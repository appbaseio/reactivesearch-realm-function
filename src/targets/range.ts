import range from 'lodash.range';
import { RangeValue, RSQuery, SingleDataField } from 'src/types/types';
import { validateSingleDataField } from 'src/validators/common';
import { validateRangeValue } from 'src/validators/range';
import { getIncludeExcludeFields } from './common';

// TODO set return type
export const getRangeQuery = (query: RSQuery<RangeValue>): any => {
	try {
		validateSingleDataField(<SingleDataField>query.dataField);
		validateRangeValue(query.value);

		let res: any = [];
		const field = Array.isArray(query.dataField)
			? query.dataField[0]
			: query.dataField;

		const search: any = {
			range: {
				path: field,
			},
		};

		if (query.value && query.value.start !== undefined) {
			search.range.gte = query.value.start;
		}

		if (query.value && query.value.end !== undefined) {
			search.range.lte = query.value.end;
		}

		if (query.value && query.value.boost !== undefined) {
			search.range.score = {
				boost: query.value.boost,
			};
		}

		const compoundQuery: any = {
			compound: {
				should: [search],
			},
		};

		if (query.index) {
			compoundQuery.index = query.index;
		}

		if (query.includeNullValues) {
			compoundQuery.compound.should.push({
				compound: {
					mustNot: [
						{
							exists: {
								path: `${field}`,
							},
						},
					],
				},
			});
		}

		res = [
			{
				$search: compoundQuery,
			},
		];

		const projectTarget = getIncludeExcludeFields(query);
		if (projectTarget) {
			res.push(projectTarget);
		}

		res.push({ $limit: query.size || 10 });
		res.push({ $skip: query.from || 0 });

		if (query.aggregations && query.aggregations.length) {
			if (query.aggregations.includes(`min`)) {
				res.push({
					$group: {
						_id: null,
						min: {
							$min: Array.isArray(query.dataField)
								? `$${query.dataField[0]}`
								: `$${query.dataField}`,
						},
					},
				});
			}
			if (query.aggregations.includes(`max`)) {
				res.push({
					$group: {
						_id: null,
						max: {
							$max: Array.isArray(query.dataField)
								? `$${query.dataField[0]}`
								: `$${query.dataField}`,
						},
					},
				});
			}
			if (query.value && query.aggregations.includes(`histogram`)) {
				if (
					query.value &&
					query.value.start === undefined &&
					query.value.end === undefined
				) {
					throw new Error(`histogram needs start and end value`);
				}

				if (query.interval === undefined) {
					throw new Error(`invalid interval`);
				}

				res.push({
					$bucket: {
						groupBy: Array.isArray(query.dataField)
							? `$${query.dataField[0]}`
							: `$${query.dataField}`,
						boundaries: range(
							<number>query.value.start,
							<number>query.value.end,
							query.interval,
						),
						default: `other`,
					},
				});
			}
		}

		return res;
	} catch (err) {
		throw err;
	}
};
