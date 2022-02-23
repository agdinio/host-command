let socket = {}

const _deleteStartedTimer = key => {
  // connect()
  delete socket['timer_started'][key]
}

const _checkForPreviousTimerEnd = key => {
  // connect()
  if (!socket['timer_started']) {
    socket['timer_started'] = {}
  }
  // check to make sure previous question timer ended
  const questionRegex = /player.+\.([0-9]+)\.time/
  const keyMatches = questionRegex.exec(key)
  if (keyMatches) {
    // prepick or live play
    socket['timer_started'][key] = true // start current keuy
    const questionNumber = keyMatches[1]
    const prevQuestion = parseInt(questionNumber, 10) - 1
    if (prevQuestion > 0) {
      const prevKey = key.replace(keyMatches[1], prevQuestion.toString())
      if (socket['timer_started'][prevKey]) {
        analyticsStopTimer(prevKey)
      }
    }
  } else {
    // it's a menu timer
    const menuKeys = Object.keys(socket['timer_started'])
    menuKeys.forEach(k => {
      if (k.startsWith('player.menu')) {
        // analyticsStopTimer(k)
        _deleteStartedTimer(k)
      }
    })
    socket['timer_started']['player.menu.' + key + '.time'] = true
  }
  console.log('socket', socket)
}

_checkForPreviousTimerEnd('leaderboard')
_checkForPreviousTimerEnd('prizechests')
_checkForPreviousTimerEnd('yourkey')

console.log('socket', socket)
