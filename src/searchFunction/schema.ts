export const RSQuerySchema = {
	index: { type: String },

	enablePopularSuggestions: { type: Boolean },

	maxPopularSuggestions: { type: Number },

	clearOnQueryChange: { type: Boolean },

	results: { type: Array, each: { type: Object } },

	id: { type: String },

	type: { type: String, enum: [`search`, `term`, `geo`, `range`, 'suggestion'] },

	react: { and: { type: [String, Array] }, or: { type: [String, Array] } },

	queryFormat: { type: String, enum: [`or`, `and`] },

	dataField: { type: [String, Array] },

	categoryField: { type: String },

	categoryValue: { type: String },

	nestedField: { type: String },

	from: { type: [Number] },

	size: { type: Number },

	sortBy: { type: String, enum: [`asc`, `desc`, `count`] },

	// @ts-ignore
	value: { type: [String, Number, Object, Array] },

	aggregationField: { type: String },

	aggregationSize: { type: Number },

	after: { type: Object },

	includeNullValues: { type: Boolean },

	includeFields: { type: Array, each: { type: String } },

	excludeFields: { type: Array, each: { type: String } },

	fuzziness: { type: [String, Number] },

	searchOperators: { type: Boolean },

	highlight: { type: Boolean },

	highlightField: { type: [String, Number] },

	highlightConfig: {
		maxCharsToExamine: { type: Number },
		maxNumPassages: { type: Number },
	},

	interval: { type: Number },

	aggregations: { type: Array, each: { type: String } },

	missingLabel: { type: String },
	showMissing: { type: Boolean },

	defaultQuery: { type: Array, each: { type: Object } },

	customQuery: { type: Object },

	execute: { type: Boolean },

	enableSynonyms: { type: Boolean },

	synonymsField: { type: String },

	selectAllLabel: { type: String },

	pagination: { type: Boolean },

	queryString: { type: Boolean },

	autocompleteField: { type: [String, Array] },
};
