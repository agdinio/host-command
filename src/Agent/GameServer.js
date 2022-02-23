import util from 'util'
import axios from 'axios'
import config from '@/Agent/config'
import socketCluster from 'socketcluster-client'
import PlayStore from '@/stores/PlayStore'
import GameStore from '@/stores/GameStore'
import CommandHostStore from '@/stores/CommandHostStore'
import PrePlayStore from '@/stores/PrePlayStore'

const API_URL = `${config.PROTOCOL}://${config.URL}:${config.PORT}`
let socket = null
let currentManagedGame = {}
let currentManagedGameInfo = {}
let isDatabaseResettingFromLocal = false
let showDatabaseResetLoader = false
const anyTypes = 'liveplay1x, gamemaster, sponsorplay, prizeplay, announce'

let gameSubscriptionChannel = null

// Used to establish connection with Ambassador Server
// hostname will need to be changed when the Server is
//    running somewhere else besides localhost
// TODO: Hardcode live connection string
const connectOptions = {
  //hostname: 'ec2-54-202-177-20.us-west-2.compute.amazonaws.com',
  //hostname: '198.12.225.224',
  hostname: config.URL,

  //hostname: 'ec2-35-164-175-253.us-west-2.compute.amazonaws.com',
  //update1 hostname: 'ec2-54-188-137-103.us-west-2.compute.amazonaws.com',
  port: config.PORT,
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
        '[Server Socket] Failed to Subscribe to Channel:' + channelname
      )
    })

    socket.on('connect', status => {
      console.log('Game Server is connected')
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
      // if (currentManagedGame['hostGameChannel']) {
      //   //currentManagedGame['hostGameChannel'].unwatch(hostGameChannelWatcher)
      //   socket.destroyChannel(currentManagedGame['hostGameChannel'].name)
      // }
    })

    socket.on('error', _ => {
      console.log('Game Socket Error')
      GameStore.setError(true)
    })

    socket.on('client.automation.credentials', (args, respond) => {
      respond(
        JSON.stringify({
          headless: GameStore.headless,
          executionType: GameStore.executionType,
          isViewRecordedEvent: GameStore.isViewRecordedEvent,
        })
      )
    })

    socket.on('client.info', data => {
      GameStore.setInfo(data)
    })

    socket.on('client.play.current', data => {
      GameStore.setPlayCurrent(data)
    })
    socket.on('client.play.next', data => {
      GameStore.setPlayNext(data)
    })
    socket.on('client.play.stack', data => {
      console.log('CLIENT.PLAY.STACK')
      GameStore.setPlayStack(data)
    })
    socket.on('client.play.unresolved', data => {
      GameStore.setPlayUnresolved(data)
    })
    socket.on('client.play.resolved', data => {
      GameStore.setPlayResolved(data)
    })

    socket.on('disconnect', _ => {
      console.log(`[Server Socket] Socket has disconnected`)
      socket.destroy()
    })
  }
}

export function send(channel, data) {
  return new Promise((resolve, reject) => {
    connect()
    console.log(`[Server Send : ${channel}]`)
    socket.emit(channel, data, (response, err) => {
      if (err) {
        PlayStore.showErrorPage(err)
      }
      if (response) {
        if (response.success) {
          return resolve(response.response)
        } else {
          return reject(response)
        }
      }
    })
  })
}

export function receive(channel) {
  return new Promise((resolve, reject) => {
    console.log(`[Server Receive]`)
    socket.on(channel, response => {
      return resolve(response)
    })
  })
}

export const broadcastPlay = type => {
  return send('games.changeplay', type)
}

export const broadcastLockout = val => {
  return send('games.lockplay', val)
}

export const endPlay = val => {
  return send('games.endplay', val)
}

export const changeNextPlay = val => {
  return send('games.changenextplay', val)
}

export const showResult = val => {
  return send('games.result', val)
}

export const broadcastResolvePending = val => {
  return send('games.resolve', val)
}

export const announcement = val => {
  return send('games.announcement', val)
}

export const typeList = () => {
  return send('games.typelist', {})
}

export const activeGame = args => {
  return send('games.active', args)
}

//*************************************************** PLAYSTORE ********************************************************

const promiseChain = tasks => {
  return tasks.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult => [...chainResults, currentResult])
    )
  }, Promise.resolve([]))
}

export const resetDatabaseOLD = () => {
  isDatabaseResettingFromLocal = true
  return send('games.resetdb', {})
}

