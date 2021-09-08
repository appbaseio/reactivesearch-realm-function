export type ConfigType = {
	client?: any;
	database: string;
	documentCollection: string;
};

export type MicStatusField = `INACTIVE` | `ACTIVE` | `DENIED`;

export type RequestStatus = `INACTIVE` | `PENDING` | `ERROR`;

export type QueryFormat = `or` | `and`;

export type QueryType = `search` | `term` | `geo` | `range`;

export type Unit = `mi` | `yd` | `ft` | `km` | `m` | `cm` | `mm` | `nmi`;

export type GeoPoint = { lat: number; long: number };

export type Location = GeoPoint | string | [number, number];

export type SingleDataField = string | [string];

export type RangeValue = {
	start?: number | string;
	end?: number | string;
	boost?: number;
};

export type GeoValue = {
	location?: Location;
	distance?: number;
	unit?: Unit;
	geoBoundingBox?: {
		topLeft: Location;
		bottomRight: Location;
	};
};

export type SortType = `asc` | `desc` | `count`;

export type DataField = {
	field: string;
	weight: number;
};

export type Options = {
	triggerDefaultQuery?: boolean;
	triggerCustomQuery?: boolean;
	stateChanges?: boolean;
};

export type Option = {
	stateChanges?: boolean;
};

export type Observer = {
	callback: Function;
	properties?: string | Array<string>;
};

export type AppbaseSettings = {
	recordAnalytics?: boolean;
	enableQueryRules?: boolean;
	userId?: string;
	customEvents?: Object;
};

export type RecentSearchOptions = {
	from?: string;
	to?: string;
	size?: number;
	minChars?: number;
	customEvents?: Object;
};

export type RSQuery<T> = {
	index?: string;

	enablePopularSuggestions?: boolean;

	maxPopularSuggestions?: number;

	clearOnQueryChange?: boolean;

	results?: Array<Object>;

	beforeValueChange?: (value: string) => Promise<any>;

	// called when value changes
	onValueChange?: (next: string, prev: string) => void;

	// called when results change
	onResults?: (next: string, prev: string) => void;

	// called when composite aggregations change
	onAggregationData?: (next: Array<Object>, prev: Array<Object>) => void;

	// called when there is an error while fetching results
	onError?: (error: any) => void;

	// called when request status changes
	onRequestStatusChange?: (next: string, prev: string) => void;

	// called when query changes
	onQueryChange?: (next: string, prev: string) => void;

	// called when mic status changes
	onMicStatusChange?: (next: string, prev: string) => void;

	id?: string;

	type?: QueryType;

	react?: { and?: string | string[]; or?: string | string[] };

	queryFormat?: QueryFormat;

	dataField?: string | Array<string | DataField>;

	categoryField?: string;

	categoryValue?: string;

	nestedField?: string;

	from?: number;

	size?: number;

	sortBy?: SortType;

	value?: T;

	aggregationField?: string;

	aggregationSize?: number;

	after?: Object;

	includeNullValues?: Boolean;

	includeFields?: Array<string>;

	excludeFields?: Array<string>;

	fuzziness?: string | number;

	searchOperators?: boolean;

	highlight?: boolean;

	highlightField?: string | Array<string>;

	customHighlight?: { maxCharsToExamine: number; maxNumPassages: number };

	interval?: number;

	aggregations?: Array<string>;

	missingLabel?: string;

	showMissing?: boolean;

	defaultQuery?: any;

	customQuery?: any;

	execute?: boolean;

	enableSynonyms?: boolean;

	synonymsField?: string;

	selectAllLabel?: string;

	pagination?: boolean;

	queryString?: boolean;

	autocompleteField?: string | Array<string | DataField>;
};

export type MIC_STATUS = {
	inactive: `INACTIVE`;
	active: `ACTIVE`;
	denied: `DENIED`;
};

export type RSFunctionQueryData = {
	config: ConfigType;
	searchQuery: [];
};
export type QueryMap = Record<
	string,
	{
		rsQuery: RSQuery<any>;
		mongoQuery: any;
	}
>;
