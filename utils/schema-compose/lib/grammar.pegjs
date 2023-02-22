Input =
 (Schema / @Comment)*

Schema =
  decorators: (_ @SchemaDecorator _)*
  _ schema: (
  SchemaUnion
  / SchemaIntersect
  / SchemaWithoutUnionAndIntersect
  ) _
 {
   if (decorators.length) { return { decorators, schema }}
   else return { schema }
 }

SchemaWithoutUnionAndIntersect = 
  SchemaConst
  / SchemaWithList
  / SchemaWithValue
  / SchemaWithNoValue
  / SchemaTemplate
  / SchemaConstValue
  / SchemaObject
  / SchemaTuple 
  / SchemaNumber 
  / SchemaString
  / SchemaBoolean
  / SchemaIs
SchemaDecorator =
  "@" decorator: VariableName sp* values:('(' list:List ')'{
  	return list.values
  })?
  { return { decorator, values } }

SchemaObject = 
  "{" _
    entries:(@ObjectEntryDef _ ','?)*
  _ "}"
  {
    return {
      type: 'object',
      entries
    }
  }

List = 
  Comment* item:Schema? _ items:(',' _ Comment? @Schema)* 
  {
    const returnValue = []
    if (item) { returnValue.push(item)}
    if (items.length) returnValue.push(...items)
    return {
      type: 'list',
      values: returnValue
    }
  }


SchemaTuple =
 '[' _
    list:List? ','?
 _ ']'
{
  return { type: 'tuple', values: list.values }
}
 
SchemaString =
  val:string {
  	return {
      type: 'string',
      value: val
    }
  }

SchemaConstValue =
  value:(
    num:SchemaNumber {
      return {
        ...num,
        type: 'const'
      }
    }
  / str:SchemaString {
    return {
      ...str.value,
      type: 'const'
    }
  }
  / bool:(true / false) {
    return {
      value: bool
    }
  }
  / value:VariableName {
    return {
      type: 'variable',
      value
    }
  }
  ) {
    return {
      type: 'const',
      ...value,
    }
  }

SchemaConst = 
  'const'i _ '(' _ @SchemaConstValue  _ ')'

SchemaBoolean = 
  kw:(
    'boolean'i
    / 'bool'i
  ) _ "("_ value:(true / false) _ ")"
  {
    return {
      type: 'boolean',
      value
    }
  }

SchemaIs =
  'is'i "(" _ value:VariableName? _ ")"
  {
    return {
      type: 'is',
      value
    }
  }

SchemaTemplate =
  kw:('transform'i) _ "(" _ value:Schema _ ',' _ callback:SchemaConstValue? _ ")"
  {
    return {
      type: kw,
      callback: {
        schema: callback
      },
      value
    }
  }

SchemaUnion = 
   '|'? _ decorator:SchemaDecorator? item:SchemaWithoutUnionAndIntersect _ 
  items:('|' _ decorator2:SchemaDecorator? _ value2:SchemaWithoutUnionAndIntersect _ {
    return {
     	decorator: decorator2,
        schema: value2
    }
  })+
  {
    const returnValue = []
    if (item) { returnValue.push({schema: item})}
    if (items.length) returnValue.push(...items)
    return {
      type: 'union',
      values: returnValue
    }
  }
  
SchemaIntersect = 
   '&'? _ decorator:SchemaDecorator? item:SchemaWithoutUnionAndIntersect _ 
  items:('&' _ decorator2:SchemaDecorator? _ value2:SchemaWithoutUnionAndIntersect _ {
    return {
     	decorator: decorator2,
        schema: value2
    }
  })+
  {
    const returnValue = []
    if (item) { returnValue.push({schema: item})}
    if (items.length) returnValue.push(...items)
    return {
      type: 'intersect',
      values: returnValue
    }
  }


SchemaWithList = 
  kw:(
    'union'i
    / 'intersect'i
  ) _ '(' _ values:SchemaTuple _ ')'
  {
    return {
      values: values.values,
      type: kw
    }
  }

SchemaWithValue = 
  kw:(
    'dict'i
    / 'array'i
  ) _ '(' _ value:(!SchemaTuple @Schema) _ ')'
  {
    return {
      value,
      type: kw
    }
  }