export const resetDatabasex = () => {
  let gameIds = []
  return send('games.info', {})
    .then(games => {
      gameIds = games.map(g => g.id)
      let playIds = []
      games.forEach(g => {
        // console.log('resetDatabase plays', g.id, g.plays)
        const newPlayIds = Object.keys(g.playStack.stack)
        playIds = playIds.concat(newPlayIds)
      })
      const playTasks = []
      playIds.forEach(p => {
        playTasks.push(send('games.delete', { entityType: 'Play', id: p }))
      })
      return promiseChain(playTasks)
    })
    .catch(err => {
      console.log('could not delete all plays', err)
    })
    .then(deletePlaysReponse => {
      //console.log('deleted plays reponse', deletePlaysReponse)
      // delete games
      const gameTasks = []
      gameIds.forEach(g => {
        gameTasks.push(send('games.delete', { entityType: 'Game', id: g }))
      })
      return promiseChain(gameTasks)
    })
    .then(deleteGamesReponse => {
      //console.log('deleted games reponse', deleteGamesReponse)
      /*
      if (socket.subscriptions().length > 0) {
        socket.subscriptions().forEach(subs => {
          socket.unsubscribe(subs)
        })
      }
*/
    })
    .catch(err => {
      console.log('could not get games and/or plays', err)
    })
}

export const gamesInfo = args => {
  return send('games.info', args)
}

export const authenticate = args => {
  return send('authentication', args)
}

export const gamesCreateX2 = args => {
  return send('games.create', args)
    .then(response => {
      console.log('initially created game', response.item.id)
      return response.item.id
    })
    .catch(err => {
      console.log(`error in setting up the database ${err}`)
    })
}

export const gamesCreate = args => {
  let testGame
  return send('games.create', args)
    .then(response => {
      console.log('initially created game', response.item.id)
      return send('games.pending', { progress: 'Pending' })
    })
    .then(games => {
      testGame = games[0]
      console.log(`pending games ${games.map(g => g.id)}`)
      return send('games.info', [testGame.id])
    })
    .then(gamesInfo => {
      testGame.playStack = gamesInfo[0].playStack
      return send('games.update', { entityType: 'Game', value: testGame })
    })
    .then(updateResponse => {
      return (testGame = updateResponse.item)
    })
    .catch(err => {
      console.log(`error in setting up the database ${err}`)
    })
}

export const gamesPending = args => {
  return send('games.pending', args)
}

export const gamesUpdate = args => {
  return send('games.update', args)
}

export const gamesUpdatePreset = args => {
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.removeplayfromstack',
    data: { playId: args.playId },
  })
}

export const removePlayFromStack = playId => {
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.removeplayfromstack',
    data: { playId: playId },
  })
}

export const gamesRead = args => {
  return send('games.read', args)
}

export const addThePlay_OLD = play => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.addplaytostack',
    data: { play: play },
  })
}

export const gamesGoPlay = playToGo => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.goplay',
    data: { play: playToGo },
  })
}

export const gamesStart_OLD = () => {
  connect()
  currentManagedGame['hostGameChannel'].publish(
    { event: 'games.start' },
    err => {
      if (err) {
        console.log('game start failed', err)
      }
    }
  )
}

export const gamesStartPlay = playId => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.startplay',
    data: { playId: playId },
  })
}

export const gamesLockPlay = playId => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.lockplay',
    data: { playId: playId },
  })
}

export const gamesEndPlay = args => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.endplay',
    data: { playId: args.playId, result: args.result },
  })
}

export const gamesConfirmPlay = playId => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.confirmplay',
    data: { playId: playId },
  })
}

export const gamesEndGame = () => {
  connect()
  currentManagedGame['hostGameChannel'].publish(
    { event: 'games.endgame' },
    err => {
      if (err) {
        console.log('game end failed', err)
      } else {
        console.log('game successfully ended')
      }
    }
  )
}

export const movePlayBeforeOLD = args => {
  connect()
  // currentManagedGame['hostGameChannel'].publish({
  //   event: 'games.moveplaybefore',
  //   data: { playId: args.playId, beforeId: args.beforeId },
  // })
  console.log('MOVE PLAY BEFORE')
}

export const manageGame = game => {
  return new Promise(resolve => {
    connect()
    currentManagedGame = game
    currentManagedGame['hostGameChannel'] = socket.subscribe(game.id + '.host')
    establishHostWatchers()
    resolve(currentManagedGame['hostGameChannel'])
  })
}

