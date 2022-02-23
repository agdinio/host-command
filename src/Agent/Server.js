import util from 'util'
import socketCluster from 'socketcluster-client'

let socket = null

// Used to establish connection with Ambassador Server
// hostname will need to be changed when the Server is
//    running somewhere else besides localhost
// TODO: Hardcode live connection string
const connectOptions = {
  //hostname: 'ec2-34-213-107-178.us-west-2.compute.amazonaws.com',
  hostname: 'ec2-34-221-93-246.us-west-2.compute.amazonaws.com',
  port: 7700,
  path: '/socketcluster',
  autoReconnectOptions: {
    initialDelay: 6000,
    randomness: 10000,
    multiplier: 1.5,
    maxDelay: 60000,
  },
}

//------------------------------------------------------------------------
const debug = obj => {
  return console.log(util.inspect(obj, { depth: null }))
}

//------------------------------------------------------------------------
const connect = () => {
  if (socket == null) {
    socket = socketCluster.create(connectOptions)

    socket.on('subscribeFail', function(channelname) {
      console.log(
        '[Server Socket] Failed to Subscibe to Channel:' + channelname
      )
    })

    socket.on('connect', status => {
      console.log('Ambassador Server is connected')
      // Add code here to check if authenticated
      if (status.isAuthenticated) {
        console.log('connection status:')
        debug(status)
      } else {
        console.log('client not authenticated:')
        debug(status)
      }
    })

    socket.on('close', _ => {
      console.log(`[Server Socket] Socket has closed`)
    })
  }
}

//------------------------------------------------------------------------
//-- Exported
//------------------------------------------------------------------------
export function send(channel, data) {
  return new Promise((resolve, reject) => {
    connect()
    console.log(`[Server Send : ${channel}]`)
    console.dir(data)
    socket.emit(channel, data, response => {
      if (response.success) {
        return resolve(response.response)
      } else {
        //return reject(response)
      }
    })
  })
}

//------------------------------------------------------------------------
export const validateKey = key => {
  return send('key.validate', key)
}

//------------------------------------------------------------------------
export const registerUser = ({
  username,
  email,
  password,
  phone,
  name,
  token,
}) => {
  return send('user.register', {
    username,
    email,
    password,
    phone,
    name,
    token, // Only used in Ambassador Pass & Live Beta
  })
}

//------------------------------------------------------------------------
export const login = (email, password = 'AmbassadorPass.v1') => {
  console.log(`Logging in...`)
  return send('user.login', {
    username: email,
    password,
  })
}

export const getInvitees_ = () => {
  return send('user.invites.list', {})
}

export const getInvitees = () => {
  return send('user.get.social', {})
}

export const shareViaEmail = params => {
  console.log('Inviting via email...')
  /*
  let successCount = 0;
  let respInv = undefined;
  for (let i=0; i<sharedEmails.length; i++) {
    let email = sharedEmails[i].trim()
    send('email.invite', sharedEmails)
      .then(response => {
        successCount = successCount + 1;
        respInv = response
      })
  }

  if (successCount === sharedEmails.length) {
    return Promise.resolve(respInv)
  }
*/

  //return send('invitee.setlist', params)
  return send('email.invite', params)
}

export const getProfile = args => {
  console.log('Fetching profile...')
  return send('user.get.profile', args)
}

export const updateDisplayName = val => {
  console.log('Updating displayname...')
  let args = {
    displayName: val,
    currentPassword: 'AmbassadorPass.v1',
  }
  return send('user.set.displayname', args)
}

export const updateEmail = val => {
  console.log('Updating email...')
  let args = {
    email: val,
    currentPassword: 'AmbassadorPass.v1',
  }
  return send('user.set.email', args)
}

export const updatePhone = val => {
  console.log('Updating phone...')
  let args = {
    newPhone: val,
    currentPassword: 'AmbassadorPass.v1',
  }
  return send('user.set.phone', args)
}

export const updateNotifications = val => {
  console.log('Updating notifications...')
  return send('user.set.notifications', val)
}

export const creditCurrencies = val => {
  return send('user.currency.credit', val)
}

export const debitCurrencies = val => {
  return send('user.currency.debit', val)
}

export const getKey = () => {
  console.log('Fetching key...')
  return send('')
}

export const updateUserPlaythrough = () => {
  console.log('Updating user playthrough')
  return send('user.playthrough')
}

export const getLeaderboard = () => {
  console.log('Fetching leaderboard...')
  return send('leaderboard.top.ap')
}

export const getKeySharedCredits = () => {
  console.log('Fetching key shared credits...')
  return send('user.getkeysharedcredits')
}

export const getUserDisplayNameByKey = key => {
  console.log("Fetching user's display name...")
  return send('key.lookup.user', key)
}

export const analyticsStartTimer = key => {
  console.log(`Backend start timer for ${key}`)
  _checkForPreviousTimerEnd(key) // also records start for this key
  return send('analytics.timer', { key: key, start: true })
}

export const analyticsStopTimer = key => {
  console.log(`Backend stop timer for ${key}`)
  _deleteStartedTimer(key)
  return send('analytics.timer', { key: key, start: false })
}

export const analyticsCount = key => {
  console.log(`Backend count for ${key}`)
  return send('analytics.count', { key: key })
}

export const analyticsRecordAnswer = (key, answer) => {
  console.log(`Backend record answer "${answer}" for ${key}`)
  return send('analytics.custom', { key: key, data: answer })
}

const _deleteStartedTimer = key => {
  connect()
  delete socket['timer_started'][key]
}

const _checkForPreviousTimerEnd = key => {
  // check to make sure previous question timer ended
  connect()
  if (!socket['timer_started']) {
    socket['timer_started'] = {}
  }
  socket['timer_started'][key] = true
  const questionRegex = /player.+\.([0-9]+)\.time/
  const keyMatches = questionRegex.exec(key)
  if (keyMatches) {
    const questionNumber = keyMatches[1]
    const prevQuestion = parseInt(questionNumber, 10) - 1
    if (prevQuestion > 0) {
      const prevKey = key.replace(keyMatches[1], prevQuestion.toString())
      if (socket['timer_started'][prevKey]) {
        analyticsStopTimer(prevKey)
      }
    }
  }
}
