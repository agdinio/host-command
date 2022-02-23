const fs = require('fs')
const superagent = require('superagent')
const utils = require('util')
const TitleId = '218'
const Secret = 'YZPCUDSFQYNPP4E73F3PX3X6EOCUX14I67HWZJ5QU3ROSTASRQ'
const tokenUser = 'A2895D633A2595CB'
function admin(endpoint, sessionTicket = null) {
  return superagent
    .post(`https://${TitleId}.playfabapi.com/Admin/${endpoint}`)
    .type('json')
    .set({ 'Accept-Encoding': 'gzip,sdch' })
    .set('X-SecretKey', Secret)
}

if (!process.argv[2]) {
  console.log('No token File')
  process.exit(1)
}

if (!process.argv[3]) {
  console.log('No playID')
  process.exit(1)
}

try {
  fs.readFile(process.argv[2], 'utf8', function(err, data) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    const DataArray = data.split(',').map(o => `${o.replace('\r\n', '')}`)
    console.log('Total Chunks: ' + Math.ceil(DataArray.length / 10))
    for (let i = 0; i < DataArray.length; i += 10) {
      const Data = {}
      DataArray.slice(i, i + 10).forEach(token => {
        Data[token] = process.argv[3]
      })
      admin('UpdateUserInternalData')
        .send({
          PlayFabId: tokenUser,
          Data,
        })
        .then(() => {
          console.log(`Successfulyl Uploaded Chunk ${i / 10 + 1}`)
        })
        .catch(e => {
          console.log(e)
        })
    }
  })
} catch (e) {
  console.error(e)
  process.exit(1)
}
