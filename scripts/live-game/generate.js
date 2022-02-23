/*
Usage:
   Export the Live Game Script from Google Docs to a local .csv
   file named 'LiveGameDB.csv' into this directory. Then run this
   script and hope that no indexes have changed. This script
   will only generate the Live Game portion fo the script. PrePicks
   data contains incompatible formats for parsing csv (like comma
   delimited cell values).

Columns:
   Order
   Type
   Play Title
   Slider Type
   Selection Trigger
   Options
   Team Specific
   Action Title
   Correct Option RESULTS
   Message - Play Card
   Footage-Timer/Sec.
   --
   --
   --
   Automated Triggered Play Card
   Prize/Winnings
   BG
   GameClock
   TimeCode
*/

const path = require('path')
const fs = require('fs')
const d3 = require('d3-dsv')
const LiveGameDbFile = path.join(__dirname, 'LiveGameDB.csv')

const Indexes = {
  PrePickTeamsStart: 1,
  PrePickTeamsEnd: 1,
  PrePickStart: 6,
  PrePickEnd: 15,
  LiveGameStart: 27,
}

let contents = fs.readFileSync(LiveGameDbFile, 'utf8')
let rows = d3.csvParseRows(contents)

writeLiveGameScript(rows)

function checkNull(a) {
  if (a.replace(/-/g, '') === '``') {
    return null
  }
  return a
}

function writeLiveGameScript(rows) {
  let parsed = rows.slice(Indexes.LiveGameStart)

  let results = parsed.map((row, index) => {
    let value = safe.bind(this, row)
    const length = value(5)
      .replace(/`/g, '')
      .split(',')
      .map(o => `'${o.replace(' –– Touchdown', '').trim()}'`)
      .filter(o => o && o !== "''").length
    return `{
         sequence: ${index + 10},
         componentName: 'MultiplierQuestion',
         type:  ${checkNull(value(1))},
         playTitle:  ${checkNull(value(2))},
         component:  ${checkNull(value(3))},
         choices:  [${value(5)
           .replace(/`/g, '')
           .split(',')
           .map(o => `'${o.replace(' –– Touchdown', '').trim()}'`)
           .filter(o => o && o !== "''")
           .map(
             (o, i) =>
               length > 2 && o ? JSON.stringify({ id: i, value: o }) : o
           )}],
        forTeam:  {id: ${value(6) === `\`Team B\`` ? 1 : 2}, teamName: ${
      value(6) === `\`Team B\``
        ? safe.bind(this, rows[2])(1)
        : safe.bind(this, rows[1])(1)
    }},
         title:  ${checkNull(value(7))},
         shortHand: ${checkNull(value(7))},
         choiceType: ${length > 2 ? "'MULTI'" : "'AB'"},
         points: 50,
         tokens: 20,
         answer:  ${checkNull(value(8))},
         labels:  [{sequence: 1, value: ${checkNull(value(9))}}],
         length : ${parseInt(value(12).replace(/`|:/g, ''), 10) -
           parseInt(value(11).replace(/`|:/g, ''), 10)},
         specialTimer:  ${parseInt(value(12).replace(/`|:/g, ''), 10)},
         note:  ${checkNull(value(14))}
      }`
  })

  let exported = `
   module.exports = [
     {
       componentName: 'GetReady',
       length: 20,
     },
     {
       componentName: 'ExplainationScreen',
       length: 4,
     },
      {{ CONTENTS }}
   ]
   `.replace('{{ CONTENTS }}', results)

  return fs.writeFileSync(path.join(__dirname, 'LiveGameScript.js'), exported)
}

function safe(row, index) {
  return `\`${row[index]}\`` || ''
}
