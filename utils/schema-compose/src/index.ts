/* eslint-disable no-use-before-define */
import fs from 'fs'
import { join } from 'path'

import { Schema } from 'koishi'
import peggy from 'peggy'

const grammar = fs.readFileSync(join(__dirname, './grammar.pegjs'), 'utf8')

const parser = peggy.generate(grammar.toString())

const key = 'MCfUBTJVigUebzoCIevR'

type DecoratorDef = {
  decorator: 'required' | 'description' | 'role' | 'hidden' | 'default';
  values: Entry[];
};

type SchemaDef<Type = string> = {
  type: Type;
  value?: Entry;
  values?: Entry[];
  entries?: Array<{
    decorators: DecoratorDef[],
    assign: {
      key: string,
      value: Entry
    }
  }>
  callback?: Entry;
};

type ConstSchemaDef = {
  type: 'const';
  value: string | number | boolean;
};

type Entry<Def = SchemaDef> = {
  decorators: DecoratorDef[];
  schema: Def;
};

type EntryWithList<Def = SchemaDef> = {
  decorators: DecoratorDef[];
  schema: Required<Omit<Def, 'value' | 'callback'>>;
};

const builder = (args: any[]) => {
  function _decorate (kSchema: Schema, { decorator, values }: DecoratorDef) {
    if (!values && ['required', 'hidden'].includes(decorator)) {
      return kSchema[decorator as 'required' | 'hidden']()
    } else if (['role', 'description'].includes(decorator)) {
      const callSign = decorator as 'role' | 'description'
      if (values[0].schema.type === 'const') {
        const constType = values[0].schema as unknown as ConstSchemaDef
        return kSchema[callSign](constType.value.toString())
      }
    } else if (['default'].includes(decorator)) {
      const built = _buildSchema(values[0])
      return kSchema.default(built?.inner)
    } else {
      console.log(decorator, values)
      throw new Error('unknown decorator')
    }
  }

  function _buildTuple (single: any) {
    const { schema } = single
    // console.log("tuple", schema);
    const inner = schema.values.map((value: any) => _buildSchema(value))
    return Schema.tuple(inner)
  }
  function _buildObject (single: Entry) {
    const { schema } = single
    // console.log("object", schema);
    const returnValue: Record<string, any> = {}
    schema.entries?.forEach(
      (entry) => {
        let assigned = _buildSchema(entry.assign.value)
        if (assigned) {
          entry.decorators.forEach((decorator) => {
            if (assigned) assigned = _decorate(assigned, decorator)
          })
        }
        returnValue[entry.assign.key] = assigned
      }
    )
    return Schema.object(returnValue)
  }
  function _buildTypeWithValue (
    single: Entry<SchemaDef<'dict' | 'array'>>
  ) {
    const { schema } = single
    if (!schema.value) {
      throw new Error('expect schema.value to be set')
    }
    // return Schema[schema.type](_buildSchema(schema.value))
    if (schema.type === 'dict') return Schema.dict(_buildSchema(schema.value))
    if (schema.type === 'array') return Schema.array(_buildSchema(schema.value))
    else throw Error('unknown type')
  }

  function _buildTypeWithList (
    single: EntryWithList<SchemaDef<'union' | 'intersect'>>
  ) {
    const { schema } = single
    const built = schema.values.map(_buildSchema)
    return Schema[schema.type](built)
  }

  function _buildTypeWithoutValue (
    single: Entry<
      SchemaDef<
        'any' | 'never' | 'string' | 'number' | 'boolean' | 'bool' | 'const'
      >
    >
  ) {
    const { schema } = single
    if (schema.type === 'bool') schema.type = 'boolean'
    const returnValue = Schema[schema.type](undefined)
    return returnValue
  }

  function _buildConstant (single: Entry<ConstSchemaDef>) {
    const { schema } = single
    // console.log("const", schema);
    if (typeof schema.value === 'string' && schema.value?.startsWith?.(key)) {
      const index = parseInt(schema.value.slice(key.length + 1))
      return args[index]
    }
    return Schema.const(schema.value)
  }

  function _buildTransform (
    single: Entry
  ) {
    const { schema } = single

    if (!schema.value) return
    if (!schema.callback) return
    const built = _buildSchema(schema.value)
    const cb = _buildSchema(schema.callback)
    return Schema.transform(built, cb?.value)
  }

  function _buildSchema (single: Entry): Schema | undefined {
    const copy = single
    const { schema, decorators } = copy
    let returnValue: Schema | undefined
    // console.log(single)
    switch (schema.type) {
      case 'dict':
      case 'array': {
        returnValue = _buildTypeWithValue(
          single as Entry<SchemaDef<'dict' | 'array'>>
        )
        break
      }
      case 'object': {
        returnValue = _buildObject(single)
        break
      }
      case 'tuple': {
        returnValue = _buildTuple(single)
        break
      }
      case 'union':
      case 'intersect': {
        returnValue = _buildTypeWithList(
          single as EntryWithList<SchemaDef<'union' | 'intersect'>>
        )
        break
      }
      case 'any':
      case 'never':
      case 'string':
      case 'number':
      case 'boolean':
      case 'bool': {
        returnValue = _buildTypeWithoutValue(
          single as Entry<
            SchemaDef<
              | 'any'
              | 'never'
              | 'string'
              | 'number'
              | 'boolean'
              | 'bool'
              | 'const'
            >
          >
        )
        break
      }
      case 'const': {
        returnValue = _buildConstant(
          single as unknown as Entry<ConstSchemaDef>
        )
        break
      }
      case 'transform': {
        returnValue = _buildTransform(single as Entry<SchemaDef<'transform'>>)
      }
    }
    if (returnValue && decorators?.length) {
      decorators.forEach((decorator) => {
        if (returnValue) returnValue = _decorate(returnValue, decorator)
      })
    }
    return returnValue
  }
  return _buildSchema
}

export function buildSchema (parsed: Array<string[] | Entry>, args: any[]) {
  const schemas = parsed.filter(
    (entry) => typeof entry === 'object'
  ) as Entry[]

  const build = builder(args)
  if (schemas.length === 0) {
    return undefined
  }
  if (schemas.length === 1) {
    return build(schemas[0])
  }
  return schemas.map(build)
}

export function schema (template: TemplateStringsArray, ...args: any[]) {
  const def = template.reduce(
    (acc, cur, index) =>
      `${acc}${cur}${index < template.length - 1 ? `${key}_${index}` : ''}`,
    ''
  )
  const parsed = parser.parse(def)
  const built = buildSchema(parsed, args)
  // console.log(built?.toString());
  return built
}