const establishHostWatchers = () => {
  const hostChannel = currentManagedGame['hostGameChannel']
  if (hostChannel.watchers().length <= 0) {
    hostChannel.on('subscribe', hostGameChannelWatcher)
  }
}

const hostGameChannelWatcher = (data, res) => {
  const hostGameChannel = currentManagedGame['hostGameChannel']
  hostGameChannel.watch(data => {
    switch (data.event) {
      case 'plays.stackupdate':
        console.log('PLAYS.STACKUPDATE', data.data)
        PlayStore.updatePlayStack({
          playStack: data.data.playStack,
          plays: data.data.plays,
        })
        break
      case 'games.update':
        const updatedGame = Object.assign(currentManagedGameInfo, data.data)
        console.log('GAMES.UPDATE', updatedGame)
        //PlayStore.updateGameX1(updatedGame)
        PlayStore.setGame(data.data)
        break
      case 'games.startplay':
        console.log('GAMES.STARTPLAY', PlayStore.game.id, data)
        //PlayStore.updateGame()
        PlayStore.gamesStartPlayNull(data.data)
        break
      case 'games.endplay':
        console.log('GAMES.ENDPLAY', data.data)
        PlayStore.gamesEndPlayResult(data.data)
        break
      case 'plays.update':
        console.log('PLAYS.UPDATE', data.data)
        PlayStore.playUpdate(data.data)
        break
      case 'games.endgame':
        console.log('GAMES.ENDGAME')
        PlayStore.gamesEndGameWatch()
        break
      case 'database.reset':
        console.log('DATABASE.RESET', data.data)
        if (!isDatabaseResettingFromLocal) {
          PlayStore.setShowDatabaseResetLoader(true)
        }
        break
      default:
        if (
          [
            'games.prepickstart',
            'games.ready',
            'games.start',
            'games.endplay',
            'games.addplaytostack',
            'games.removeplayfromstack',
            'games.goplay',
            'games.lockplay',
            'games.confirmplay',
            'games.moveplaybefore',
          ].indexOf(data.event) < 0
        ) {
          // missing implementation
          console.log('unimplemented event', data)
        }
    }
  })

  console.log('SUBSCRIBED', currentManagedGame['hostGameChannel'])
}

///////////////////////////////////////////MY OWN CONFIG////////////////////////////////////////////////////////////////
let syncGuid = ''
export const sendBeaconLastSessionTime = args => {
  navigator.sendBeacon(
    `${API_URL}/analytics/last_session_time`,
    JSON.stringify(args)
  )
}

export const connectSC = () => {
  connect()
}

export const setHeadless = args => {
  connect()
  gameSubscriptionChannel.publish({
    event: 'host.automation.headless',
    data: { isHeadless: args, gameId: GameStore.gameId },
  })
}

export const addThePlay = play => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.play.add', data: play })
}

export const updatePlay = play => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.play.update', data: play })
}

export const removePlay = params => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.play.remove', data: params })
}

export const gameStart = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.game.start', data: args })
}

export const gameResume = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.game.resume', data: args })
}

export const gamePause = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.game.pause', data: args })
}

export const gameEnd = gameId => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.game.end', data: gameId })
}

export const goPlay = play => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.play.go', data: play })
}

export const resolvePlay = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.play.resolve', data: args })
}

export const endCurrentPlay = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.play.endplay', data: args })
}

export const resetDatabase = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.game.reset', data: args })
}

export const resolvePrePick = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.prepick.resolve', data: args })
}

export const updateParticipantForStack = args => {
  connect()
  gameSubscriptionChannel.publish({
    event: 'host.play.stack.update',
    data: args,
  })
}

export const resetRecording = args => {
  connect()
  gameSubscriptionChannel.publish({ event: 'host.recording.reset', data: args })
}

export const restartAutomation = args => {
  connect()
  gameSubscriptionChannel.publish({
    event: 'host.automation.restart',
    data: args,
  })
}

export const automationPaused = args => {
  connect()
  gameSubscriptionChannel.publish({
    event: 'host.automation.paused',
    data: args,
  })
}

export const automationResumed = args => {
  connect()
  gameSubscriptionChannel.publish({
    event: 'host.automation.resumed',
    data: args,
  })
}

