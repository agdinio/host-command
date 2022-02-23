import { observable, action, computed } from 'mobx'
import agent from '@/Agent'
import PrePlayStore from '@/stores/PrePlayStore'
import deepEqual from 'deep-equal'
import NavigationStore from '@/stores/NavigationStore'
import NextPanel from '../Components/CommandHost/NextPanel'
import GameStore from '@/stores/GameStore'

class PlayStore {
  @observable
  types = ['liveplay1x', 'gamemaster', 'sponsorplay', 'prizeplay', 'announce']
  @observable
  anyTypes = 'liveplay1x, gamemaster, sponsorplay, prizeplay, announce'
  @observable
  nonLivePlayTypes = 'gamemaster, sponsorplay, prizeplay, announce'
  @observable
  resolvedTypes = 'liveplay1x, gamemaster, sponsorplay, prizeplay'

  @observable
  game = null
  @action
  setGameX0(val) {
    this.game = val
  }

  setGame(val) {
    if (val) {
      if (val.plays) {
        this.game = val
      } else {
        agent.GameServer.gamesInfo([val.id]).then(response => {
          this.game = response[0]
          this.convertFromGameServer()
        })
      }
    }
  }

  @action
  updateGameX1(val) {
    for (var named in val) {
      this.game[named] = val[named]
    }
  }

  updateGameX2() {
    if (this.game.id) {
      agent.GameServer.gamesInfo([this.game.id]).then(response => {
        this.game = response[0]
        this.convertFromGameServer()
      })
    }
  }

  @observable
  isAssemblyItemGo = false
  @action
  setIsAssemblyItemGo(val) {
    this.isAssemblyItemGo = val
  }

  @observable
  showDatabaseResetLoader = false
  @action
  setShowDatabaseResetLoader(val) {
    this.showDatabaseResetLoader = val
  }

