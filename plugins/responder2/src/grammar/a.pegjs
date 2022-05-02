Root
  = lines:(Line)+

Line
  = _ @(Comment / Config) _


Config "incomingMessage"
  = type:(('incomingMessage' / 'on' / 'im' / '$') { return { type: 'incomingMessage' } })
    cond:Condition
    Do
    _
    action:(Reply / Execute)
    _
  {
  	return {...type, cond, action}
  }

 

Condition "condition"
  = IncludeCondition / StartsWithCondition / EqualCondition / ExecuteCondition

ExecuteCondition
  = sp* (Do / 'exec') @Execute

IncludeCondition
  = sp* 'includes' _ content:StringLiteral _ { return {type: 'includes' , content: content.value }}

StartsWithCondition
  = sp* 'startsWith' _ content:StringLiteral _ { return {type: 'startsWith' , content: content.value }}

EqualCondition
  = sp* eq:( 
  '===' { return 'eqeqeq' }
  / '==' { return 'eqeq' }
  / '=' { return 'eq' }
  / 'is' { return 'eqeqeq' }
  / 'equals' { return 'eqeqeq' }
  ) _ content:StringLiteral _ { return {type: 'equals' , eq, content: content.value }}
  
Do
  = _ '->' _


Execute
  = async:("async" { return true })? sp* 
  names:(@(SessionName / SessionContextName / NoName) _ '=>' _ )?
  code:(code:Function {return { code }} / inline:InlineFunction { return {code: inline, inline: true}}) 
  { return {type: 'exec', async: async || false, ...code, names}}
InlineFunction
  = !Config !Do @$(!Config !Do [^\n])+
Function
  = "{" _ @TextUntilTerminator _ "}"
TextUntilTerminator
 = $(&HaveTerminatorAhead .)*

HaveTerminatorAhead
 = . _ !Config !Do (!"}" .)* "}" 

Reply
  = StringLiteral
  
NoName
  = '()' { return {session: false, context: false}}
SessionName
  = name:VariableName { return { session: name } }
  
SessionContextName
  = sp* "(" sp* session:VariableName sp* context:(")" / @("," sp* @VariableName sp* ')'))
  {
  	return {session, context}
  }
// utils
VariableName
  = &[^0-9] @$[a-zA-Z0-9]+

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

DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

SingleStringCharacter
  = !("'" / "\\" / LineTerminator) SourceCharacter { return text(); }
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
  = (MultiLineComment
  / SingleLineComment)

MultiLineComment
  = "/*" $(!"*/" @$SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" $(!("*/" / LineTerminator) @SourceCharacter)* "*/"

SingleLineComment
  = "//" $(!LineTerminator @SourceCharacter)*