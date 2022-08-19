"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.buildSchema = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const koishi_1 = require("koishi");
const peggy_1 = __importDefault(require("peggy"));
const grammar = fs_1.default.readFileSync((0, path_1.join)(__dirname, "./grammar.pegjs"), "utf8");
const parser = peggy_1.default.generate(grammar.toString());
const key = "MCfUBTJVigUebzoCIevR";
const builder = (args) => {
    function _decorate(kSchema, { decorator, values }) {
        if (!values && ["required", "hidden"].includes(decorator)) {
            return kSchema[decorator]();
        }
        else if (["role", "description"].includes(decorator)) {
            const callSign = decorator;
            if (values[0].schema.type === "const") {
                const constType = values[0].schema;
                return kSchema[callSign](constType.value.toString());
            }
        }
        else if (['default'].includes(decorator)) {
            const built = _buildSchema(values[0]);
            return kSchema.default(built === null || built === void 0 ? void 0 : built.inner);
        }
        else {
            console.log(decorator, values);
            throw new Error('unknown decorator');
        }
    }
    function _buildTuple(single) {
        const { schema } = single;
        // console.log("tuple", schema);
        const inner = schema.values.map((value) => _buildSchema(value));
        return koishi_1.Schema.tuple(inner);
    }
    function _buildObject(single) {
        var _a;
        const { schema } = single;
        // console.log("object", schema);
        const returnValue = {};
        (_a = schema.entries) === null || _a === void 0 ? void 0 : _a.forEach((entry) => {
            let assigned = _buildSchema(entry.assign.value);
            if (assigned)
                entry.decorators.forEach((decorator) => {
                    if (assigned)
                        assigned = _decorate(assigned, decorator);
                });
            returnValue[entry.assign.key] = assigned;
        });
        return koishi_1.Schema.object(returnValue);
    }
    function _buildTypeWithValue(single) {
        const { schema } = single;
        // console.log(schema.type, schema);
        // @ts-expect-error
        return koishi_1.Schema[schema.type](_buildSchema(schema.value));
    }
    function _buildTypeWithList(single) {
        const { schema } = single;
        const built = schema.values.map(_buildSchema);
        return koishi_1.Schema[schema.type](built);
    }
    function _buildTypeWithoutValue(single) {
        const { schema } = single;
        if (schema.type === "bool")
            schema.type = "boolean";
        let returnValue = koishi_1.Schema[schema.type](undefined);
        return returnValue;
    }
    function _buildConstant(single) {
        var _a, _b;
        let returnValue;
        const { schema } = single;
        // console.log("const", schema);
        if (typeof schema.value === "string" && ((_b = (_a = schema.value) === null || _a === void 0 ? void 0 : _a.startsWith) === null || _b === void 0 ? void 0 : _b.call(_a, key))) {
            const index = parseInt(schema.value.slice(key.length + 1));
            return args[index];
        }
        returnValue = koishi_1.Schema.const(schema.value);
        return returnValue;
    }
    function _buildTransform(single) {
        const { schema } = single;
        if (!schema.value)
            return;
        if (!schema.callback)
            return;
        const built = _buildSchema(schema.value);
        const cb = _buildSchema(schema.callback);
        return koishi_1.Schema.transform(built, cb === null || cb === void 0 ? void 0 : cb.value);
    }
    function _buildSchema(single) {
        let copy = single;
        const { schema, decorators } = copy;
        let returnValue = undefined;
        // console.log(single)
        switch (schema.type) {
            case "dict":
            case "array": {
                returnValue = _buildTypeWithValue(single);
                break;
            }
            case "object": {
                returnValue = _buildObject(single);
                break;
            }
            case "tuple": {
                returnValue = _buildTuple(single);
                break;
            }
            case "union":
            case "intersect": {
                returnValue = _buildTypeWithList(single);
                break;
            }
            case "any":
            case "never":
            case "string":
            case "number":
            case "boolean":
            case "bool": {
                // @ts-expect-error
                returnValue = _buildTypeWithoutValue(single);
                break;
            }
            case "const": {
                returnValue = _buildConstant(single);
                break;
            }
            case "transform": {
                returnValue = _buildTransform(single);
            }
        }
        if (returnValue && (decorators === null || decorators === void 0 ? void 0 : decorators.length)) {
            decorators.forEach((decorator) => {
                if (returnValue)
                    returnValue = _decorate(returnValue, decorator);
            });
        }
        return returnValue;
    }
    return _buildSchema;
};
function buildSchema(parsed, args) {
    const schemas = parsed.filter((entry) => typeof entry === "object");
    const build = builder(args);
    if (schemas.length === 0) {
        return undefined;
    }
    if (schemas.length === 1) {
        return build(schemas[0]);
    }
    return schemas.map(build);
}
exports.buildSchema = buildSchema;
function schema(template, ...args) {
    const def = template.reduce((acc, cur, index) => `${acc}${cur}${index < template.length - 1 ? `${key}_${index}` : ""}`, "");
    const parsed = parser.parse(def);
    const built = buildSchema(parsed, args);
    // console.log(built?.toString());
    return built;
}
exports.schema = schema;
