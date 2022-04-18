{{
// const banchoCommand = ['?', '!!']
const defaultTrigger = {
  bancho: ['?', '!!'],
  sb: ['*']
}
function _trigger(test) {
  const trigger = options.trigger ?? defaultTrigger
  for (const server in trigger) {
    const triggers = trigger[server]
    if (triggers.includes(test)) return { server }
  }
  return false
}
function _rawCommand(server, command){
	return { server, ...command }
}
}}

Root
  = lines:(Line)+

Line "command or comment"
  = _ @(Command / Comment) _

Command "command"
  // = command:(BanchoCommand / SBCommand)
  = trigger:Trigger command:BaseCommand { return {...trigger, ...command} }

Trigger
  = kw:$[^a-zA-Z]+ &{ return _trigger(kw) } { return _trigger(kw) }

BaseCommand "command"
  = q:(StatCommand / RecentCommand / BestScoresCommand / UserpageCommand) me:Me? mode:HashtagMode? user:(sp @Username)? { return { ...q, ...me, mode, user }} /
    q:ScoreCommand sp id:Int { return {...q, id }} /
    q:BindUserCommand sp user:Username { return {...q, user }} /
    q:BindModeCommand sp mode:Mode? { return {...q, mode }}

UserpageCommand
  = "userpage"i { return {type: 'userpage' } }

StatCommand "stat"
  = "stat"i { return { type: 'stat' } }
  
RecentCommand "recent"
  = ("recent"i / "pr"i) { return { type: 'recent-score' } }
  
ScoreCommand "score"
  = "score"i { return { type: 'score' } }

BestScoresCommand "best"
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
  = "@last" sp @hours:Int
DateCommand
  = "@" @date:(DateFromCommand / DateToCommand)
DateFromCommand
  = "from"i ":"? sp d:Date { return {from: d} }
DateToCommand
  = "to"i ":"? sp d:Date { return {to: d} }

BindUserCommand
  = "setUser"i { return {type: "set-user" } }
BindModeCommand
  = "setMode"i { return {type: "set-mode" } }

Me
  = "me" { return { forceDatabase: true } }
Mode "mode"
  = m:$[a-zA-Z]+
HashtagMode ":mode"
  = "#" @Mode

// types
// Username "username"
//   = username:([a-zA-Z0-9 \[\]-_] / [^\x00-\x7F|\s])+ { return username.join("").trim() }
Username "username"
  = username:$(!Line @.)+ { return username.trim() }
Digit "digit"
 = [0-9]
Int "integer"
  = id:$Digit+ { return parseInt(id) }
Year "year"
  = year:$(Digit Digit Digit Digit) { return parseInt(year) }
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
  = comment:(MultiLineComment
  / SingleLineComment) { return { comment } }

MultiLineComment
  = "/*" (!"*/" @SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" (!("*/" / LineTerminator) @SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator @SourceCharacter)*