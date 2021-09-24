"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var messages_1 = require("./messages");
var property_1 = require("./property");
var error_1 = require("./error");
var validators_1 = require("./validators");
var dot_1 = require("./dot");
var typecast_1 = require("./typecast");
/**
 * A Schema defines the structure that objects should be validated against.
 *
 * @example
 * const post = new Schema({
 *   title: {
 *     type: String,
 *     required: true,
 *     length: { min: 1, max: 255 }
 *   },
 *   content: {
 *     type: String,
 *     required: true
 *   },
 *   published: {
 *     type: Date,
 *     required: true
 *   },
 *   keywords: [{ type: String }]
 * })
 *
 * @example
 * const author = new Schema({
 *   name: {
 *     type: String,
 *     required: true
 *   },
 *   email: {
 *     type: String,
 *     required: true
 *   },
 *   posts: [post]
 * })
 *
 * @param {Object} [obj] - schema definition
 * @param {Object} [opts] - options
 * @param {Boolean} [opts.typecast=false] - typecast values before validation
 * @param {Boolean} [opts.strip=true] - strip properties not defined in the schema
 * @param {Boolean} [opts.strict=false] - validation fails when object contains properties not defined in the schema
 */
var Schema = /** @class */ (function () {
    function Schema(obj, opts) {
        var _this = this;
        if (obj === void 0) { obj = {}; }
        if (opts === void 0) { opts = {}; }
        this.opts = opts;
        this.hooks = [];
        this.props = {};
        this.messages = Object.assign({}, messages_1["default"]);
        this.validators = Object.assign({}, validators_1["default"]);
        this.typecasters = Object.assign({}, typecast_1["default"]);
        Object.keys(obj).forEach(function (k) { return _this.path(k, obj[k]); });
    }
    /**
     * Create or update `path` with given `rules`.
     *
     * @example
     * const schema = new Schema()
     * schema.path('name.first', { type: String })
     * schema.path('name.last').type(String).required()
     *
     * @param {String} path - full path using dot-notation
     * @param {Object|Array|String|Schema|Property} [rules] - rules to apply
     * @return {Property}
     */
    Schema.prototype.path = function (path, rules) {
        var _this = this;
        var parts = path.split('.');
        var suffix = parts.pop();
        var prefix = parts.join('.');
        // Make sure full path is created
        if (prefix) {
            this.path(prefix);
        }
        // Array index placeholder
        if (suffix === '$') {
            this.path(prefix).type(Array);
        }
        // Nested schema
        if (rules instanceof Schema) {
            rules.hook(function (k, v) { return _this.path((0, utils_1.join)(k, path), v); });
            return this.path(path, rules.props);
        }
        // Return early when given a `Property`
        if (rules instanceof property_1["default"]) {
            this.props[path] = rules;
            // Notify parents if mounted
            this.propagate(path, rules);
            return rules;
        }
        var prop = this.props[path] || new property_1["default"](path, this);
        this.props[path] = prop;
        // Notify parents if mounted
        this.propagate(path, prop);
        // No rules?
        if (!rules)
            return prop;
        // type shorthand
        // `{ name: String }`
        if (typeof rules == 'string' || typeof rules == 'function') {
            prop.type(rules);
            return prop;
        }
        // Allow arrays to be defined implicitly:
        // `{ keywords: [String] }`
        // `{ keyVal: [[String, Number]] }`
        if (Array.isArray(rules)) {
            prop.type(Array);
            if (rules.length === 1) {
                prop.each(rules[0]);
            }
            else {
                prop.elements(rules);
            }
            return prop;
        }
        var keys = Object.keys(rules);
        var nested = false;
        // Check for nested objects
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (typeof prop[key] == 'function')
                continue;
            prop.type(Object);
            nested = true;
            break;
        }
        keys.forEach(function (key) {
            var rule = rules[key];
            if (nested) {
                return _this.path((0, utils_1.join)(key, path), rule);
            }
            prop[key](rule);
        });
        return prop;
    };
    /**
     * Typecast given `obj`.
     *
     * @param {Object} obj - the object to typecast
     * @return {Schema}
     * @private
     */
    Schema.prototype.typecast = function (obj) {
        var _loop_1 = function (path, prop) {
            (0, utils_1.enumerate)(path, obj, function (key, value) {
                if (value == null)
                    return;
                var cast = prop.typecast(value);
                if (cast === value)
                    return;
                dot_1["default"].set(obj, key, cast);
            });
        };
        for (var _i = 0, _a = Object.entries(this.props); _i < _a.length; _i++) {
            var _b = _a[_i], path = _b[0], prop = _b[1];
            _loop_1(path, prop);
        }
        return this;
    };
    /**
     * Strip all keys not defined in the schema
     *
     * @param {Object} obj - the object to strip
     * @param {String} [prefix]
     * @return {Schema}
     * @private
     */
    Schema.prototype.strip = function (obj) {
        var _this = this;
        (0, utils_1.walk)(obj, function (path, prop) {
            if (_this.props[prop])
                return true;
            dot_1["default"]["delete"](obj, path);
            return false;
        });
        return this;
    };
    /**
     * Create errors for all properties that are not defined in the schema
     *
     * @param {Object} obj - the object to check
     * @return {Schema}
     * @private
     */
    Schema.prototype.enforce = function (obj) {
        var _this = this;
        var errors = [];
        (0, utils_1.walk)(obj, function (path, prop) {
            if (_this.props[prop])
                return true;
            var error = new error_1["default"](messages_1["default"].illegal(path), path);
            errors.push(error);
            return false;
        });
        return errors;
    };
    /**
     * Validate given `obj`.
     *
     * @example
     * const schema = new Schema({ name: { required: true }})
     * const errors = schema.validate({})
     * assert(errors.length == 1)
     * assert(errors[0].message == 'name is required')
     * assert(errors[0].path == 'name')
     *
     * @param {Object} obj - the object to validate
     * @param {Object} [opts] - options, see [Schema](#schema-1)
     * @return {Array}
     */
    Schema.prototype.validate = function (obj, opts) {
        if (opts === void 0) { opts = {}; }
        opts = Object.assign(this.opts, opts);
        var errors = [];
        if (opts.typecast) {
            this.typecast(obj);
        }
        if (opts.strict) {
            errors.push.apply(errors, this.enforce(obj));
        }
        if (opts.strip !== false) {
            this.strip(obj);
        }
        var _loop_2 = function (path, prop) {
            (0, utils_1.enumerate)(path, obj, function (key, value) {
                var err = prop.validate(value, obj, key);
                if (err)
                    errors.push(err);
            });
        };
        for (var _i = 0, _a = Object.entries(this.props); _i < _a.length; _i++) {
            var _b = _a[_i], path = _b[0], prop = _b[1];
            _loop_2(path, prop);
        }
        return errors;
    };
    /**
     * Assert that given `obj` is valid.
     *
     * @example
     * const schema = new Schema({ name: String })
     * schema.assert({ name: 1 }) // Throws an error
     *
     * @param {Object} obj
     * @param {Object} [opts]
     */
    Schema.prototype.assert = function (obj, opts) {
        var err = this.validate(obj, opts)[0];
        if (err)
            throw err;
    };
    /**
     * Override default error messages.
     *
     * @example
     * const hex = (val) => /^0x[0-9a-f]+$/.test(val)
     * schema.path('some.path').use({ hex })
     * schema.message('hex', path => `${path} must be hexadecimal`)
     *
     * @example
     * schema.message({ hex: path => `${path} must be hexadecimal` })
     *
     * @param {String|Object} name - name of the validator or an object with name-message pairs
     * @param {String|Function} [message] - the message or message generator to use
     * @return {Schema}
     */
    Schema.prototype.message = function (name, message) {
        (0, utils_1.assign)(name, message, this.messages);
        return this;
    };
    /**
     * Override default validators.
     *
     * @example
     * schema.validator('required', val => val != null)
     *
     * @example
     * schema.validator({ required: val => val != null })
     *
     * @param {String|Object} name - name of the validator or an object with name-function pairs
     * @param {Function} [fn] - the function to use
     * @return {Schema}
     */
    Schema.prototype.validator = function (name, fn) {
        (0, utils_1.assign)(name, fn, this.validators);
        return this;
    };
    /**
     * Override default typecasters.
     *
     * @example
     * schema.typecaster('SomeClass', val => new SomeClass(val))
     *
     * @example
     * schema.typecaster({ SomeClass: val => new SomeClass(val) })
     *
     * @param {String|Object} name - name of the validator or an object with name-function pairs
     * @param {Function} [fn] - the function to use
     * @return {Schema}
     */
    Schema.prototype.typecaster = function (name, fn) {
        (0, utils_1.assign)(name, fn, this.typecasters);
        return this;
    };
    /**
     * Accepts a function that is called whenever new props are added.
     *
     * @param {Function} fn - the function to call
     * @return {Schema}
     * @private
     */
    Schema.prototype.hook = function (fn) {
        this.hooks.push(fn);
        return this;
    };
    /**
     * Notify all subscribers that a property has been added.
     *
     * @param {String} path - the path of the property
     * @param {Property} prop - the new property
     * @return {Schema}
     * @private
     */
    Schema.prototype.propagate = function (path, prop) {
        this.hooks.forEach(function (fn) { return fn(path, prop); });
        return this;
    };
    return Schema;
}());
// Export ValidationError
Schema.ValidationError = error_1["default"];
exports["default"] = Schema;