SchemaWithNoValue = 
 kw:(
   'any'i
   / 'never'
   / 'string'
   / 'number'
   / 'boolean'
   / 'bool'
   / 'string'
   / 'const'
 )
 {
   return { type: kw }
 }
ObjectEntryDef = 
  Comment*
  decorators:(_ @SchemaDecorator _)*
  _ assign:ObjectAssignValue _
  {
    return { decorators, assign }
  }

ObjectAssignValue =
  key:VariableName _ ':' _  value:(Schema / VariableName)
  {
    return {
      key,
      value
    }
  }
  
SchemaNumber =
  value:number
  { return { type: 'number', value }}
  
JSON_text
  = ws value:value ws { return value; }

begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws "," ws

ws "whitespace" = [ \t\n\r]*

// ----- 3. Values -----

value
  = false
  / null
  / true
  / object
  / array
  / number
  / string

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

// ----- 4. Objects -----

object
  = begin_object
    members:(
      head:member
      tail:(value_separator m:member { return m; })*
      {
        var result = {};
        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });
        return result;
      }
    )?
    end_object
    { return members !== null ? members: {}; }

member
  = name:(string / VariableName) name_separator value:value {
      return { name: name, value: value };
    }

// ----- 5. Arrays -----

array
  = begin_array
    values:(
      head:value
      tail:(value_separator v:value { return v; })*
      { return [head].concat(tail); }
    )?
    end_array
    { return values !== null ? values : []; }

// ----- 6. Numbers -----

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point
  = "."

digit1_9
  = [1-9]

e
  = [eE]

exp
  = e (minus / plus)? DIGIT+

frac
  = decimal_point DIGIT+

int
  = zero / (digit1_9 DIGIT*)

minus
  = "-"

plus
  = "+"

zero
  = "0"

// ----- 7. Strings -----

string "string"
  = StringLiteral

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

unescaped
  = [^\0-\x1F\x22\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i

//util
VariableName
  = &[^0-9] @$[a-zA-Z0-9_]+

sp = WhiteSpace+

_ = WhiteSpace* LineTerminator* WhiteSpace*

SourceCharacter
  = .
  
StringLiteral "string"
  = '"' chars:DoubleStringCharacter* '"' {
      return { type: "Literal", value: chars.join("") };
    }
  / "'" chars:SingleStringCharacter* "'" {
      return { type: "Literal", value: chars.join("") };
    }
  / "`" chars:(QuoteStringCharacter)* "`" {
      return { type: "Literal", value: chars.join("") };
    }

DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

SingleStringCharacter
  = !("'" / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

QuoteStringCharacter
  = !("`" / "\\") SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

LineContinuation
  = "\\" LineTerminatorSequence { return ""; }

EscapeSequence
  = CharacterEscapeSequence
  / "0" !DecimalDigit { return "\0"; }
  / HexEscapeSequence
  / UnicodeEscapeSequence

CharacterEscapeSequence
  = SingleEscapeCharacter
  / NonEscapeCharacter

SingleEscapeCharacter
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b"; }
  / "f"  { return "\f"; }
  / "n"  { return "\n"; }
  / "r"  { return "\r"; }
  / "t"  { return "\t"; }
  / "v"  { return "\v"; }

NonEscapeCharacter
  = !(EscapeCharacter / LineTerminator) SourceCharacter { return text(); }

EscapeCharacter
  = SingleEscapeCharacter
  / DecimalDigit
  / "x"
  / "u"

HexEscapeSequence
  = "x" digits:$(HexDigit HexDigit) {
      return String.fromCharCode(parseInt(digits, 16));
    }

UnicodeEscapeSequence
  = "u" digits:$(HexDigit HexDigit HexDigit HexDigit) {
      return String.fromCharCode(parseInt(digits, 16));
    }
HexDigit
  = [0-9a-f]i
DecimalDigit
  = [0-9]

// Separator, Space
Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

Comment "comment"
  = c:(MultiLineComment
  / SingleLineComment)
  {
    return {
      type: 'comment',
      content: c
    }
  }

MultiLineComment
  = "/*" $(!"*/" @$SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" $(!("*/" / LineTerminator) @SourceCharacter)* "*/"

SingleLineComment
  = "//" $(!LineTerminator @SourceCharacter)*