export const movePlay = args => {
  connect()
  gameSubscriptionChannel.publish({
    event: 'host.play.move',
    data: args,
  })
}

// export const importPlaystack = args => {
//   connect()
//   gameSubscriptionChannel.publish({
//     event: 'host.import.playstack',
//     data: args
//   })
// }

export const importPlaystack = args => {
  return send('host.import.playstack', args)
}

export const readGameEvents = args => {
  return send('host.read.gameevents', args)
}

export const getGamePlaysByGameId = args => {
  return send('host.read.game.by.id', args)
}

export const insertRecordedAutomation = args => {
  send('host.insert.recorded.automation', args)
}

export const syncRequest = args => {
  connect()
  syncGuid = args.syncGuid
  gameSubscriptionChannel.publish({ event: 'host.sync.request', data: args })
}

// export const saveRecordedPlays = args => {
//   send('host.save.recorded.plays', args)
// }

export const getGames_DELETE = sportType => {
  const params = {
    query: `
      query {
        readGames(sportType: "${sportType}")
        {
          gameId
          stage
          sportType
          subSportGenre
          timeStart
          dateStart
          dateAnnounce
          datePrePicks
          countryCode
          stateCode
          stateName
          city
          latlong
          stadium
          participants {
            gameId
            sequence
            initial
            score
            name
            topColor
            bottomColor
          }
        }
      }
    `,
  }

  return axios.post(`${API_URL}/games`, params, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const readImportFilterArgs = args => {
  return axios({
    method: 'GET',
    url: `${API_URL}/game/read_import_filter_args`,
    params: args,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const subscribeToGame = (args, gameEvents) => {
  connect()

  const gameChannelName = `${args.event}.host`

  if (gameEvents && gameEvents.length > 0) {
    gameEvents.forEach(gEvent => {
      if (args.event !== gEvent) {
        const existingSubscription = socket.subscriptions(true)
        const gameToUnsubs = `${gEvent}.host`
        if (existingSubscription.indexOf(gameToUnsubs) >= 0) {
          socket.unsubscribe(gameToUnsubs)
        }
      }
    })
  }

  /*
  const socketSubscriptions = socket.subscriptions(true)
  if (socketSubscriptions.indexOf(gameChannelName) >= 0) {
    socket.unsubscribe(gameChannelName)
  }

  gameSubscriptionChannel = socket.subscribe(gameChannelName)
*/

  const socketSubscriptions = socket.subscriptions(true)

  if (socketSubscriptions.indexOf(gameChannelName) >= 0) {
    gameSubscriptionChannel = socket.channel(gameChannelName)
  } else {
    gameSubscriptionChannel = socket.subscribe(gameChannelName)
  }

  if (gameSubscriptionChannel.watchers().length <= 0) {
    gameSubscriptionChannel.watch(data => {
      switch (data.event) {
        case 'host.info.respond':
          GameStore.setInfo(data.data)
          break
        case 'host.play.current':
          GameStore.setPlayCurrent(data.data)
          break
        case 'host.play.next':
          GameStore.setPlayNext(data.data)
          break
        case 'host.play.stack':
          console.log('HOST.PLAY.STACK')
          GameStore.setPlayStack(data.data)
          break
        case 'host.play.unresolved':
          GameStore.setPlayUnresolved(data.data)
          break
        case 'host.play.resolved':
          GameStore.setPlayResolved(data.data)
          break
        case 'host.game.update':
          if (data.hasReset) {
            GameStore.setHasReset(data.hasReset)
          }
          GameStore.setInfo(data.data)
          break
        case 'host.game.resume.respond':
          GameStore.gameResumeRespond(data.data)
          break
        case 'host.play.update.respond':
          GameStore.setUpdatedPlay(data.data)
          break
        case 'host.automation.set.sequences':
          GameStore.setSequences(data.data)
          break
        case 'host.sync.response':
          if (data.data.syncGuid && data.data.syncGuid != syncGuid) {
            syncGuid = ''
            GameStore.syncResponse(data.data)
          } else if ('INPUT_CHANGE,DD_CHANGE'.includes(data.data.processName)) {
            syncGuid = ''
            GameStore.syncResponse(data.data)
          }
          break
        case 'host.game.pause.respond':
          GameStore.gamePauseRespond(data.data)
          break
        case 'host.game.end.respond':
          GameStore.setRecordEnded(true)
          GameStore.setSessionMode(0)
          break
      }
    })
  }
}
