{{
function _rawCommand(server, command){
	return { server, ...command }
}
}}

Root
  = lines:(Expression)+ { return lines.filter(line => !line.comment)}

Expression "«"
  = _ line:(@q:Command / comment:Comment { return { comment }}) _ { return line }

// Username "username"
//   = username:([a-zA-Z0-9 \[\]-_] / [^\x00-\x7F|\s])+ { return username.join("").trim() }
Username "username"
  = username:(!LineTerminatorSequence @.)+ { return username.join("").trim() }

Command "command"
  = command:(BanchoCommand / SBCommand)

BanchoCommand "bancho server"
  = ("?" / "!!") command:BaseCommand { return _rawCommand("bancho", command) }

SBCommand "ppy.sb server"
  = "*" command:BaseCommand { return _rawCommand("sb", command) }

BaseCommand "command"
  = q:(StatCommand / RecentCommand / BestScoresCommand / UserpageCommand) sp user: Username { return { ...q, user }} /
    q:ScoreCommand sp id:Int { return {...q, id }} /
    q:BindUserCommand sp user:Username { return {...q, user }} /
    q:BindModeCommand sp mode:Mode { return {...q, mode }}

Mode "mode"
  = m:[a-zA-Z]+ { return m.join("") }
HashtagMode ":mode"
  = "#" @Mode

UserpageCommand
  = "userpage"i { return {type: 'userpage' }}

StatCommand "stat"
  = "stat"i mode:HashtagMode? { return { type: 'stat', mode }}
  
RecentCommand "recent"
  = ("recent"i / "pr"i) mode:HashtagMode? { return { type: 'recent-score', mode } }
  
ScoreCommand "score"
  = "score"i mode:HashtagMode? { return { type: 'score', mode }}

BestScoresCommand
  = ("best"i / "bp"i) 
    find: (
      id: Int { return { id } } / 
      sp last:Last { return { last } } /
      dates: (sp @date:DateCommand)+ {
        return {
          date: dates.reduce((acc,cur) => {
            if (cur.from) {
              acc.from = cur.from
            } else if (cur.to) {
              acc.to = cur.to
            }
            return acc
          },{})
        }
      }
    ) {
    return {
      type: 'best',
	  find
    }
  }
Last
  = "@last" sp hours:Int { return hours }
DateCommand
  = "@" date:(DateFromCommand / DateToCommand) { return date }
DateFromCommand
  = "from"i ":"? sp d:Date { return {from: d}}
DateToCommand
  = "to"i ":"? sp d:Date { return {to: d}}

BindUserCommand
  = "setUser"i { return {type: "set-user" }}
BindModeCommand
  = "setMode"i { return {type: "set-mode" }}

// types
Digit "digit"
 = [0-9]
Int "integer"
  = id:Digit+ { return parseInt(id.join("")) }
Year "year"
  = year:(Digit Digit Digit Digit) { return parseInt(year.join("")) }
Month "month"
  = m:(Digit Digit?) {
    if (m.length == 1) return parseInt(m[0])
    // else if (!m.length) throw new Error("Invalid month")
    else {
      m = parseInt(m.join(""))
      if (m > 12) throw new Error("Invalid month")
      return m
    }
  }
Day "day"
  = m:(Digit Digit?) {
    if (m.length == 1) return parseInt(m[0])
    // else if (!m.length) throw new Error("Invalid month")
    else {
      m = parseInt(m.join(""))
      if (m > 31) throw new Error("Invalid day")
      return m
    }
  }
Date "date"
  = year:Year DateSplitter month:Month DateSplitter day:Day {
  	return { year, month, day }
  }
DateSplitter
  = [-/|]

// utils
sp = WhiteSpace+

_ = WhiteSpace* LineTerminator* WhiteSpace*

SourceCharacter
  = .

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
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" (!("*/" / LineTerminator) SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*