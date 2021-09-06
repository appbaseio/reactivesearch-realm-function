import { RSQuery, SingleDataField } from 'src/types/types';
import { validateSingleDataField } from 'src/validators/common';

// TODO set return type
export const getTermQuery = (
	query: RSQuery<string | string[] | number | number[]>,
): any => {
	try {
		validateSingleDataField(<SingleDataField>query.dataField);
		const search: any = {};
		const res = [];

		if (query.index) {
			search.index = query.index;
		}

		// const isArrayVal = Array.isArray(query.value);
		// const queryFormat = query.queryFormat || `or`;
		const isArrayField = Array.isArray(query.dataField);
		const field = `${
			query.dataField && isArrayField ? query.dataField[0] : query.dataField
		}`;

		/**
		if (queryFormat === `or`) {
			search.compound = {
				filter: {
					text: {
						query: isArrayVal ? query.value : [query.value],
						path: query.dataField,
					},
				},
			};

			res.push({
				$search: search,
			});
		}
    */

		/**
     if (query.queryFormat === 'and' && Array.isArray(query.value)) {
			const filter = query.value.map((item) => ({
				text: {
					query: [item],
					path: query.dataField,
				},
			}));
			search.compound = {
				filter,
			};

			res.push({
				$search: search,
			});
		}
    **/

		const sortBy = query.sortBy || `count`;
		const facetQuery: any = [
			{
				$unwind: `$${field}`,
			},
			{ $sortByCount: `$${field}` },
		];

		if (sortBy === `asc` || sortBy === `desc`) {
			facetQuery.push({
				$sort: {
					_id: sortBy === `asc` ? 1 : -1,
				},
			});
		}

		if (query.aggregationSize !== undefined) {
			facetQuery.push({
				$limit: query.aggregationSize,
			});
		}

		res.push({
			$facet: {
				aggs: facetQuery,
			},
		});

		return res;
	} catch (err) {
		throw err;
	}
};