  playUpdate(val) {
    if (
      PrePlayStore.currentPlayItem &&
      PrePlayStore.currentPlayItem.id == val.id &&
      val.resultConfirmed
    ) {
      const idx = this.game.plays.findIndex(o => o.id === val.id)
      if (idx > -1) {
        this.game.plays[idx] = val
        //REDUNDANT this.convertFromGameServer()
      }
      return
    }

    if (!this.game.plays) {
      agent.GameServer.gamesInfo([this.game.id])
        .then(response => {
          this.game = response[0]
          if (val.resultConfirmed) {
            this.convertFromGameServer()
          }
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      try {
        const idx = this.game.plays.findIndex(o => o.id === val.id)
        if (idx > -1) {
          this.game.plays[idx] = val
        }
      } catch (err) {}

      if (val.resultConfirmed) {
        this.convertFromGameServer()
      }
    }
  }

  @action
  updatePlayStack(val) {
    for (var named in val) {
      this.game[named] = val[named]
    }

    this.convertFromGameServer()
  }

  @observable
  baseOptions
  @action
  setBaseOptions(val) {
    this.baseOptions = val
  }

  @observable
  baseDefaults
  @action
  setBaseDefaults(val) {
    this.baseDefaults = val
  }

  @observable
  predetermined
  @action
  setPredetermined(val) {
    this.predetermined = val
  }

  @observable
  timePeriods

  @observable
  interruptPlays

  @observable
  isError = false

  @computed
  get sessionIsStarted() {
    return this.game.progress === 3 ? true : false
  }

  prevProps = {
    stack: [],
    next: null,
    current: null,
    unresolved: [],
    resolved: [],
  }

  authenticate(args) {
    agent.GameServer.authenticate(args).then(data => {
      console.log(data)
    })
  }

  reloadPage(callback) {
    document.location.reload(true)
    if (callback) {
      callback({ success: true })
    }
  }

  resetDatabase(callback) {
    let gameType = null
    agent.GameServer.resetDatabase()
      .then(resp => {
        console.log(resp)
        PrePlayStore.setPrePlayItems([])
        PrePlayStore.setNextPlayItem(null)
        PrePlayStore.setCurrentPlayItem(null)
        return agent.GameServer.gamesCreate({
          entityType: 'Game',
          value: { progress: 0 },
        })
      })
      .then(response => {
        if (response) {
          return agent.GameServer.gamesInfo([response.id])
        }
      })
      .then(response => {
        if (response && response.length > 0) {
          gameType = response[0].type.toLowerCase()
          this.game = response[0]
          this.fillValues()
          return agent.GameServer.manageGame(response[0])
        }
      })
      .then(response => {
        this.game.hostGameChannel = response
        return agent.GameServer.gamesRead({
          entityType: 'GameType',
          id: gameType,
        })
      })
      .then(response => {
        this.baseOptions = response.baseoptions
        this.predetermined = response.predetermined
        this.baseDefaults = response.defaults
        this.timePeriods = response.timePeriodDefaults
        this.interruptPlays = response.interruptPlays

        this.extractTeams()
        this.assignIdOnPredetermined()
        this.extractPreDetermined()
        this.extractBaseOptions()
        this.addNonLivePlayOptions()
        this.extractTimePeriods()
        this.extractInterruptPlays()

        setTimeout(() => {
          this.convertFromGameServer()
          if (callback) {
            callback({ success: true })
          }
        }, 0)
      })
      .catch(err => {
        console.log('HostCommand Error => ', err)
        if (callback) {
          callback({ success: false })
        }
      })
  }

  resetDatabaseX1(callback) {
    agent.GameServer.resetDatabase()
      .then(resp => {
        console.log(resp)
        PrePlayStore.setPrePlayItems([])
        PrePlayStore.setNextPlayItem(null)
        PrePlayStore.setCurrentPlayItem(null)
        this.gamesCreate({ entityType: 'Game', value: { progress: 0 } })
        if (callback) {
          callback(true)
        }
      })
      .catch(err => {
        console.log('HostCommand Error => ', err)
      })
  }

  //STARTING TO SUBSCRIBE
  gamesInfo(args) {
    PrePlayStore.setIsLoading(true)
    agent.GameServer.gamesInfo(args).then(response => {
      if (response && response.length > 0) {
        console.log(
          'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          response[0]
        )
        this.game = response[0]
        this.fillValues()
        this.gamesInfoExtended(response[0])

        PrePlayStore.sessionButtons['start'].locked = this.sessionIsStarted
          ? true
          : false
      } else {
        this.gamesCreate({ entityType: 'Game', value: { progress: 0 } })
      }
    })
  }

  gamesInfoExtendedXXX(args) {
    agent.GameServer.gamesRead({
      entityType: 'GameType',
      id: args.type.toLowerCase(),
    })
      .then(response => {
        this.baseOptions = response.baseoptions
        this.predetermined = response.predetermined
        this.baseDefaults = response.defaults

        this.assignIdOnPredetermined()
        this.extractPreDetermined()
        this.extractBaseOptions()
        this.addNonLivePlayOptions()

        return agent.GameServer.manageGame(args)
      })
      .then(response => {
        this.game.hostGameChannel = response
      })
      .catch(err => {
        console.log('Error on getting games: ', err)
      })
  }

  fillValues() {
    const tempPlays = JSON.parse(JSON.stringify(this.game.plays))

    this.game.plays.forEach((data, idx) => {
      if (data.values.$ref) {
        let playIndex = data.values.$ref
          .replace('$', '')
          .replace(/]/g, '],')
          .slice(0, -1)
          .split(',')[3]
          .slice(1)
          .slice(0, -1)
        //        console.log(idx, playIndex, tempPlays[playIndex].values)

        data.values = tempPlays[playIndex].values
      }
    })
  }

  gamesInfoExtended(args) {
    agent.GameServer.manageGame(args)
      .then(response => {
        this.game.hostGameChannel = response
        return agent.GameServer.gamesRead({
          entityType: 'GameType',
          id: args.type.toLowerCase(),
        })
      })
      .then(response => {
        this.baseOptions = response.baseoptions
        this.predetermined = response.predetermined
        this.baseDefaults = response.defaults
        this.timePeriods = response.timePeriodDefaults
        this.interruptPlays = response.interruptPlays

        this.extractTeams()
        this.assignIdOnPredetermined()
        this.extractPreDetermined()
        this.extractBaseOptions()
        this.addNonLivePlayOptions()
        this.extractTimePeriods()
        this.extractInterruptPlays()
        setTimeout(() => {
          this.convertFromGameServer()
        }, 0)
      })
      .catch(err => {
        console.log('Error on getting games: ', err)
      })
  }

  gamesCreateAfterReset(args) {
    return agent.GameServer.gamesCreate(args)
  }

  gamesCreate(args) {
    agent.GameServer.gamesCreate(args)
      .then(response => {
        if (response) {
          this.gamesInfo([response.id])
        }
      })
      .catch(err => {})
  }

  distinct(value, index, self) {
    return self.indexOf(value) === index
  }

  convertFromGameServer() {
    this.regroupPlays().then(listedPlays => {
      PrePlayStore.setGroupPlays(listedPlays)
      this.convertPlays()
    })
  }

  updatePlaysWithoutPredetermined(callback) {
    const playsToUpdate = this.game.plays.filter(
      o => this.anyTypes.match(new RegExp(o.type, 'gi')) && !o.predeterminedName
    )
    if (playsToUpdate) {
      playsToUpdate.forEach(play => {
        play.predeterminedName = 'kick off'
        agent.GameServer.gamesUpdate({ entityType: 'Play', value: play })
      })

      if (callback) {
        callback(true)
      }
    }
  }

  convertPlays() {
    try {
      PrePlayStore.setNextPlayItem(null)
      PrePlayStore.setCurrentPlayItem(null)
      //PrePlayStore.setUnresolvedItems([])
      //PrePlayStore.setResolvedItems([])
      const majorPlays = this.game.plays.filter(o =>
        this.anyTypes.match(new RegExp(o.type, 'gi'))
      )
      //let _plays = []
      if (majorPlays && majorPlays.length > 0) {
        let gamePlays = majorPlays.filter(
          o =>
            this.anyTypes.match(new RegExp(o.type, 'gi')) &&
            !o.playInProcess &&
            !o.resultConfirmed
        )
        if (gamePlays) {
          if (this.game.progress === 3) {
            this.gamesStartGameWatch()
          } else if (this.game.progress === 4) {
            this.gamesEndGameWatch()
          }

          //REMOVE DUPLICATES
          // gamePlays = gamePlays.filter((play, index, self) => {
          //   index === self.findIndex((t) => (t.id === play.id))
          // })
          //gamePlays.sort((a, b) => b.started - a.started)

          // gamePlays.forEach(play => {
          //   const item =
          //     play.type.trim().toLowerCase() === 'announce'
          //       ? this.formatAnnouncePlay(play)
          //       : this.formatPlay(play)
          //
          //   if (!_plays.filter(o => o.id === play.id)[0]) {
          //     _plays.unshift(item)
          //   }
          // })

          /**
           * stack, next play
           */
          let _plays = []
          this.assignNextPlay(gamePlays, response => {
            if (response && response.success) {
              for (let n = 0; n < gamePlays.length; n++) {
                const newPlay = gamePlays[n]
                if (!_plays.filter(o => o.id === newPlay.id)[0]) {
                  _plays.unshift(
                    newPlay.type.trim().toLowerCase() === 'announce'
                      ? this.formatAnnouncePlay(newPlay)
                      : this.formatPlay(newPlay)
                  )
                }
              }

              PrePlayStore.setPrePlayItems(_plays)

              if (response.nextPlay) {
                PrePlayStore.setNextPlayItem(
                  response.nextPlay.type.trim().toLowerCase() === 'announce'
                    ? this.formatAnnouncePlay(response.nextPlay)
                    : this.formatPlay(response.nextPlay)
                )
              }
            }
          })
        }

        /**
         * current play
         */
        if (!PrePlayStore.currentPlayItem) {
          let _currentPlayItems = majorPlays.filter(
            o =>
              this.anyTypes.match(new RegExp(o.type, 'gi')) &&
              o.playInProcess &&
              !o.resultConfirmed
          )
          if (_currentPlayItems && _currentPlayItems.length > 0) {
            let _currentPlayItem = this.getMaxItem(_currentPlayItems)
            if (_currentPlayItem) {
              if ('announce' === _currentPlayItem.type.toLowerCase()) {
                if (!this.announcePlayHasShown(_currentPlayItem, majorPlays)) {
                  PrePlayStore.setCurrentPlayItem(
                    this.formatAnnouncePlay(_currentPlayItem)
                  )
                }
              } else {
                _currentPlayItems = _currentPlayItems.filter(
                  o =>
                    this.anyTypes.match(new RegExp(o.type, 'gi')) &&
                    o.playInProcess &&
                    !o.lockedOut &&
                    !o.resultConfirmed
                )
                if (_currentPlayItems && _currentPlayItems.length > 0) {
                  _currentPlayItem = this.getMaxItem(_currentPlayItems)
                  if (_currentPlayItem) {
                    const announces = majorPlays.filter(
                      o => o.type.toLowerCase() === 'announce'
                    )
                    if (announces && announces.length > 0) {
                      const latestAnnounce = this.getMaxItem(announces)
                      if (latestAnnounce) {
                        if (_currentPlayItem.started > latestAnnounce.started) {
                          PrePlayStore.setCurrentPlayItem(
                            this.formatPlay(_currentPlayItem)
                          )
                        }
                      } else {
                        PrePlayStore.setCurrentPlayItem(
                          this.formatPlay(_currentPlayItem)
                        )
                      }
                    } else {
                      PrePlayStore.setCurrentPlayItem(
                        this.formatPlay(_currentPlayItem)
                      )
                    }
                  }
                }
              }
            }
          }
        }

        /*
        if (!PrePlayStore.currentPlayItem) {
          const _currentPlayItems = this.game.plays.filter(
            o =>
              this.anyTypes.match(new RegExp(o.type, 'gi')) &&
              o.playInProcess &&
              !o.lockedOut &&
              !o.resultConfirmed
          )
          if (_currentPlayItems && _currentPlayItems.length > 0) {
            const _currentPlayItem = this.getMaxItem(_currentPlayItems)
            if (_currentPlayItem) {
              //if (this.currentPlayIsValid(_currentPlayItem)) {
              PrePlayStore.setCurrentPlayItem(
                _currentPlayItem.type.trim().toLowerCase() === 'announce'
                  ? this.formatAnnouncePlay(_currentPlayItem)
                  : this.formatPlay(_currentPlayItem)
              )
              PrePlayStore.sessionButtons['start'] = {
                locked: true,
                backgroundColor: '#000000',
                color: '#c61818',
                text: 'in session',
              }
              //}
            } else {
              //TODO
            }
          } else {
            //CALL START PLAY
            // if (PrePlayStore.nextPlayItem) {
            //   this.gamesStartPlay(PrePlayStore.nextPlayItem.id)
            //   PrePlayStore.sessionButtons['start'] = {
            //     locked: true,
            //     backgroundColor: '#000000',
            //     color: '#c61818',
            //     text: 'in session',
            //   }
            // }
          }
        }
*/

        /*
                  if (this.game.progress === 3) {
                    if (!PrePlayStore.currentPlayItem) {
                      const _currentPlayItem = this.game.plays.filter(o => this.anyTypes.match(new RegExp(o.type, 'gi')) && o.playInProcess && !o.resultConfirmed)[0]
                      if (_currentPlayItem) {
                        PrePlayStore.setCurrentPlayItem(_currentPlayItem.type.trim().toLowerCase() === 'announce' ? this.formatAnnouncePlay(_currentPlayItem) : this.formatPlay(_currentPlayItem))
                        PrePlayStore.sessionButtons['start'] = {
                          locked: true,
                          backgroundColor: '#000000',
                          color: '#c61818',
                          text: 'in session',
                        }
                      } else {
                        //CALL START PLAY
                        if (PrePlayStore.nextPlayItem) {
                          this.gamesStartPlay(PrePlayStore.nextPlayItem.id)
                          PrePlayStore.sessionButtons['start'] = {
                            locked: true,
                            backgroundColor: '#000000',
                            color: '#c61818',
                            text: 'in session',
                          }
                        }
                      }
                    }
                  } else {

                    debugger
                    if (!PrePlayStore.currentPlayItem) {

                      const _currentPlayItems = this.game.plays.filter(o => this.anyTypes.match(new RegExp(o.type, 'gi')) && o.playInProcess && !o.resultConfirmed)
                      if (_currentPlayItems && _currentPlayItems.length > 0) {
                        const _currentPlayItem = this.getMaxItem(_currentPlayItems)
                        if (_currentPlayItem) {
                          PrePlayStore.setCurrentPlayItem(_currentPlayItem.type.trim().toLowerCase() === 'announce' ? this.formatAnnouncePlay(_currentPlayItem) : this.formatPlay(_currentPlayItem))
                          PrePlayStore.sessionButtons['start'] = {
                            locked: true,
                            backgroundColor: '#000000',
                            color: '#c61818',
                            text: 'in session',
                          }
                        }
                      }

                      // const _currentPlayItem = this.game.plays.filter(o => this.anyTypes.match(new RegExp(o.type, 'gi')) && o.playInProcess && !o.resultConfirmed)[0]
                      // if (_currentPlayItem) {
                      //   PrePlayStore.setCurrentPlayItem(_currentPlayItem.type.trim().toLowerCase() === 'announce' ? this.formatAnnouncePlay(_currentPlayItem) : this.formatPlay(_currentPlayItem))
                      //   PrePlayStore.sessionButtons['start'] = {
                      //     locked: true,
                      //     backgroundColor: '#000000',
                      //     color: '#c61818',
                      //     text: 'in session',
                      //   }
                      //}
                      else {
                        //CALL START PLAY
                        // if (PrePlayStore.nextPlayItem) {
                        //   this.gamesStartPlay(PrePlayStore.nextPlayItem.id)
                        //   PrePlayStore.sessionButtons['start'] = {
                        //     locked: true,
                        //     backgroundColor: '#000000',
                        //     color: '#c61818',
                        //     text: 'in session',
                        //   }
                        // }
                      }
                    }

                  }
        */

        /**
         * unresolved plays
         */
        let _unresolvedPlays = majorPlays.filter(
          o =>
            this.resolvedTypes.match(new RegExp(o.type, 'gi')) &&
            o.playInProcess &&
            !o.resultConfirmed
        )
        if (_unresolvedPlays && _unresolvedPlays.length > 0) {
          if (PrePlayStore.currentPlayItem) {
            _unresolvedPlays = _unresolvedPlays.filter(
              o => o.id !== PrePlayStore.currentPlayItem.id
            )
          }

          const oldUnresolvedPlays = this.getOldPlay(
            this.prevProps['unresolved'],
            _unresolvedPlays
          )
          if (oldUnresolvedPlays && oldUnresolvedPlays.length > 0) {
            console.log('MINUS FROM UNRESOLVED')
            for (let m = 0; m < oldUnresolvedPlays.length; m++) {
              const oldPlay = oldUnresolvedPlays[m]
              const idx = this.prevProps['unresolved'].findIndex(
                o => o.id === oldPlay.id
              )
              if (idx > -1) {
                this.prevProps['unresolved'].splice(idx, 1)
              }
            }
            this.prevProps['unresolved'].sort((a, b) => b.started - a.started)
            PrePlayStore.setUnresolvedItems(this.prevProps['unresolved'])
          }

          const newUnresolvedPlays = this.getNewPlay(
            this.prevProps['unresolved'],
            _unresolvedPlays
          )
          if (newUnresolvedPlays && newUnresolvedPlays.length > 0) {
            console.log('ADDED FROM UNRESOLVED')
            for (let y = 0; y < newUnresolvedPlays.length; y++) {
              const newPlay = newUnresolvedPlays[y]
              this.prevProps['unresolved'].unshift(this.formatPlay(newPlay))
            }
            this.prevProps['unresolved'].sort((a, b) => b.started - a.started)
            PrePlayStore.setUnresolvedItems(this.prevProps['unresolved'])
          }

          /*
          let _unresolvedItems = []
          if (deepEqual(this.prevProps['unresolved'], _unresolvedPlays)) {
            console.log('NO CHANGES FROM UNRESOLVED')
          } else {
            console.log('CHANGES FROM UNRESOLVED')
            this.prevProps['unresolved'] = _unresolvedPlays
            _unresolvedPlays.forEach(play => {
              _unresolvedItems.unshift(this.formatPlay(play))
            })
            PrePlayStore.setUnresolvedItems(_unresolvedItems.sort((a, b) => b.started - a.started))
          }
          */
        } else {
          this.prevProps['unresolved'] = []
          PrePlayStore.setUnresolvedItems([])
        }

        /**
         * resolved plays
         */
        const _resolvedPlays = majorPlays.filter(
          o =>
            this.resolvedTypes.match(new RegExp(o.type, 'gi')) &&
            o.resultConfirmed
        )
        if (_resolvedPlays && _resolvedPlays.length > 0) {
          const newResolvedPlays = this.getNewPlay(
            this.prevProps['resolved'],
            _resolvedPlays
          )
          if (newResolvedPlays && newResolvedPlays.length > 0) {
            console.log('CHANGES FROM RESOLVED')
            for (let x = 0; x < newResolvedPlays.length; x++) {
              const newPlay = newResolvedPlays[x]
              this.prevProps['resolved'].unshift(this.formatPlay(newPlay))
            }
            PrePlayStore.setResolvedItems(this.prevProps['resolved'])
          }

          /*
          let _resolvedItems = []
          if (deepEqual(this.prevProps['resolved'], _resolvedPlays)) {
            console.log('NO CHANGES FROM RESOLVED')
          } else {
            console.log('CHANGES FROM RESOLVED')
            this.prevProps['resolved'] = _resolvedPlays
            _resolvedPlays.forEach(play => {
              _resolvedItems.unshift(this.formatPlay(play))
            })
            PrePlayStore.setResolvedItems(_resolvedItems)
          }
          */
        }
      }

      /**
       * add the play then go
       */
      /*
      if (this.isAssemblyItemGo) {
        const goPlays = this.game.plays.filter(
          o =>
            this.anyTypes.match(new RegExp(o.type, 'gi')) &&
            !o.playInProcess &&
            !o.resultConfirmed
        )
        if (goPlays && goPlays.length > 0) {
          const goPlay = goPlays[goPlays.length - 1]
          if (goPlay) {
            this.gamesGoPlay(goPlay)
          }
          this.setIsAssemblyItemGo(false)
        }
      }
*/
    } catch (err) {
      console.log('HOSTCOMMAND ERROR => ', err)
      this.isError = true
    } finally {
      PrePlayStore.setIsLoading(false)
      PrePlayStore.setIsAddingStack(false)
    }
  }

  getOldPlay(currArr, newArr) {
    let finalArr = []
    for (let i = 0; i < currArr.length; i++) {
      const item = currArr[i]
      const found = newArr.filter(o => o.id === item.id)[0]
      if (!found) {
        finalArr.push(item)
      }
    }

    return finalArr
  }

  getNewPlay(currArr, newArr) {
    let finalArr = []
    for (let i = 0; i < newArr.length; i++) {
      const item = newArr[i]
      const found = currArr.filter(o => o.id === item.id)[0]
      if (!found) {
        finalArr.push(item)
      }
    }

    return finalArr
  }

  announcePlayHasShown(currentPlay, majorPlays) {
    let _confirmedItems = majorPlays.filter(o =>
      this.anyTypes.match(new RegExp(o.type, 'gi'))
    )
    const latestPlay = this.getMaxItem(_confirmedItems)
    if (
      latestPlay.type.toLowerCase() === currentPlay.type.toLowerCase() &&
      latestPlay.started === currentPlay.started
    ) {
      return false
    } else {
      return true
    }
  }

  getMaxItem(arr) {
    var max = arr.reduce((prev, curr) => {
      return prev.started > curr.started ? prev : curr
    })

    return max
  }

  formatAnnouncePlay(play) {
    const announces = []
    announces.push({ area: 'header', value: play.header || '' })
    announces.push({ area: 'middle', value: play.middle || '' })
    announces.push({ area: 'bottom', value: play.bottom || '' })

    return {
      id: play.id,
      index: play.id,
      announcements: announces,
      choices: [],
      playTitle: '',
      sponsor: play.sponsorBranding,
      sponsorExpanded: false,
      stars: 0,
      type: play.type,
      sessionStarted: this.game.progress === 3,
    }
  }

  formatPlay(play) {
    const multiChoices = this.multipliersFromStackByPlayId(play)
    const choiceTitle =
      multiChoices && multiChoices.length > 0 ? multiChoices[0].question : null
    const preset = this.getBasePreset(play)
    const selectedTeam =
      play.participant > -1 ? PrePlayStore.teams[play.participant] : null

    let playType = ''
    if (play.type.match(/liveplay/gi)) {
      playType = 'LivePlay'
    } else if (play.type.match(/sponsor/gi)) {
      playType = 'Sponsor'
    } else if (play.type.match(/prize/gi)) {
      playType = 'Prize'
    } else if (play.type.match(/gamemaster/gi)) {
      playType = 'GameMaster'
    } else {
      playType = play.type
    }

    const starMax = this.getStarMaxByPlay(play)

    let item = {
      id: play.id,
      award: '',
      choices: preset.choices || [],
      index: play.id,
      length: 0,
      lockedOut: play.lockedOut,
      lockedReuse: false,
      multiplierChoices: multiChoices || [],
      nextPlayType: null,
      playTitle: {
        id: preset.id,
        value: choiceTitle || preset.question || play.questionStatement,
      },
      preset: preset,
      showNextPlayAd: false,
      sponsor: play.sponsorBranding || null,
      stars: play.awardValues.stars || 0,
      starMax: starMax,
      points: play.awardValues.points || 0,
      tokens: play.awardValues.tokens || 0,
      team: selectedTeam,
      isPresetTeamChoice:
        play.predeterminedName && play.predeterminedName.match(/teams/gi),
      type: playType,
      playInProcess: play.playInProcess,
      resultConfirmed: play.resultConfirmed,
      result: play.result,
      started: play.started,
      multiplierItems: [],
      sessionStarted: this.game.progress === 3,
    }

    return item
  }

  extractResolvedItems(plays) {
    const resolvedItems = plays.filter(o => o.resultConfirmed)
    if (resolvedItems) {
      PrePlayStore.resolvedItems = resolvedItems
    }
  }

  assignNextPlay(plays, callback) {
    if (!PrePlayStore.nextPlayItem) {
      const itemToMoveToNextPlay = plays[0]
      if (itemToMoveToNextPlay) {
        const idxToRemove = plays.indexOf(itemToMoveToNextPlay)
        if (idxToRemove > -1) {
          //PrePlayStore.setNextPlayItem(itemToMoveToNextPlay)
          plays.splice(idxToRemove, 1)
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////PrePlayStore.sessionButtons['start'].locked = false
          if (callback) {
            callback({ success: true, nextPlay: itemToMoveToNextPlay })
          }
        } else {
          if (callback) {
            callback({ success: true })
          }
        }
      } else {
        if (callback) {
          callback({ success: true })
        }
      }
    } else {
      const itemToRemove = plays.filter(
        o => o.id === PrePlayStore.nextPlayItem.id
      )[0]
      if (itemToRemove) {
        const idxToRemove = plays.indexOf(itemToRemove)
        if (idxToRemove > -1) {
          plays.splice(idxToRemove, 1)
          if (callback) {
            callback({ success: true })
          }
        } else {
          if (callback) {
            callback({ success: true })
          }
        }
      } else {
        if (callback) {
          callback({ success: true })
        }
      }
    }
  }

  assignCurrentPlay(plays, callback) {
    if (!PrePlayStore.currentPlayItem) {
      const itemToMoveToCurrentPlay = plays[plays.length - 1]
      if (itemToMoveToCurrentPlay) {
        const idxToRemove = plays.indexOf(itemToMoveToCurrentPlay)
        if (idxToRemove > -1) {
          PrePlayStore.setCurrentPlayItem(itemToMoveToCurrentPlay)
          plays.splice(idxToRemove, 1)
          PrePlayStore.sessionButtons['start'] = {
            locked: GameStore.executionType === 'recording' ? false : true,
            backgroundColor: '#000000',
            color: '#c61818',
            text:
              'recording' === GameStore.executionType ? 'pause' : 'in session',
          }
          if (callback) {
            callback(true)
          }
        } else {
          if (callback) {
            callback(true)
          }
        }
      } else {
        if (callback) {
          callback(true)
        }
      }
    } else {
      const itemToRemove = plays.filter(
        o => o.id === PrePlayStore.currentPlayItem.id
      )[0]
      if (itemToRemove) {
        const idxToRemove = plays.indexOf(itemToRemove)
        if (idxToRemove > -1) {
          plays.splice(idxToRemove, 1)
          if (callback) {
            callback(true)
          }
        } else {
          if (callback) {
            callback(true)
          }
        }
      } else {
        if (callback) {
          callback(true)
        }
      }
    }
  }

  getBasePreset(play) {
    const predeterminedName = play.predeterminedName || ''
    let preset = PrePlayStore.presetItems.filter(
      o =>
        o.preset.trim().toLowerCase() === predeterminedName.trim().toLowerCase()
    )[0]
    if (!preset) {
      preset = PrePlayStore.presetItems.filter(
        o =>
          o.question.trim().toLowerCase() ===
          play.questionStatement.trim().toLowerCase()
      )[0]
    }
    return preset
  }

  getStarMaxByPlay(play) {
    let max = 1
    const item = PrePlayStore.groupPlays.filter(o => o.group === play.group)
    if (item) {
      for (let i = 0; i < item.length; i++) {
        const newMax = parseInt(item[i].type.charAt(item[i].type.length - 2))
        if (newMax > max) {
          max = newMax
        }
      }
    }

    return max
  }

  getPlayTitleX(play) {
    return new Promise(resolve => {
      const predeterminedName = play.predeterminedName || ''
      let playTitle = PrePlayStore.presetItems.filter(
        o =>
          o.preset.trim().toLowerCase() ===
            predeterminedName.trim().toLowerCase() &&
          o.type.trim().toLowerCase() === 'liveplay'
      )[0]
      if (!playTitle) {
        playTitle = PrePlayStore.presetItems.filter(
          o =>
            o.question.trim().toLowerCase() ===
              play.questionStatement.trim().toLowerCase() &&
            o.type.trim().toLowerCase() === 'liveplay'
        )[0]
      }

      resolve(playTitle)
    })
  }

  getPresetByName(presetName) {
    return PrePlayStore.preplayItems.filter(
      o => o.preset.trim().toLowerCase() === presetName.trim().toLowerCase()
    )
  }

  regroupPlays() {
    return new Promise((resolve, reject) => {
      let listedPlays = []
      const plays = {}
      this.game.plays.forEach(p => {
        plays[p.id] = p
      })
      let playGroup = 0
      let currentPlay = this.game.playStack.head
      let remaining = this.game.plays.length
      let groupedPlays = []

      while (currentPlay !== null && remaining > 0) {
        remaining--

        if (this.game.playStack.stack[currentPlay].isMajor) {
          if (groupedPlays.length > 0) {
            listedPlays = groupedPlays.concat(listedPlays)
          }
          groupedPlays = []
          playGroup++
          plays[currentPlay]['group'] = playGroup
          groupedPlays.push(plays[currentPlay])
        } else {
          plays[currentPlay]['group'] = playGroup
          groupedPlays.push(plays[currentPlay])
        }
        // console.log('groupedPlays', groupedPlays)
        currentPlay = this.game.playStack.stack[currentPlay].next
      }
      listedPlays = groupedPlays.concat(listedPlays)

      resolve(listedPlays)
    })
  }

  multipliersFromStackByPlayId2(play) {
    console.log('PLAY', play)
    const groupPlays = PrePlayStore.groupPlays.filter(
      o => o.group === play.group
    )
    for (let i = 0; i < groupPlays.length; i++) {}
  }

  multipliersFromStackByPlayId(play) {
    try {
      let predetermined = []

      let groupItem = PrePlayStore.groupPlays.filter(o => o.id === play.id)[0]
      const groupPlays = PrePlayStore.groupPlays.filter(
        o => o.group === groupItem.group
      )
      if (groupPlays && groupPlays.length > 0) {
        groupPlays.forEach(mulPlay => {
          let preset = {}
          let choices = extractMultiplierByPlay(groupPlays, mulPlay)
          if (choices && choices.length > 0) {
            if (mulPlay.type.match(/liveplay1x/gi)) {
              preset = {
                choices: choices,
                id: mulPlay.id,
                locked: false,
                preset: mulPlay.predeterminedName || 'kick off',
                question: mulPlay.questionStatement,
                type: 'LivePlay',
              }
            } else {
              if (this.nonLivePlayTypes.match(new RegExp(mulPlay.type, 'gi'))) {
                //value either gamemaster or sponsor or prize or announce
                let exp = RegExp(
                  mulPlay.predeterminedName
                    ? mulPlay.predeterminedName.replace(/(?=[() ])/g, '\\')
                    : 'a-b'.replace(/(?=[() ])/g, '\\'),
                  'gi'
                )
                let presetName = PrePlayStore.presetItems.filter(o =>
                  o.preset.match(exp)
                )[0]
                if (!presetName) {
                  presetName = mulPlay.predeterminedName.match(/teams/gi)
                    ? 'A-B (TEAMS)'
                    : 'A-B (Y/N)'
                }
                preset = {
                  choices: choices,
                  id: mulPlay.id,
                  preset: presetName.preset,
                  question: mulPlay.questionStatement,
                  readOnly: true,
                  type: 'GameMaster, Sponsor, Prize',
                }
              } else {
                //value either liveplay2x or liveplay3x
                preset = {
                  choices: choices,
                  id: mulPlay.id,
                  isMultiplier: true,
                  locked: false,
                  preset: 'multiplier',
                  question: mulPlay.questionStatement,
                  type: 'LivePlay',
                }
              }
            }
            predetermined.push(preset)
          } else {
            //NO NEXT
            let choicesNoNext = []
            if (mulPlay.values && mulPlay.values.length > 0) {
              mulPlay.values.forEach(choice => {
                choicesNoNext.push({ value: choice })
              })
            }

            if (mulPlay.type.match(/liveplay/gi)) {
              preset = {
                choices: choicesNoNext,
                id: mulPlay.id,
                isMultiplier: true,
                locked: false,
                preset: 'multiplier',
                question: mulPlay.questionStatement,
                type: 'LivePlay',
              }
            } else {
              let exp = RegExp(
                mulPlay.predeterminedName
                  ? mulPlay.predeterminedName.replace(/(?=[() ])/g, '\\')
                  : 'a-b'.replace(/(?=[() ])/g, '\\'),
                'gi'
              )
              let presetName = PrePlayStore.presetItems.filter(o =>
                o.preset.match(exp)
              )[0]
              if (!presetName) {
                presetName = mulPlay.predeterminedName.match(/teams/gi)
                  ? 'A-B (TEAMS)'
                  : 'A-B (Y/N)'
              }
              preset = {
                id: mulPlay.id,
                preset: presetName.preset,
                question: mulPlay.questionStatement,
                choices: choicesNoNext,
                readOnly: true,
                type: 'GameMaster, Sponsor, Prize',
              }
            }
            predetermined.push(preset)
          }
        })
      }

      return predetermined

      function extractMultiplierByPlay(groupPlays, mulPlayBase) {
        let choices = []
        const multiplier = mulPlayBase.type.replace(/[^0-9]/g, '')
        const filteredGroupPlays = groupPlays.filter(
          o =>
            parseInt(o.type.replace(/[^0-9]/g, '')) === parseInt(multiplier) + 1
        )

        for (let i = 0; i < mulPlayBase.values.length; i++) {
          const baseValue = mulPlayBase.values[i]

          for (let j = 0; j < filteredGroupPlays.length; j++) {
            let groupPlayChoices = filteredGroupPlays[j]

            const found = groupPlayChoices.choice.filter(
              o => o.trim().toLowerCase() === baseValue.trim().toLowerCase()
            )[0]
            if (found) {
              const value = found.trim().toLowerCase()
              const nextId = filteredGroupPlays[j].id
              if (!choices.filter(o => o.value === value)[0]) {
                choices.push({ value: value, nextId: nextId })
              }
            }
          }

          const checkNoNextIdValue = choices.filter(
            o => o.value.trim().toLowerCase() === baseValue.trim().toLowerCase()
          )[0]
          if (!checkNoNextIdValue) {
            choices.push({ value: baseValue })
          }
        }

        return choices
      }
    } catch (err) {
      // console.log('HostCommand Error =>', err)
    }
  }

  multipliersFromStackByPlayIdORIG2(playId) {
    let predetermined = []

    const playToFind = PrePlayStore.groupPlays.filter(o => o.id === playId)[0]
    if (playToFind) {
      const groupPlays = PrePlayStore.groupPlays.filter(
        o => o.group === playToFind.group
      )
      if (groupPlays && groupPlays.length > 0) {
        groupPlays.forEach(mulPlay => {
          const multiplier = mulPlay.type.replace(/[^0-9]/g, '')

          let preset = {}
          let choices = extractMultiplierByPlay(groupPlays, multiplier, mulPlay)
          if (choices && choices.length > 0) {
            if (mulPlay.type.match(/liveplay1x/gi)) {
              preset = {
                choices: choices,
                id: mulPlay.id,
                locked: false,
                preset: mulPlay.predeterminedName || 'kick off',
                question: mulPlay.questionStatement,
                type: 'LivePlay',
              }
            } else {
              //value either 2x or 3x
              preset = {
                choices: choices,
                id: mulPlay.id,
                isMultiplier: true,
                locked: false,
                preset: 'multiplier',
                question: mulPlay.questionStatement,
                type: 'LivePlay',
              }
            }
            predetermined.push(preset)
          } else {
            //NO NEXT
            let choicesNoNext = []
            if (mulPlay.values && mulPlay.values.length > 0) {
              mulPlay.values.forEach(choice => {
                choicesNoNext.push({ value: choice })
              })
            }

            if (mulPlay.type.match(/liveplay/gi)) {
              preset = {
                choices: choicesNoNext,
                id: mulPlay.id,
                isMultiplier: true,
                locked: false,
                preset: 'multiplier',
                question: mulPlay.questionStatement,
                type: 'LivePlay',
              }
            } else {
              let exp = RegExp(
                mulPlay.predeterminedName
                  ? mulPlay.predeterminedName.replace(/(?=[() ])/g, '\\')
                  : 'a-b'.replace(/(?=[() ])/g, '\\'),
                'gi'
              )
              let presetName = PrePlayStore.presetItems.filter(o =>
                o.preset.match(exp)
              )[0]
              if (!presetName) {
                presetName = mulPlay.predeterminedName.match(/teams/gi)
                  ? 'A-B (TEAMS)'
                  : 'A-B (Y/N)'
              }
              preset = {
                id: mulPlay.id,
                preset: presetName.preset,
                question: mulPlay.questionStatement,
                choices: choicesNoNext,
                readOnly: true,
                type: 'GameMaster, Sponsor, Prize',
              }
            }
            predetermined.push(preset)
          }
        })
      }
    }

    return predetermined

    function extractMultiplierByPlay(groupPlays, multiplier, mulPlay) {
      let choices = []
      const mulPlaysX = groupPlays.filter(
        o =>
          parseInt(o.type.replace(/[^0-9]/g, '')) === parseInt(multiplier) + 1
      )
      if (mulPlaysX && mulPlaysX.length > 0) {
        mulPlaysX.forEach(mulPlayX => {
          for (let i = 0; i < mulPlayX.choice.length; i++) {
            //-- 0 belongs to liveplay1x
            //-- 1 belongs to liveplay2x
            if (parseInt(multiplier) - 1 === i) {
              const value = mulPlayX.choice[i]
              const nextId = mulPlayX.id
              choices.push({ value: value, nextId: nextId })
            }
          }
        })
      }
      return choices
    }
  }

  multipliersFromStackByPlayIdORIG(playId) {
    let predetermined = []
    let _mulPlays = []

    for (let s2 in this.game.playStack.stack) {
      if (
        this.game.playStack.stack[s2].prevMajor === playId ||
        this.game.playStack.stack[s2].id === playId
      ) {
        const idToFind = this.game.playStack.stack[s2].id
        const prev = this.game.playStack.stack[s2].prev
        const next = this.game.playStack.stack[s2].next
        //let playToFind = this.game.plays.filter(o => o.id === idToFind && o.type.match('LivePlay'))[0]
        let playToFind = this.game.plays.filter(
          o => o.id === idToFind && o.type.match(/LivePlay/gi)
        )[0]
        if (playToFind) {
          playToFind.prev = prev
          playToFind.next = next
          _mulPlays.push(playToFind)
        }
      }
    }

    _mulPlays.forEach(mulPlay => {
      const multiplier = mulPlay.type.replace(/[^0-9]/g, '')

      let preset = {}
      let choices = extractMultiplierByPlay(_mulPlays, multiplier)
      if (choices && choices.length > 0) {
        preset = {
          choices: choices,
          id: mulPlay.id,
          locked: false,
          preset: mulPlay.predeterminedName || 'kick off',
          question: mulPlay.questionStatement,
          type: 'LivePlay',
        }
        // console.log('CHCOICES',preset)
        predetermined.push(preset)
      } else {
        let choicesNoNext = []
        if (mulPlay.values && mulPlay.values.length > 0) {
          mulPlay.values.forEach(choice => {
            choicesNoNext.push({ value: choice })
          })
        }

        preset = {
          choices: choicesNoNext,
          id: mulPlay.id,
          isMultiplier: true,
          locked: false,
          preset: 'multiplier',
          question: mulPlay.questionStatement,
          type: 'LivePlay',
        }

        // console.log('NO NEXT',preset)
        predetermined.push(preset)
      }
    })

    return predetermined

    function extractMultiplierByPlay(_mulPlays, multiplier) {
      let choices = []
      const mulPlaysX = _mulPlays.filter(
        o =>
          parseInt(o.type.replace(/[^0-9]/g, '')) === parseInt(multiplier) + 1
      )
      if (mulPlaysX && mulPlaysX.length > 0) {
        mulPlaysX.forEach(mulPlayX => {
          for (let i = 0; i < mulPlayX.choice.length; i++) {
            //-- 0 belongs to liveplay1x
            //-- 1 belongs to liveplay2x
            if (parseInt(multiplier) - 1 === i) {
              const value = mulPlayX.choice[i]
              const nextId = mulPlayX.id
              choices.push({ value: value, nextId: nextId })
            }
          }
        })
      }
      return choices
    }
  }

  convertPlaysX() {
    let predetermined = []

    //playIds = playIds.filter(this.distinct)
    let playIds = this.game.plays.filter(o => o.type === 'LivePlay1x')

    playIds.forEach(playId => {
      let _mulPlays = []

      for (let s2 in this.game.playStack.stack) {
        if (
          this.game.playStack.stack[s2].prevMajor === playId.id ||
          this.game.playStack.stack[s2].id === playId.id
        ) {
          const idToFind = this.game.playStack.stack[s2].id
          const prev = this.game.playStack.stack[s2].prev
          const next = this.game.playStack.stack[s2].next
          let playToFind = this.game.plays.filter(
            o => o.id === idToFind && o.type.match('LivePlay')
          )[0]
          if (playToFind) {
            playToFind.prev = prev
            playToFind.next = next
            _mulPlays.push(playToFind)
          }
        }
      }

      _mulPlays.forEach(mulPlay => {
        const multiplier = mulPlay.type.replace(/[^0-9]/g, '')

        let preset = {}
        let choices = extractMultiplierByPlay(_mulPlays, multiplier)
        if (choices && choices.length > 0) {
          preset = {
            id: mulPlay.id,
            preset: '',
            choices: choices,
            type: 'LivePlay',
          }
          // console.log('CHCOICES',preset)
          predetermined.push(preset)
        } else {
          let choicesNoNext = []
          if (mulPlay.values && mulPlay.values.length > 0) {
            mulPlay.values.forEach(choice => {
              choicesNoNext.push({ value: choice })
            })
          }

          preset = {
            id: mulPlay.id,
            preset: 'multiplier',
            choices: choicesNoNext,
            type: 'LivePlay',
          }

          // console.log('NO NEXT',preset)
          predetermined.push(preset)
        }
      })
    })

    function extractMultiplierByPlay(_mulPlays, multiplier) {
      let choices = []
      const mulPlaysX = _mulPlays.filter(
        o =>
          parseInt(o.type.replace(/[^0-9]/g, '')) === parseInt(multiplier) + 1
      )
      if (mulPlaysX && mulPlaysX.length > 0) {
        mulPlaysX.forEach(mulPlayX => {
          for (let i = 0; i < mulPlayX.choice.length; i++) {
            //-- 0 belongs to liveplay1x
            //-- 1 belongs to liveplay2x
            if (parseInt(multiplier) - 1 === i) {
              const value = mulPlayX.choice[i]
              const nextId = mulPlayX.id
              choices.push({ value: value, nextId: nextId })
            }
          }
        })
      }
      return choices
    }
  }

  extractTeams() {
    if (this.game.participants && this.game.participants.length > 0) {
      let teams = []
      this.game.participants.forEach((name, idx) => {
        teams.push({
          iconBottomColor: '#0e264b',
          iconTopColor: '#be0824',
          id: idx + 1,
          index: idx,
          initial: name.charAt(0),
          score: 0,
          teamName: name,
        })
      })

      PrePlayStore.setTeams(teams)
    }
  }

  assignIdOnPredetermined() {
    PrePlayStore.resetPresetItems()

    let id = 0
    for (let i = 0; i < this.predetermined.length; i++) {
      this.predetermined[i].id = ++id
    }

    for (let j = 0; j < this.baseOptions.length; j++) {
      this.baseOptions[j].id = ++id
    }

    for (let k = 0; k < this.baseDefaults.length; k++) {
      this.baseDefaults[k].id = ++id
    }
  }

  extractPreDetermined() {
    if (this.predetermined && this.predetermined.length > 0) {
      this.predetermined.forEach(item => {
        let choices = []
        if (item.values && item.values.length > 0) {
          item.values.forEach(value => {
            let valueToFind = this.baseOptions.filter(
              o => o.choice.trim().toLowerCase() === value.trim().toLowerCase()
            )[0]
            if (valueToFind) {
              choices.push({ value: value, nextId: valueToFind.id })
            } else {
              choices.push({ value: value })
            }
          })
        }

        let pre = {
          id: item.id,
          preset: item.name,
          question: item.question,
          choices: choices,
          type: 'LivePlay',
        }
        PrePlayStore.presetItems.push(pre)
      })
    }
  }

  extractBaseOptions() {
    const _baseOptions = [...this.baseOptions]
    if (_baseOptions && _baseOptions.length > 0) {
      _baseOptions.forEach(item => {
        let choices = []
        if (item.values && item.values.length > 0) {
          try {
            item.values.forEach(value => {
              let valueToFind = this.baseOptions.filter(
                o =>
                  o.choice.trim().toLowerCase() === value.trim().toLowerCase()
              )[0]
              if (valueToFind) {
                choices.push({ value: value, nextId: valueToFind.id })
              } else {
                choices.push({ value: value })
              }
            })
          } catch (err) {
            let defaultsToFind = this.baseDefaults.filter(
              o => o.name.trim().toLowerCase() === item.values
            )[0]
            if (defaultsToFind) {
              if (defaultsToFind.values && defaultsToFind.values.length > 0) {
                defaultsToFind.values.forEach(value => {
                  choices.push({ value: value })
                })
              }
            }
          }
        }

        let pre = {
          id: item.id,
          preset: 'multiplier',
          isMultiplier: true,
          question: item.question,
          choices: choices,
          type: 'LivePlay',
        }
        PrePlayStore.presetItems.push(pre)
      })
    }
  }

  addNonLivePlayOptions() {
    let id = PrePlayStore.presetItems.length
    const nonLivePlayAB = {
      id: ++id,
      preset: 'A-B (Y/N)',
      question: '',
      choices: [{ value: 'yes' }, { value: 'no' }],
      readOnly: true,
      type: 'GameMaster, Sponsor, Prize',
    }
    PrePlayStore.presetItems.push(nonLivePlayAB)

    const nonLivePlayABTeams = {
      id: ++id,
      preset: 'A-B (TEAMS)',
      question: '',
      choices: [],
      readOnly: true,
      type: 'GameMaster, Sponsor, Prize',
    }
    PrePlayStore.presetItems.push(nonLivePlayABTeams)
  }

  extractTimePeriods() {
    if (this.timePeriods && this.timePeriods.length > 0) {
      let _tp = []
      this.timePeriods.forEach(t => {
        _tp.push(t)
      })

      _tp.unshift({ name: '' })
      PrePlayStore.setTimePeriods(_tp)
    }
  }

  extractInterruptPlays() {
    if (this.interruptPlays && this.interruptPlays.length > 0) {
      let _ip = []
      this.interruptPlays.forEach(i => {
        _ip.push(i)
      })

      PrePlayStore.setInterruptPlays(_ip)
    }
  }

  unsub() {
    agent.GameServer.unsub()
  }

  /*********************************************************************************************************************
   * GAMESERVER EVENTS
   * @param playItem
   ********************************************************************************************************************/

  gamesUpdate(playItem) {
    let play = this.game.plays.filter(o => o.id === playItem.id)[0]
    if (play) {
      play.predeterminedName = playItem.preset ? playItem.preset.preset : null
      play.awardValues = { points: 0, tokens: 0, stars: playItem.stars }
      play.participant = playItem.team ? playItem.team.index : -1
      play.sponsorBranding = playItem.sponsor
      play.result = playItem.result || { comment: '', correctValue: -1 }

      return agent.GameServer.gamesUpdate({ entityType: 'Play', value: play })
    }
  }

  gamesUpdateX1(playItem) {
    const values = []
    if (playItem.choices && playItem.choices.length > 0) {
      playItem.choices.forEach(choice => {
        values.push(choice.value || '')
      })
    }

    let playType = ''
    if (playItem.type.match(/liveplay/gi)) {
      playType = 'LivePlay1x'
    } else if (playItem.type.match(/sponsor/gi)) {
      playType = 'SponsorPlay'
    } else if (playItem.type.match(/prize/gi)) {
      playType = 'PrizePlay'
    } else if (playItem.type.match(/gamemaster/gi)) {
      playType = 'GameMaster'
    } else {
      playType = playItem.type
    }

    let play = {
      id: playItem.id,
      choice: [],
      questionStatement: playItem.playTitle.value,
      timer: 5000,
      type: playType,
      values: values,
      predeterminedName: playItem.preset.preset,
      awardValues: { points: 0, tokens: 0, stars: playItem.stars },
      participant: playItem.team ? playItem.team.index : -1,
      sponsorBranding: playItem.sponsor,
      result: playItem.result || { comment: '', correctValue: -1 },
    }

    /*
    agent.GameServer.gamesUpdate({entityType: 'Play', value: play})
      .then(response => {
        console.log('PLAYSTORE - gamesUpdate', response)
      })
*/
    return agent.GameServer.gamesUpdate({ entityType: 'Play', value: play })
  }

  gamesUpdatePreset(args) {
    agent.GameServer.gamesUpdatePreset(args)
  }

  removePlayFromStack(playId) {
    agent.GameServer.removePlayFromStack(playId)
  }

  addThePlayGo(playItem) {
    let play = null
    if ('announce' === playItem.type.trim().toLowerCase()) {
      play = {
        header: playItem.announcements.filter(o => o.area === 'header')[0]
          .value,
        middle: playItem.announcements.filter(o => o.area === 'middle')[0]
          .value,
        bottom: playItem.announcements.filter(o => o.area === 'bottom')[0]
          .value,
        sponsorBranding: playItem.sponsor,
        type: 'Announce',
      }
    } else {
      const values = []
      if (playItem.choices && playItem.choices.length > 0) {
        playItem.choices.forEach(choice => {
          values.push(choice.value || '')
        })
      }

      let playType = ''
      if (playItem.type.match(/liveplay/gi)) {
        playType = 'LivePlay1x'
      } else if (playItem.type.match(/sponsor/gi)) {
        playType = 'SponsorPlay'
      } else if (playItem.type.match(/prize/gi)) {
        playType = 'PrizePlay'
      } else if (playItem.type.match(/gamemaster/gi)) {
        playType = 'GameMaster'
      } else {
        playType = playItem.type
      }

      play = {
        choice: [],
        questionStatement: playItem.playTitle.value,
        timer: 5000,
        type: playType,
        values: values,
        predeterminedName: playItem.preset.preset,
        awardValues: {
          points: playItem.points,
          tokens: playItem.tokens,
          stars: playItem.stars,
        },
        participant: playItem.team ? playItem.team.index : -1,
        sponsorBranding: playItem.sponsor,
      }
    }

    agent.GameServer.gamesGoPlay(play)
  }

  addThePlay(playItem) {
    let play = null
    if ('announce' === playItem.type.trim().toLowerCase()) {
      play = {
        header: playItem.announcements.filter(o => o.area === 'header')[0]
          .value,
        middle: playItem.announcements.filter(o => o.area === 'middle')[0]
          .value,
        bottom: playItem.announcements.filter(o => o.area === 'bottom')[0]
          .value,
        sponsorBranding: playItem.sponsor,
        type: 'Announce',
      }
    } else {
      const values = []
      if (playItem.choices && playItem.choices.length > 0) {
        playItem.choices.forEach(choice => {
          values.push(choice.value || '')
        })
      }

      let playType = ''
      if (playItem.type.match(/liveplay/gi)) {
        playType = 'LivePlay1x'
      } else if (playItem.type.match(/sponsor/gi)) {
        playType = 'SponsorPlay'
      } else if (playItem.type.match(/prize/gi)) {
        playType = 'PrizePlay'
      } else if (playItem.type.match(/gamemaster/gi)) {
        playType = 'GameMaster'
      } else {
        playType = playItem.type
      }

      play = {
        choice: [],
        questionStatement: playItem.playTitle.value,
        timer: 5000,
        type: playType,
        values: values,
        predeterminedName: playItem.preset.preset,
        awardValues: {
          points: playItem.points,
          tokens: playItem.tokens,
          stars: playItem.stars,
        },
        participant: playItem.team ? playItem.team.index : -1,
        sponsorBranding: playItem.sponsor,
      }
    }

    agent.GameServer.addThePlay(play)
  }

  gamesStart() {
    agent.GameServer.gamesStart()
  }

  gamesStartPlay(playId) {
    agent.GameServer.gamesStartPlay(playId)
  }

  gamesGoPlay(playItem, next) {
    if (
      PrePlayStore.currentPlayItem &&
      'announce' === PrePlayStore.currentPlayItem.type.toLowerCase()
    ) {
      let args = {
        playId: PrePlayStore.currentPlayItem.id,
        result: {
          type: 'Announce',
          hasNextPlay: true,
        },
      }

      PrePlayStore.setCurrentPlayItem(null)
      this.gamesEndPlay(args)
      this.gamesGoPlay(playItem)
      setTimeout(() => {}, 0)

      if (next) {
        next(true)
      }
    } else {
      //PrePlayStore.setIsLoading(true)
      if (playItem) {
        let playToGo = this.game.plays.filter(o => o.id === playItem.id)[0]
        if (playToGo) {
          playToGo.awardValues = { points: 0, tokens: 0, stars: playItem.stars }
          playToGo.participant = playItem.team ? playItem.team.index : -1
          playToGo.predeterminedName = playItem.preset
            ? playItem.preset.preset
            : ''
          playToGo.sponsorBranding = playItem.sponsor

          agent.GameServer.gamesGoPlay(playToGo)
        } else {
          this.addThePlayGo(playItem)
          if (next) {
            next(true)
          }
        }
      }
      // if (PrePlayStore.currentPlayItem) {
      //   agent.GameServer.gamesEndPlay({playId: PrePlayStore.currentPlayItem.id, result: null})
      //   setTimeout(() => {
      //     agent.GameServer.gamesGoPlay(playToGo)
      //   }, 2000)
      // } else {
      //   agent.GameServer.gamesGoPlay(playToGo)
      // }
    }
  }

  gamesLockPlay(playId) {
    agent.GameServer.gamesLockPlay(playId)
  }

  gamesEndPlay(args) {
    agent.GameServer.gamesEndPlay(args)
  }

  gamesConfirmPlay(args) {
    agent.GameServer.gamesConfirmPlay(args)
  }

  gamesEndPlayResult(data) {
    if (!data.playId) {
      agent.GameServer.gamesStartPlay(null)
      return
    }

    agent.GameServer.gamesInfo([this.game.id])
      .then(response => {
        if (response && response[0]) {
          this.game = response[0]
          // const x = this.game.plays.filter(o => this.anyTypes.match(new RegExp(o.type, 'gi')) && !o.lockedOut)
          // if (!x || (x && x.length < 1)) {
          //   agent.GameServer.gamesStartPlay(null)
          // }
        }
      })
      .catch(err => {})
  }

  gamesStartPlayNull(data) {
    agent.GameServer.gamesInfo([this.game.id])
      .then(response => {
        if (response && response[0]) {
          this.game = response[0]
          this.convertFromGameServer()
          // if (PrePlayStore.nextPlayItem) {
          //   setTimeout(() => {
          //     this.gamesStartPlay(PrePlayStore.nextPlayItem.id)
          //   }, 3000)
          // }
        }
      })
      .catch(err => {})
  }

  gamesEndGame() {
    agent.GameServer.gamesEndGame()
  }

  gamesStartGameWatch() {
    PrePlayStore.sessionButtons['start'] = {
      backgroundColor: '#000000',
      color: '#c61818',
      text: 'recording' === GameStore.executionType ? 'pause' : 'in session',
      locked: GameStore.executionType === 'recording' ? false : true,
    }
    PrePlayStore.sessionButtons['end'].locked = false
  }

  gamesEndGameWatch() {
    PrePlayStore.sessionButtons['start'] = {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'session ended',
      locked: true,
    }
    PrePlayStore.sessionButtons['end'].locked = true
  }

  movePlayBefore(args) {
    agent.GameServer.movePlay(args)
  }

  movePlay(args) {
    agent.GameServer.movePlay(args)
  }

  playsUpdateResolvedPlay(data) {
    console.log('RESOLVING....', data)
    if (this.game.plays && this.game.plays.length > 0) {
      const idx = this.game.plays.findIndex(o => o.id === data.id)
      if (idx > -1) {
        this.game.plays[idx] = data

        this.convertFromGameServer()

        const x = this.game.plays.filter(
          o => this.anyTypes.match(new RegExp(o.type, 'gi')) && !o.lockedOut
        )
        if (!x || (x && x.length < 1)) {
          //agent.GameServer.gamesStartPlay(null)
          //agent.GameServer.endPlay(null)
        }
        // setTimeout(() => {
        //   /**
        //    * unresolved plays
        //    */
        //   this.unresolvedPlays()
        //
        //   /**
        //    * resolved plays
        //    */
        //   this.resolvedPlays()
        // }, 0)
      }
    }
  }

  showErrorPage(err) {
    console.log('HOSTCOMMAND ERROR =>', err)
    this.isError = true
    // NavigationStore.setCurrentView('/error')
  }
}

export default new PlayStore()
