import { is } from 'typescript-is';
import range from 'lodash.range';
import { RangeValue, RSQuery, SingleDataField } from 'src/types';

// TODO set return type
export const getRangeQuery = (query: RSQuery): any => {
	try {
		// validate dataField
		if (!is<SingleDataField>(query.dataField)) {
			throw new Error(`invalid dataField value`);
		}

		if (!is<RangeValue>(query.value)) {
			throw new Error(`invalid value`);
		}

		let res: any = [];

		if (query.size) {
			const field = Array.isArray(query.dataField)
				? query.dataField[0]
				: query.dataField;

			const rangeValue = <RangeValue>query.value;

			let search: any = {
				range: {
					path: field,
				},
			};

			if (rangeValue.start !== undefined) {
				search.range.gte = query.value.start;
			}

			if (rangeValue.end !== undefined) {
				search.range.lte = query.value.end;
			}

			if (rangeValue.boost !== undefined) {
				search.range.score = {
					boost: rangeValue.boost,
				};
			}

			if (query.index) {
				search.index = query.index;
			}

			res = [
				{
					$search: search,
				},
				{ $limit: query.size || 10 },
				{ $skip: query.from || 0 },
			];

			console.log({ res: JSON.stringify(res) });

			// TODO add support for includeNullValues using compound query
			if (query.includeNullValues) {
				search = {
					compound: {
						should: [search],
						mustNot: [
							{
								exists: {
									path: field,
								},
							},
						],
					},
				};

				if (query.index) {
					search.index = query.index;
				}

				res = [
					{
						$search: search,
					},
					{ $limit: query.size || 10 },
					{ $skip: query.from || 0 },
				];
			}
		}

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
			if (query.aggregations.includes(`histogram`)) {
				if (query.value.start === undefined && query.value.end === undefined) {
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
