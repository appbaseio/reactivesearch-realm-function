// jshint ignore: start
/// <reference path="./realm.d.ts" />
/// <reference path="./schema.js" />
'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.ReactiveSearch = void 0;
// @ts-ignore
exports = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a, validate, db, collection, dbName, collectionName, data, mongodb, query, client, reactiveSearch, results, _b, err_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (AUTHORIZATION_CREDENTIALS) {
                    if (((_c = request === null || request === void 0 ? void 0 : request.headers['Authorization']) === null || _c === void 0 ? void 0 : _c[0]) !== AUTHORIZATION_CREDENTIALS) {
                        result = {
                            error: {
                                code: 401,
                                message: 'invalid username or password',
                                status: 'Unauthorized'
                            }
                        };
                        response.setStatusCode(401);
                        response.setHeader('Content-Type', 'application/json');
                        response.setBody(JSON.stringify(result));
                        return [2 /*return*/];
                    }
                }
                _a = request.query, validate = _a.validate, db = _a.db, collection = _a.collection;
                dbName = db;
                collectionName = collection;
                data = EJSON.parse(request.body.text());
                mongodb = data.mongodb, query = data.query;
                client = context.services.get('mongodb-atlas');
                if (!dbName || !collectionName) {
                    //check if mongodb key is present in req.body
                    if (!mongodb ||
                        !mongodb.db ||
                        !mongodb.db.trim() ||
                        !mongodb.collection ||
                        !mongodb.collection.trim()) {
                        response.setStatusCode(400);
                        response.setHeader('Content-Type', 'application/json');
                        response.setBody(JSON.stringify({
                            error: {
                                message: "mongodb object is required with db and collection name as its keys",
                                code: 400,
                                status: "Bad Request"
                            }
                        }));
                        return [2 /*return*/];
                    }
                    dbName = mongodb.db;
                    collectionName = mongodb.collection;
                }
                if (!query) {
                    response.setStatusCode(400);
                    response.setHeader('Content-Type', 'application/json');
                    response.setBody(JSON.stringify({
                        error: {
                            message: "query is required",
                            code: 400,
                            status: "Bad Request"
                        }
                    }));
                    return [2 /*return*/];
                }
                reactiveSearch = new ReactiveSearch({
                    client: client,
                    database: dbName,
                    collection: collectionName
                });
                _d.label = 1;
            case 1:
                _d.trys.push([1, 6, , 7]);
                if (!validate) return [3 /*break*/, 3];
                return [4 /*yield*/, reactiveSearch.translate(query)];
            case 2:
                _b = _d.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, reactiveSearch.query(query)];
            case 4:
                _b = _d.sent();
                _d.label = 5;
            case 5:
                results = _b;
                response.setStatusCode(200);
                response.setHeader('Content-Type', 'application/json');
                response.setBody(JSON.stringify(results));
                return [3 /*break*/, 7];
            case 6:
                err_1 = _d.sent();
                response.setStatusCode(500);
                response.setHeader('Content-Type', 'application/json');
                response.setBody(JSON.stringify({
                    error: {
                        status: "Internal server error",
                        code: 500,
                        message: err_1.message
                    }
                }));
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
var ASCENDING = 1;
var DESCENDING = -1;
var ALL_FIELDS = '*';
var INCLUDE_FIELD = 1;
var EXCLUDE_FIELD = 0;
var FUZZINESS_AUTO = 'AUTO';
var AUTHORIZATION_CREDENTIALS = "Basic ZGVlcGFrOmFnZ2Fyd2Fs";
var nativeCeil = Math.ceil, nativeMax = Math.max;
var range = function (start, end, step, fromRight) {
    if (step === void 0) { step = 1; }
    var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
    while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
    }
    return result;
};
var validateSingleDataField = function (field) {
    if (typeof field !== 'string' && !Array.isArray(field)) {
        throw new Error("invalid dataField value");
    }
    if (Array.isArray(field) && field.length > 1) {
        throw new Error("only one dataField is allowed");
    }
};
var validateGeoValue = function (val) {
    if (!val.location && !val.geoBoundingBox) {
        throw new Error("Invalid geo value");
    }
};
var validateRangeValue = function (value) {
    if (value) {
        if (value.start === undefined && value.end === undefined) {
            throw new Error("invalid range value");
        }
        if (typeof value.start !== 'string' && typeof value.start !== 'number') {
            throw new Error("invalid start value");
        }
        if (typeof value.end !== 'string' && typeof value.end !== 'number') {
            throw new Error("invalid end value");
        }
        if (value.boost && typeof value.boost !== 'number') {
            throw new Error("invalid boost value");
        }
    }
};
var getStringFieldsFromDataField = function (dataField) {
    var fields = null;
    if (dataField) {
        if (typeof dataField === 'string') {
            fields = [dataField];
        }
        else {
            // It's an array
            if (dataField.length > 0) {
                var queryField = dataField[0];
                if (typeof queryField === 'string' || queryField instanceof String) {
                    fields = dataField;
                }
                else {
                    fields = dataField.map(function (value) { return value.field; });
                }
            }
        }
    }
    return fields;
};
var getFieldsFromDataField = function (fields) {
    var dataFields = null;
    if (fields) {
        if (typeof fields === 'string') {
            dataFields = [{ field: fields, weight: 1 }];
        }
        else {
            // It's an array
            if (fields.length > 0) {
                var queryField = fields[0];
                if (typeof queryField === 'string' || queryField instanceof String) {
                    dataFields = fields.map(function (field) { return ({
                        field: field,
                        weight: 1
                    }); });
                }
                else {
                    dataFields = fields;
                }
            }
        }
    }
    return dataFields;
};
var getIncludeExcludeFields = function (query) {
    var _a = query.includeFields, includeFields = _a === void 0 ? [] : _a, _b = query.excludeFields, excludeFields = _b === void 0 ? [] : _b, highlight = query.highlight;
    if (includeFields.length === 0 &&
        excludeFields.length === 0 &&
        highlight !== true) {
        return null;
    }
    if (excludeFields.includes(ALL_FIELDS)) {
        return {
            $project: {
                _0923biu3g4h: INCLUDE_FIELD
            }
        };
    }
    if (includeFields.includes(ALL_FIELDS)) {
        if (excludeFields.length === 0) {
            // Don't run the pipeline
            return null;
        }
        else {
            includeFields = includeFields.filter(function (item) { return item !== ALL_FIELDS; });
        }
    }
    // Exclude pipeline should be run before include
    var excludeAggregation = {}, includeAggregation = {};
    if (excludeFields.length > 0) {
        excludeAggregation = Object.assign.apply(Object, __spreadArray([{}], Array.from(excludeFields, function (field) {
            var _a;
            return (_a = {}, _a[field] = EXCLUDE_FIELD, _a);
        }), false));
    }
    if (includeFields.length > 0) {
        includeAggregation = Object.assign.apply(Object, __spreadArray([{}], Array.from(includeFields, function (field) {
            var _a;
            return (_a = {}, _a[field] = INCLUDE_FIELD, _a);
        }), false));
    }
    var res = {
        $project: __assign(__assign({}, excludeAggregation), includeAggregation)
    };
    if (highlight) {
        res.$project = __assign(__assign({}, res.$project), { highlights: { $meta: 'searchHighlights' } });
    }
    if (Object.keys(res).length) {
        return res;
    }
    return null;
};
var getPaginationMap = function (query) {
    var hits = [];
    var size = query.size;
    if (query.from) {
        hits.push({ $skip: query.from });
    }
    if (size && size < 0) {
        throw new Error("Invalid size. Size should be >= 0");
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
            hits: hits,
            total: [
                {
                    $count: 'count'
                },
            ]
        }
    };
};
var generateTermRelevantQuery = function (relevantRSQuery) {
    var isValidValue = Boolean(relevantRSQuery.value);
    if (Array.isArray(relevantRSQuery.value) && !relevantRSQuery.value.length) {
        isValidValue = false;
    }
    // allow value like 0
    if (!Array.isArray(relevantRSQuery.value) &&
        typeof relevantRSQuery.value === 'number') {
        isValidValue = true;
    }
    if (isValidValue) {
        if (relevantRSQuery.queryFormat === 'and') {
            var filter = {};
            if (Array.isArray(relevantRSQuery.value)) {
                filter = relevantRSQuery.value.map(function (v) { return ({
                    phrase: {
                        query: [v],
                        path: relevantRSQuery.dataField
                    }
                }); });
            }
            else {
                filter = [
                    {
                        phrase: {
                            query: [relevantRSQuery.value],
                            path: relevantRSQuery.dataField
                        }
                    },
                ];
            }
            return {
                compound: {
                    filter: filter
                }
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
                        path: relevantRSQuery.dataField
                    }
                }
            }
        };
    }
    return null;
};
var getFuzziness = function (query) {
    var _a;
    var queryLength = ((_a = query === null || query === void 0 ? void 0 : query.value) === null || _a === void 0 ? void 0 : _a.length) || 0;
    var fuzziness = query.fuzziness;
    if (fuzziness === undefined) {
        return {};
    }
    if (typeof fuzziness === 'string') {
        if (fuzziness.toUpperCase() === FUZZINESS_AUTO) {
            if (queryLength > 5) {
                fuzziness = 2;
            }
            else if (queryLength >= 3) {
                fuzziness = 1;
            }
            else {
                fuzziness = 0;
            }
        }
        else {
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
            maxEdits: fuzziness
        }
    };
};
var getSynonymsQuery = function (query) {
    var enableSynonyms = query.enableSynonyms, synonymsField = query.synonymsField, value = query.value, dataField = query.dataField;
    if (enableSynonyms && synonymsField) {
        var fields = getStringFieldsFromDataField(dataField);
        if (fields) {
            return {
                text: {
                    query: value,
                    path: fields,
                    synonyms: synonymsField
                }
            };
        }
    }
    return null;
};
var getAutoCompleteQuery = function (query) {
    var autocompleteField = query.autocompleteField, value = query.value;
    var fields = getFieldsFromDataField(autocompleteField);
    if (fields) {
        var fuzziness_1 = getFuzziness(query);
        return {
            compound: {
                should: fields.map(function (x) { return ({
                    autocomplete: __assign({ path: x.field, query: value, score: { boost: { value: x.weight } } }, fuzziness_1)
                }); })
            }
        };
    }
    return null;
};
var convertToMeter = function (distance, unit) {
    switch (unit) {
        case "mi":
            return distance * 1609.34;
        case "yd":
            return distance / 1.094;
        case "ft":
            return distance / 3.281;
        case "km":
            return distance * 1000;
        case "cm":
            return distance / 100;
        case "mm":
            return distance / 1000;
        // https://en.wikipedia.org/wiki/Nautical_mile
        case "nmi":
            return distance * 1852;
        default:
            return distance;
    }
};
var convertLocation = function (location) {
    var loc = [0, 0];
    if (typeof location === "string") {
        var data = ("" + location).split(",");
        if (data.length !== 2) {
            throw new Error("Invalid location");
        }
        loc[0] = parseFloat(data[0]);
        loc[1] = parseFloat(data[1]);
    }
    else if (Array.isArray(location)) {
        if (location.length !== 2) {
            throw new Error("Invalid location");
        }
        loc = location;
    }
    else {
        loc = [location.lat, location.long];
    }
    if (isNaN(loc[0])) {
        throw new Error("Invalid lat");
    }
    if (isNaN(loc[1])) {
        throw new Error("Invalid long");
    }
    loc[0] = parseFloat("" + loc[0]);
    loc[1] = parseFloat("" + loc[1]);
    return loc;
};
// TODO set return type
//
// Target remains $search for geo query as well
// ref: https://docs.atlas.mongodb.com/reference/atlas-search/geoWithin/
var getGeoQuery = function (query) {
    try {
        var val = __assign({}, query.value);
        validateGeoValue(val);
        var res = [];
        var search = {};
        // geo point query
        if (val.location) {
            val.location = convertLocation(val.location);
            if (!val.distance || isNaN(val.distance)) {
                throw new Error("Distance is required in value");
            }
            if (!val.unit) {
                val.unit = "m";
            }
            if (val.unit !== "m") {
                // convert data to meter as mongo only supports meter
                val.distance = convertToMeter(val.distance, val.unit);
            }
            search = {
                geoWithin: {
                    circle: {
                        center: {
                            type: 'Point',
                            coordinates: val.location
                        },
                        radius: val.distance
                    },
                    path: query.dataField
                }
            };
        }
        // geo bounding box query
        if (val.geoBoundingBox) {
            // mongo geo bounding accepts bottomRight and topLeft
            // following is the conversion
            /**
             * topLeft: {x1,y1}
                bottomRight: {x2,y2}

                topRight: {x2,y1}
                bottomLeft: {x1,y2}
             */
            var bottomRight = convertLocation(val.geoBoundingBox.bottomRight);
            var topLeft = convertLocation(val.geoBoundingBox.topLeft);
            search = {
                geoWithin: {
                    box: {
                        bottomLeft: {
                            type: 'Point',
                            coordinates: [topLeft[0], bottomRight[1]]
                        },
                        topRight: {
                            type: 'Point',
                            coordinates: [bottomRight[0], topLeft[1]]
                        }
                    },
                    path: query.dataField
                }
            };
        }
        var compoundQuery = {
            compound: {
                should: [search]
            }
        };
        if (query.index) {
            compoundQuery.index = query.index;
        }
        res = [{ $search: compoundQuery }];
        var projectTarget = getIncludeExcludeFields(query);
        if (projectTarget) {
            res.push(projectTarget);
        }
        res.push(getPaginationMap(query));
        return res;
    }
    catch (err) {
        throw err;
    }
};
// TODO set return type
var getRangeQuery = function (query) {
    try {
        validateSingleDataField(query.dataField);
        validateRangeValue(query.value);
        var res = [];
        var field = Array.isArray(query.dataField)
            ? query.dataField[0]
            : query.dataField;
        var search = {
            range: {
                path: field
            }
        };
        if (query.value && query.value.start !== undefined) {
            search.range.gte = query.value.start;
        }
        if (query.value && query.value.end !== undefined) {
            search.range.lte = query.value.end;
        }
        if (query.value && query.value.boost !== undefined) {
            search.range.score = {
                boost: {
                    value: query.value.boost
                }
            };
        }
        var compoundQuery = {
            compound: {
                should: [search]
            }
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
                                path: "" + field
                            }
                        },
                    ]
                }
            });
        }
        res = [
            {
                $search: compoundQuery
            },
        ];
        var projectTarget = getIncludeExcludeFields(query);
        if (projectTarget) {
            res.push(projectTarget);
        }
        var facet = getPaginationMap(query);
        if (query.aggregations && query.aggregations.length) {
            if (query.aggregations.includes("min")) {
                facet.$facet.min = [
                    {
                        $group: {
                            _id: null,
                            min: {
                                $min: Array.isArray(query.dataField)
                                    ? "$" + query.dataField[0]
                                    : "$" + query.dataField
                            }
                        }
                    },
                ];
            }
            if (query.aggregations.includes("max")) {
                facet.$facet.max = [
                    {
                        $group: {
                            _id: null,
                            max: {
                                $max: Array.isArray(query.dataField)
                                    ? "$" + query.dataField[0]
                                    : "$" + query.dataField
                            }
                        }
                    },
                ];
            }
            if (query.value && query.aggregations.includes("histogram")) {
                if (query.value &&
                    query.value.start === undefined &&
                    query.value.end === undefined) {
                    throw new Error("histogram needs start and end value");
                }
                if (query.interval === undefined) {
                    throw new Error("invalid interval");
                }
                facet.$facet.histogram = [
                    {
                        $bucket: {
                            groupBy: Array.isArray(query.dataField)
                                ? "$" + query.dataField[0]
                                : "$" + query.dataField,
                            boundaries: range(query.value.start, query.value.end, query.interval),
                            "default": "other"
                        }
                    },
                ];
            }
        }
        res.push(facet);
        return res;
    }
    catch (err) {
        throw err;
    }
};
var getSearchAggregation = function (query) {
    var value = query.value, dataField = query.dataField;
    var fields = getFieldsFromDataField(dataField);
    if (fields) {
        var fuzziness_2 = getFuzziness(query);
        var search = {
            compound: {
                must: fields.map(function (x) { return ({
                    text: __assign({ path: x.field, query: value, score: { boost: { value: x.weight } } }, fuzziness_2)
                }); })
            }
        };
        return search;
    }
    return null;
};
// TODO set return type
var getSearchQuery = function (query) {
    try {
        var searchQuery = [];
        var value = query.value;
        if (value && value.length) {
            var shouldAggregation = [];
            var search = getSearchAggregation(query);
            if (search) {
                shouldAggregation.push(search);
            }
            var synonyms = getSynonymsQuery(query);
            if (synonyms) {
                shouldAggregation.push(synonyms);
            }
            var autocomplete = getAutoCompleteQuery(query);
            if (autocomplete) {
                shouldAggregation.push(autocomplete);
            }
            var compoundQuery = {
                compound: {
                    should: shouldAggregation
                }
            };
            var highlightQuery = getHighlightQuery(query);
            var q = { $search: __assign(__assign({}, compoundQuery), highlightQuery) };
            if (query.index) {
                q.$search.index = query.index;
            }
            searchQuery.push(q);
        }
        var projectTarget = getIncludeExcludeFields(query);
        if (projectTarget) {
            searchQuery.push(projectTarget);
        }
        if (query.sortBy) {
            searchQuery.push(getSearchSortByQuery(query));
        }
        searchQuery.push(getPaginationMap(query));
        return searchQuery;
    }
    catch (err) {
        throw err;
    }
};
var getSearchSortByQuery = function (query) {
    var _a, _b, _c;
    var sortBy = DESCENDING;
    var field = '_id';
    if (query.sortBy) {
        sortBy = query.sortBy === "asc" ? ASCENDING : DESCENDING;
    }
    if (query.dataField) {
        var _field = _getFirstDataFieldValue(query.dataField);
        if (_field) {
            field = _field;
        }
        else {
            return { $sort: (_a = { score: { $meta: 'textScore' } }, _a[field] = sortBy, _a) };
        }
        return { $sort: (_b = {}, _b[field] = sortBy, _b) };
    }
    else {
        /*
            From MongoDB documentation
            In the { <sort-key> } document, set the { $meta: "textScore" } expression
            to an arbitrary field name. The field name is ignored by the query system.
        */
        return { $sort: (_c = { score: { $meta: 'textScore' } }, _c[field] = sortBy, _c) };
    }
};
var getQueryStringQuery = function (query) {
    var _a = query.queryString, queryString = _a === void 0 ? false : _a, dataField = query.dataField, value = query.value;
    if (queryString && dataField && value) {
        var field = _getFirstDataFieldValue(dataField);
        if (field) {
            return {
                queryString: {
                    defaultPath: field,
                    query: value
                }
            };
        }
    }
    return {};
};
var _getFirstDataFieldValue = function (dataField) {
    var field = null;
    if (Array.isArray(dataField)) {
        if (dataField.length > 0) {
            var queryField = dataField[0];
            if (typeof queryField === 'string' || queryField instanceof String) {
                field = queryField;
            }
            else {
                field = queryField.field;
            }
        }
    }
    else {
        field = dataField;
    }
    return field;
};
var getHighlightQuery = function (query) {
    var _a = query.highlight, highlight = _a === void 0 ? false : _a, highlightField = query.highlightField, highlightConfig = query.highlightConfig, dataField = query.dataField;
    var _b = highlightConfig || {}, _c = _b.maxCharsToExamine, maxCharsToExamine = _c === void 0 ? 500000 : _c, _d = _b.maxNumPassages, maxNumPassages = _d === void 0 ? 5 : _d;
    if (highlight) {
        var fields = [];
        if (highlightField) {
            if (typeof highlightField === 'string') {
                fields = [highlightField];
            }
            else {
                fields = highlightField;
            }
        }
        else {
            var _fields = getStringFieldsFromDataField(dataField);
            if (_fields) {
                fields = _fields;
            }
            else {
                return {};
            }
        }
        return {
            highlight: {
                path: fields,
                maxCharsToExamine: maxCharsToExamine,
                maxNumPassages: maxNumPassages
            }
        };
    }
    else {
        return {};
    }
};
// TODO set return type
var getTermQuery = function (query) {
    try {
        validateSingleDataField(query.dataField);
        var search = {};
        var res = [];
        if (query.index) {
            search.index = query.index;
        }
        // const isArrayVal = Array.isArray(query.value);
        // const queryFormat = query.queryFormat || `or`;
        var isArrayField = Array.isArray(query.dataField);
        var field = "" + (query.dataField && isArrayField ? query.dataField[0] : query.dataField);
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
        var sortBy = query.sortBy || "count";
        var facetQuery = [
            {
                $unwind: "$" + field
            },
            { $sortByCount: "$" + field },
        ];
        if (sortBy === "asc" || sortBy === "desc") {
            facetQuery.push({
                $sort: {
                    _id: sortBy === "asc" ? 1 : -1
                }
            });
        }
        if (query.aggregationSize !== undefined) {
            facetQuery.push({
                $limit: query.aggregationSize
            });
        }
        res.push({
            $facet: {
                aggregations: facetQuery
            }
        });
        return res;
    }
    catch (err) {
        throw err;
    }
};
var RSQuerySchema = new Schema({
    index: { type: String },
    enablePopularSuggestions: { type: Boolean },
    maxPopularSuggestions: { type: Number },
    clearOnQueryChange: { type: Boolean },
    results: { type: Array, each: { type: Object } },
    id: { type: String, required: true },
    type: { type: String, "enum": ["search", "term", "geo", "range"] },
    react: { and: { type: [String, Array] }, or: { type: [String, Array] } },
    queryFormat: { type: String, "enum": ["or", "and"] },
    dataField: { type: [String, Array] },
    categoryField: { type: String },
    categoryValue: { type: String },
    nestedField: { type: String },
    from: { type: [Number] },
    size: { type: Number },
    sortBy: { type: String, "enum": ["asc", "desc", "count"] },
    value: { type: [String, Number] },
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
        maxNumPassages: { type: Number }
    },
    interval: { type: Number },
    aggregations: { type: Array, each: { type: String } },
    missingLabel: { type: String },
    showMissing: { type: Boolean },
    defaultQuery: { type: Object },
    customQuery: { type: Object },
    execute: { type: Boolean },
    enableSynonyms: { type: Boolean },
    synonymsField: { type: String },
    selectAllLabel: { type: String },
    pagination: { type: Boolean },
    queryString: { type: Boolean },
    autocompleteField: { type: [String, Array] }
});
var buildQueryPipeline = function (queryMap) {
    var mongoPipelines = {};
    // other pipelines added because of default or custom query
    var extraTargets = [];
    Object.keys(queryMap).forEach(function (item) {
        var _a = queryMap[item], rsQuery = _a.rsQuery, mongoQuery = _a.mongoQuery, error = _a.error;
        var id = (rsQuery === null || rsQuery === void 0 ? void 0 : rsQuery.id) || "" + Date.now();
        if (rsQuery && mongoQuery) {
            if (rsQuery.execute === undefined || rsQuery.execute) {
                var finalMongoQuery = __spreadArray([], mongoQuery, true);
                if (rsQuery.defaultQuery) {
                    var defaultQueryTargets_1 = Array.isArray(rsQuery.defaultQuery)
                        ? rsQuery.defaultQuery
                        : [rsQuery.defaultQuery];
                    var mongoQueryIndexesToDelete_1 = [];
                    var skip_1 = null;
                    var limit_1 = null;
                    // delete skip and limit from defaultQuery if present
                    defaultQueryTargets_1 = defaultQueryTargets_1.filter(function (defaultQueryItem) {
                        var defaultKey = Object.keys(defaultQueryItem)[0];
                        if (defaultKey === "$skip") {
                            skip_1 = defaultQueryItem["$skip"];
                        }
                        if (defaultKey === "$limit") {
                            limit_1 = defaultQueryItem["$limit"];
                        }
                        return defaultKey !== "$skip" && defaultKey !== "$limit";
                    });
                    mongoQuery.forEach(function (mongoQueryItem, index) {
                        var key = Object.keys(mongoQueryItem)[0];
                        // check if defaultQuery has that value then use defaultQuery target,
                        // eg. $limit exists in both then use the one passed in defaultQuery
                        defaultQueryTargets_1.forEach(function (defaultQueryItem) {
                            var defaultKey = Object.keys(defaultQueryItem)[0];
                            if (defaultKey === key) {
                                mongoQueryIndexesToDelete_1.push(index);
                            }
                        });
                    });
                    // generated facet pipeline for skip and limit
                    // if present in default query
                    // and remove them from root mongo query
                    var hits = [];
                    if (skip_1 !== null) {
                        hits.push({ $skip: skip_1 });
                    }
                    if (limit_1 !== null) {
                        hits.push({ $limit: limit_1 });
                    }
                    if (hits.length) {
                        var facetIndex = mongoQuery.findIndex(function (item) {
                            return item.$facet && item.$facet.hits;
                        });
                        if (facetIndex > -1) {
                            mongoQuery[facetIndex] = {
                                $facet: {
                                    hits: hits,
                                    total: [
                                        {
                                            $count: 'count'
                                        },
                                    ]
                                }
                            };
                        }
                    }
                    finalMongoQuery = __spreadArray(__spreadArray([], defaultQueryTargets_1, true), mongoQuery.filter(function (_, i) {
                        return mongoQueryIndexesToDelete_1.indexOf(i) === -1;
                    }), true);
                }
                if (rsQuery.react) {
                    var andQuery_1 = [];
                    var orQuery_1 = [];
                    var currentSearch = null;
                    var isTermQuery_1 = rsQuery.type === 'term';
                    // must query
                    if (rsQuery.react.and) {
                        // if and is not array convert it to array
                        var relevantAndRef = Array.isArray(rsQuery.react.and)
                            ? rsQuery.react.and
                            : [rsQuery.react.and];
                        relevantAndRef.forEach(function (andItem) {
                            var _a;
                            if (queryMap[andItem]) {
                                var _b = queryMap[andItem], relevantRSQuery = _b.rsQuery, relevantMongoQuery = _b.mongoQuery;
                                if (relevantRSQuery && relevantMongoQuery) {
                                    // handles case where relevant query is term query
                                    if (relevantRSQuery.type === 'term') {
                                        if (!isTermQuery_1) {
                                            var relTermQuery = generateTermRelevantQuery(relevantRSQuery);
                                            if (relTermQuery) {
                                                andQuery_1.push(relTermQuery);
                                            }
                                        }
                                    }
                                    else {
                                        if ((_a = relevantMongoQuery[0]) === null || _a === void 0 ? void 0 : _a.$search) {
                                            var queryCopy = __assign({}, relevantMongoQuery[0].$search);
                                            if (queryCopy.index) {
                                                delete queryCopy.index;
                                            }
                                            andQuery_1.push(queryCopy);
                                        }
                                    }
                                    if (relevantRSQuery.customQuery) {
                                        andQuery_1.push(relevantRSQuery.customQuery.$search
                                            ? relevantRSQuery.customQuery.$search
                                            : relevantRSQuery.customQuery);
                                    }
                                }
                            }
                        });
                    }
                    // should query
                    if (rsQuery.react.or) {
                        // if or is not array convert it to array
                        var relevantOrRef = Array.isArray(rsQuery.react.or)
                            ? rsQuery.react.or
                            : [rsQuery.react.or];
                        relevantOrRef.forEach(function (orItem) {
                            var _a;
                            if (queryMap[orItem]) {
                                var _b = queryMap[orItem], relevantRSQuery = _b.rsQuery, relevantMongoQuery = _b.mongoQuery;
                                if (relevantRSQuery && relevantMongoQuery) {
                                    if (relevantRSQuery.type === 'term') {
                                        if (!isTermQuery_1) {
                                            var relTermQuery = generateTermRelevantQuery(relevantRSQuery);
                                            if (relTermQuery) {
                                                orQuery_1.push(relTermQuery);
                                            }
                                        }
                                    }
                                    else {
                                        if ((_a = relevantMongoQuery[0]) === null || _a === void 0 ? void 0 : _a.$search) {
                                            var queryCopy = __assign({}, relevantMongoQuery[0].$search);
                                            if (queryCopy.index) {
                                                delete queryCopy.index;
                                            }
                                            orQuery_1.push(queryCopy);
                                        }
                                    }
                                    if (relevantRSQuery.customQuery) {
                                        orQuery_1.push(relevantRSQuery.customQuery.$search
                                            ? relevantRSQuery.customQuery.$search
                                            : relevantRSQuery.customQuery);
                                    }
                                }
                            }
                        });
                    }
                    var compoundQuery = {
                        $search: {
                            compound: {}
                        }
                    };
                    if (!isTermQuery_1) {
                        currentSearch = mongoQuery[0].$search;
                        // if has both the clause
                        // perform and with the current query and (and & or) with react queries
                        // example: must: {  must: { A, should: B}, $currentComponentQuery }
                        if (orQuery_1.length && andQuery_1.length) {
                            if (currentSearch) {
                                compoundQuery.$search.compound = {
                                    must: [
                                        currentSearch,
                                        {
                                            compound: {
                                                must: __spreadArray(__spreadArray([], andQuery_1, true), [
                                                    {
                                                        compound: {
                                                            should: __spreadArray([], orQuery_1, true)
                                                        }
                                                    },
                                                ], false)
                                            }
                                        },
                                    ]
                                };
                            }
                            else {
                                compoundQuery.$search.compound = {
                                    must: __spreadArray(__spreadArray([], andQuery_1, true), [
                                        {
                                            compound: {
                                                should: __spreadArray([], orQuery_1, true)
                                            }
                                        },
                                    ], false)
                                };
                            }
                        }
                        else if (orQuery_1.length || andQuery_1.length) {
                            if (orQuery_1.length) {
                                compoundQuery.$search.compound = {
                                    should: currentSearch ? __spreadArray([currentSearch], orQuery_1, true) : orQuery_1
                                };
                            }
                            if (andQuery_1.length) {
                                compoundQuery.$search.compound = {
                                    must: currentSearch ? __spreadArray([currentSearch], andQuery_1, true) : andQuery_1
                                };
                            }
                        }
                        else {
                            compoundQuery.$search = currentSearch;
                        }
                        var index = (currentSearch || {}).index;
                        if (index) {
                            delete currentSearch.index;
                        }
                        if (compoundQuery &&
                            compoundQuery.$search &&
                            compoundQuery.$search.compound &&
                            Object.keys(compoundQuery.$search.compound).length) {
                            // add index to final compound query
                            if (rsQuery.index) {
                                compoundQuery.$search.index = rsQuery.index;
                            }
                            finalMongoQuery = currentSearch
                                ? __spreadArray(__spreadArray(__spreadArray([], extraTargets, true), [compoundQuery], false), finalMongoQuery.slice(1), true) : __spreadArray(__spreadArray(__spreadArray([], extraTargets, true), [compoundQuery], false), finalMongoQuery, true);
                        }
                        else {
                            finalMongoQuery = currentSearch
                                ? __spreadArray(__spreadArray([], extraTargets, true), finalMongoQuery.slice(1), true) : __spreadArray(__spreadArray([], extraTargets, true), finalMongoQuery, true);
                        }
                    }
                    else {
                        if (orQuery_1.length) {
                            compoundQuery.$search.compound = {
                                should: orQuery_1
                            };
                        }
                        if (andQuery_1.length) {
                            compoundQuery.$search.compound = {
                                must: andQuery_1
                            };
                        }
                        if (compoundQuery &&
                            compoundQuery.$search &&
                            compoundQuery.$search.compound &&
                            Object.keys(compoundQuery.$search.compound).length) {
                            // add index to final compound query
                            if (rsQuery.index) {
                                compoundQuery.$search.index = rsQuery.index;
                            }
                            finalMongoQuery = __spreadArray(__spreadArray(__spreadArray([], extraTargets, true), [
                                compoundQuery
                            ], false), finalMongoQuery, true);
                        }
                        else {
                            finalMongoQuery = __spreadArray(__spreadArray([], extraTargets, true), finalMongoQuery, true);
                        }
                    }
                }
                mongoPipelines[id] = finalMongoQuery;
            }
        }
        else {
            mongoPipelines[id] = {
                error: error
            };
        }
    });
    return mongoPipelines;
};
var getQueriesMap = function (queries) {
    var res = {};
    queries.forEach(function (item) {
        var itemId = item.id || "" + Date.now();
        try {
            res[itemId] = {
                rsQuery: item,
                mongoQuery: {}
            };
            // default item type to search
            if (!item.type) {
                item.type = "search";
            }
            if (item.type === "search") {
                res[itemId].mongoQuery = getSearchQuery(item);
            }
            if (item.type === "geo") {
                res[itemId].mongoQuery = getGeoQuery(item);
            }
            if (item.type == "term") {
                res[itemId].mongoQuery = getTermQuery(item);
            }
            if (item.type == "range") {
                res[itemId].mongoQuery = getRangeQuery(item);
            }
        }
        catch (err) {
            res[itemId] = {
                rsQuery: item,
                error: {
                    status: "Bad request",
                    message: err.message,
                    code: 400
                }
            };
        }
    });
    return res;
};
var performance = {
    now: function () {
        var time = new Date();
        return time.getTime();
    }
};
var ReactiveSearch = /** @class */ (function () {
    function ReactiveSearch(config) {
        var _this = this;
        // TODO define type for mongo query
        this.translate = function (data) {
            var queryMap = getQueriesMap(data);
            var result = buildQueryPipeline(queryMap);
            return result;
        };
        this.query = function (data) {
            var queryMap = getQueriesMap(data);
            var aggregationsObject = buildQueryPipeline(queryMap);
            try {
                var totalStart_1 = performance.now();
                return Promise.all(Object.keys(aggregationsObject).map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                    var rsQuery_1, error, start, collection, res, raw, end, took, dataField, _a, hits, total, min, max, histogram, dataToReturn, dataField, err_2;
                    var _b;
                    var _this = this;
                    var _c, _d, _e, _f, _g, _h;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                _j.trys.push([0, 4, , 5]);
                                rsQuery_1 = queryMap[item].rsQuery;
                                error = aggregationsObject[item].error;
                                // return if item has error before execution,
                                // this would ideally be 400 error
                                if (error) {
                                    return [2 /*return*/, {
                                            id: item,
                                            hits: null,
                                            error: error,
                                            status: error === null || error === void 0 ? void 0 : error.code
                                        }];
                                }
                                start = performance.now();
                                collection = this.config.client
                                    .db(this.config.database)
                                    .collection(this.config.collection);
                                return [4 /*yield*/, collection
                                        .aggregate(aggregationsObject[item])
                                        .toArray()];
                            case 1:
                                res = _j.sent();
                                raw = undefined;
                                if (!(rsQuery_1 && rsQuery_1.defaultQuery)) return [3 /*break*/, 3];
                                return [4 /*yield*/, collection.aggregate(rsQuery_1.defaultQuery).toArray()];
                            case 2:
                                raw = _j.sent();
                                _j.label = 3;
                            case 3:
                                end = performance.now();
                                took = Math.abs(end - start) || 1;
                                if (rsQuery_1) {
                                    // user can re-shape response incase of default query
                                    // hence we will be returning raw key in that case
                                    // prepare response for term aggregations
                                    // should be of following shape {..., aggregations: {[dataField]: {buckets: [{key:'', doc_count: 0}]}}}
                                    if (rsQuery_1.type === 'term') {
                                        dataField = Array.isArray(rsQuery_1.dataField)
                                            ? "" + rsQuery_1.dataField[0]
                                            : "" + rsQuery_1.dataField;
                                        return [2 /*return*/, {
                                                id: item,
                                                took: took,
                                                hits: {},
                                                raw: raw,
                                                status: 200,
                                                aggregations: (_b = {},
                                                    _b[dataField] = {
                                                        buckets: (_c = res[0]) === null || _c === void 0 ? void 0 : _c.aggregations.map(function (item) {
                                                            var _a, _b;
                                                            return ({
                                                                key: item._id,
                                                                doc_count: ((_a = item === null || item === void 0 ? void 0 : item.count) === null || _a === void 0 ? void 0 : _a.$numberInt)
                                                                    ? parseInt((_b = item === null || item === void 0 ? void 0 : item.count) === null || _b === void 0 ? void 0 : _b.$numberInt)
                                                                    : (item === null || item === void 0 ? void 0 : item.count) || 0
                                                            });
                                                        })
                                                    },
                                                    _b)
                                            }];
                                    }
                                    _a = res[0], hits = _a.hits, total = _a.total, min = _a.min, max = _a.max, histogram = _a.histogram;
                                    dataToReturn = {
                                        id: item,
                                        took: took,
                                        raw: raw,
                                        hits: {
                                            total: {
                                                value: ((_d = total[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
                                                relation: "eq"
                                            },
                                            // TODO add max score
                                            max_score: 0,
                                            hits: rsQuery_1.size === 0
                                                ? []
                                                : hits.map(function (item) {
                                                    return item.highlights
                                                        ? {
                                                            _index: rsQuery_1.index || "default",
                                                            _collection: _this.config.collection,
                                                            _id: item._id,
                                                            // TODO add score pipeline
                                                            _score: 0,
                                                            _source: __assign(__assign({}, item), { highlights: null }),
                                                            highlight: item.highlights.map(function (entity) {
                                                                var _a;
                                                                return (_a = {},
                                                                    _a[entity.path] = entity.texts
                                                                        .map(function (text) {
                                                                        return text.type === 'text'
                                                                            ? text.value
                                                                            : "<b>" + text.value + "</b>";
                                                                    })
                                                                        .join(' '),
                                                                    _a);
                                                            })
                                                        }
                                                        : {
                                                            _index: rsQuery_1.index || "default",
                                                            _collection: _this.config.collection,
                                                            _id: item._id,
                                                            // TODO add score pipeline
                                                            _score: 0,
                                                            _source: item
                                                        };
                                                })
                                        },
                                        error: null,
                                        status: 200
                                    };
                                    if (min || max || histogram) {
                                        dataToReturn.aggregations = {};
                                    }
                                    if (min) {
                                        dataToReturn.aggregations.min = {
                                            value: ((_e = min[0].min) === null || _e === void 0 ? void 0 : _e.$numberInt)
                                                ? parseInt((_f = min[0].min) === null || _f === void 0 ? void 0 : _f.$numberInt)
                                                : min[0].min || 0
                                        };
                                    }
                                    if (max) {
                                        dataToReturn.aggregations.max = {
                                            value: ((_g = max[0].max) === null || _g === void 0 ? void 0 : _g.$numberInt)
                                                ? parseInt((_h = max[0].max) === null || _h === void 0 ? void 0 : _h.$numberInt)
                                                : max[0].max || 0
                                        };
                                    }
                                    if (histogram) {
                                        dataField = Array.isArray(rsQuery_1.dataField)
                                            ? "" + rsQuery_1.dataField[0]
                                            : "" + rsQuery_1.dataField;
                                        dataToReturn.aggregations[dataField] = {
                                            buckets: histogram.map(function (item) {
                                                var _a, _b;
                                                return ({
                                                    key: item._id,
                                                    doc_count: ((_a = item === null || item === void 0 ? void 0 : item.count) === null || _a === void 0 ? void 0 : _a.$numberInt)
                                                        ? parseInt((_b = item === null || item === void 0 ? void 0 : item.count) === null || _b === void 0 ? void 0 : _b.$numberInt)
                                                        : (item === null || item === void 0 ? void 0 : item.count) || 0
                                                });
                                            })
                                        };
                                    }
                                    return [2 /*return*/, dataToReturn];
                                }
                                return [3 /*break*/, 5];
                            case 4:
                                err_2 = _j.sent();
                                return [2 /*return*/, {
                                        id: item,
                                        hits: null,
                                        error: err_2.toString(),
                                        status: 500
                                    }];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); })).then(function (res) {
                    var totalEnd = performance.now();
                    var transformedRes = {
                        settings: {
                            took: Math.abs(totalEnd - totalStart_1) || 1
                        }
                    };
                    res.forEach(function (item) {
                        var id = item.id, rest = __rest(item, ["id"]);
                        transformedRes[id] = rest;
                    });
                    return transformedRes;
                });
            }
            catch (err) {
                throw err;
            }
        };
        this.config = {
            client: config.client,
            database: config.database,
            collection: config.collection
        };
    }
    return ReactiveSearch;
}());
exports.ReactiveSearch = ReactiveSearch;
