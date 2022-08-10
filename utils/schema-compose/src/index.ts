import fs from "fs";
import { join } from "path";

import { Schema } from "koishi";
import peggy from "peggy";

const grammar = fs.readFileSync(join(__dirname, "./grammar.pegjs"), "utf8");

const parser = peggy.generate(grammar.toString());

const key = "MCfUBTJVigUebzoCIevR";

const builder = (args: any[]) => {
  function _decorate(
    kSchema: Schema,
    { decorator, value }: { decorator: string; value: any }
  ) {
    // @ts-expect-error
    if (!value) return kSchema[decorator]();
    // @ts-expect-error
    else return kSchema[decorator](value);
  }

  function _buildTuple(single: any) {
    const { schema } = single;
    // console.log("tuple", schema);
    const inner = schema.values.map((value: any) => _buildSchema(value));
    return Schema.tuple(inner);
  }
  function _buildObject(single: any) {
    const { schema } = single;
    // console.log("object", schema);
    const returnValue: Record<string, any> = {};
    schema.entries.forEach(
      (entry: {
        assign: { key: string; value: any };
        decorators: Array<{ decorator: string; value: any }>;
      }) => {
        let assigned = _buildSchema(entry.assign.value);
        entry.decorators.forEach((decorator) => {
          assigned = _decorate(assigned, decorator);
        });
        returnValue[entry.assign.key] = assigned;
      }
    );
    return Schema.object(returnValue);
  }
  function _buildTypeWithValue(single: {
    schema: {
      type: "dict" | "array";
      value: any;
    };
  }): Schema | undefined {
    const { schema } = single;
    // console.log(schema.type, schema);
    // @ts-expect-error
    return Schema[schema.type](_buildSchema(schema.value));
  }

  function _buildTypeWithList(single: {
    schema: {
      type: "union" | "intersect";
      value: any;
    };
  }) {
    const { schema } = single;
    const built = _buildSchema(schema.value);
    return Schema[schema.type](built.list);
  }

  function _buildTypeWithoutValue(single: {
    schema: {
      type: "any" | "never" | "string" | "number" | "boolean" | "bool";
      // | "array"
      // | "object";
    };
  }) {
    const { schema } = single;
    if (schema.type === "bool") schema.type = "boolean";
    let returnValue = Schema[schema.type]();
    return returnValue;
  }

  function _buildConstant(single: any) {
    let returnValue;
    const { schema } = single;
    // console.log("const", schema);
    if (schema.value?.startsWith?.(key)) {
      const index = schema.value.slice(key.length + 1);
      return args[index];
    }
    returnValue = Schema.const(schema.value);
    return returnValue;
  }

  function _buildTransform(single: any) {
    const {
      schema,
    }: {
      schema: {
        type: "transform"
        callback: string
        value: any
      };
    } = single;

    const built = _buildSchema(schema.value)
    const cb = _buildSchema(schema.callback)
    return Schema.transform(built, cb)
  }

  function _buildSchema(single: any) {
    let copy = { ...single };
    const {
      schema,
      decorators,
    }: {
      schema: { type: string };
      decorators: Array<{
        decorator: string;
        value: any;
      }>;
    } = copy;
    let returnValue: any;
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
    if (decorators?.length) {
      decorators.forEach((decorator) => {
        returnValue = _decorate(returnValue, decorator);
      });
    }
    return returnValue;
  }
  return _buildSchema;
};

export function buildSchema(
  parsed: Record<"comment" | "schema", any>[],
  args: any[]
) {
  const schemas = parsed.filter((schema) => schema.schema);
  const build = builder(args);
  if (schemas.length === 0) {
    return undefined;
  }
  if (schemas.length === 1) {
    return build(schemas[0]);
  }
  return schemas.map(build);
}

export function schema(template: TemplateStringsArray, ...args: any[]) {
  const def = template.reduce(
    (acc, cur, index) =>
      `${acc}${cur}${index < template.length - 1 ? `${key}_${index}` : ""}`,
    ""
  );
  const parsed = parser.parse(def);
  const built = buildSchema(parsed, args);
  console.log(built?.toString());
  return built;
}
