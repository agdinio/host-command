import { observable, action } from 'mobx'
import agent from '@/Agent'
import GameStore from '@/stores/GameStore'
import PrePlayStore from '@/stores/PrePlayStore'
import { intercept } from 'mobx'
import crypto from 'crypto'
import axios from 'axios'

class AutomationStore {
  constructor() {
    intercept(GameStore, 'lastSequence', change => {
      if ('recording' === GameStore.executionType) {
        if (change.newValue) {
          this.sequence = change.newValue
        }
      }
      return change
    })
    intercept(GameStore, 'HCommLastHeaderSequence', change => {
      if ('recording' === GameStore.executionType) {
        if (change.newValue) {
          this.headerPlaySequence = change.newValue
        }
      }
      return change
    })
    intercept(GameStore, 'HCommLastPlaySequence', change => {
      if ('recording' === GameStore.executionType) {
        if (change.newValue) {
          this.playSequence = change.newValue
        }
      }
      return change
    })
    intercept(GameStore, 'HCommLastWait', change => {
      if ('recording' === GameStore.executionType) {
        if (change.newValue) {
          this.currentTime = change.newValue
        }
      }
      return change
    })
    intercept(GameStore, 'automationRestartedServerCallback', change => {
      this.automationRestartedServerCallback = change.newValue
      if (change.newValue) {
        this.automationPausedPos = 0
        this.automationCurrentPos = 0
        this.hasRestartedAutomation = false
        this.hasPausedAutomation = false
        this.iteratePlay()
      }
      return change
    })
  }

  currentTime = 0

  footage = null
  events = []

  sequence = 0
  @action
  incrementSequence() {
    this.sequence += 1
  }

  @observable
  headerPlaySequence = 0
  @action
  incrementHeaderPlaySequence() {
    this.headerPlaySequence += 1
  }

  @observable
  playSequence = 0
  @action
  incrementPlaySequence() {
    this.playSequence += 1
  }

  tempPlayEvents = []
  @action
  async addTempPlayEvent(args) {
    if (!GameStore.sessionMode) {
      return
    }

    if (args.refId) {
      if ('recording' === GameStore.executionType) {
        for (let i = this.tempPlayEvents.length - 1; i >= 0; i--) {
          const event = this.tempPlayEvents[i]

          if (
            args.refId.includes('playitem-question-input') &&
            event.refId.includes('playitem-question-input')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('playitem-choice-input') &&
            event.refId === args.refId
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('dropdown-star-select') &&
            event &&
            event.refId &&
            event.refId.includes('dropdown-star-select')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('dropdown-star-option') &&
            event.refId.includes('dropdown-star-option')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('dropdown-sponsor-select') &&
            event.refId.includes('dropdown-sponsor-select')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('dropdown-sponsor-option') &&
            event.refId.includes('dropdown-sponsor-option')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('dropdown-team-select') &&
            event.refId.includes('dropdown-team-select')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          if (
            args.refId.includes('dropdown-team-option') &&
            event.refId.includes('dropdown-team-option')
          ) {
            await this.tempPlayEvents.splice(i, 1)
          }

          // if (
          //   args.refId.includes('dropdown-sponsor-item') &&
          //   event.refId.includes('dropdown-sponsor-item')
          // ) {
          //   await this.tempPlayEvents.splice(i, 1)
          // }
        }

        this.tempPlayEvents.push({
          gameId: GameStore.gameId,
          playId: args.playId,
          evt: args.evt,
          refId: args.refId,
          wait: 0,
          value: args.value,
          sequence: 0,
          isPreviousPlayEnded: false,
          doNotSave: args.doNotSave,
          isIncrementHeaderPlaySequence: args.isIncrementHeaderPlaySequence,
          isIncrementSequence: true,
          timestampWait: args.wait,
        })
      }

      if ('automation' === GameStore.executionType) {
        this.incrementSequence()
      }
    }
  }

  @action
  async addTempAnnounceEvent(args) {
    if (!GameStore.sessionMode) {
      return
    }

    if (args.refId) {
      if ('recording' === GameStore.executionType) {
        if (args.refId.includes('brand-option')) {
          if (args.sponsor && args.sponsor.id && args.strToReplace) {
            args.value = undefined
            const editReadOnly = args.refId.replace(args.strToReplace, '')
            const edit = editReadOnly.replace('readonly-', '')
            for (let i = this.events.length - 1; i >= 0; i--) {
              const event = this.events[i]
              if (event.evt === 'input' && event.refId === edit) {
                await this.events.splice(i, 1)
              }
              if (event.evt === 'click' && event.refId === editReadOnly) {
                await this.events.splice(i, 1)
              }
              if (event.refId.includes('brand-option')) {
                await this.events.splice(i, 1)
              }
            }
          } else {
            if (args.strToReplace) {
              const editReadOnly = args.refId.replace(args.strToReplace, '')
              const edit = editReadOnly.replace('readonly-', '')

              for (let i = this.events.length - 1; i >= 0; i--) {
                const event = this.events[i]
                if (
                  event.refId.includes('brand-drop') ||
                  event.refId.includes('brand-option')
                ) {
                  await this.events.splice(i, 1)
                }
              }

              //STORE EDITOR VALUE IF BRAND IS NULL
              this.events.push({
                gameId: GameStore.gameId,
                playId: args.playId,
                evt: 'input',
                refId: edit,
                wait: 0,
                value: JSON.parse(JSON.stringify(args.value)),
                sequence: 0,
                isPreviousPlayEnded: false,
                isIncrementHeaderPlaySequence:
                  args.isIncrementHeaderPlaySequence,
                isIncrementSequence: true,
                isZeroWait: true,
                timestampWait: 0,
              })
              //STORE READONLY EDITOR IF BRAND IS NULL
              args.evt = 'click'
              args.refId = editReadOnly
              args.wait = 0.5
              args.value = undefined
            }
          }
        } else {
          for (let i = this.events.length - 1; i >= 0; i--) {
            const event = this.events[i]
            if (event.evt === args.evt && event.refId === args.refId) {
              await this.events.splice(i, 1)
            }
          }
        }

        this.events.push({
          gameId: GameStore.gameId,
          playId: args.playId,
          evt: args.evt,
          refId: args.refId,
          wait: 0,
          value: args.value,
          sequence: 0,
          isPreviousPlayEnded: false,
          isIncrementHeaderPlaySequence: args.isIncrementHeaderPlaySequence,
          isIncrementSequence: true,
          isZeroWait: true,
          timestampWait: 0,
        })
      }

      if ('automation' === GameStore.executionType) {
        this.incrementSequence()
      }
    }
  }

  tempUnresolvedEvents = []
  @action
  resetTempUnresolvedEvents() {
    this.tempUnresolvedEvents = []
  }

  @action
  async addTempUnresolvedEvent(args) {
    if (!GameStore.sessionMode) {
      return
    }

    if (args.refId) {
      if ('recording' === GameStore.executionType) {
        const multiplier = args.multiplierFlag
          ? args.multiplierFlag.substr(args.multiplierFlag.lastIndexOf('-') + 1)
          : 0

        if (multiplier) {
          if (!isNaN(multiplier) && multiplier == 1) {
            this.tempUnresolvedEvents = []
          }
        }

        for (let i = this.tempUnresolvedEvents.length - 1; i >= 0; i--) {
          const event = this.tempUnresolvedEvents[i]
          if (event.refId.includes(args.multiplierFlag)) {
            await this.tempUnresolvedEvents.splice(i, 1)
          }
        }

        this.tempUnresolvedEvents.push({
          gameId: GameStore.gameId,
          playId: args.playId,
          evt: args.evt,
          refId: args.refId,
          wait: 0,
          value: args.value,
          sequence: 0,
          isPreviousPlayEnded: false,
          isIncrementHeaderPlaySequence: false,
          isIncrementPlaySequence: false,
          isIncrementSequence: true,
          timestampWait: 0,
        })
      }
    }
  }

  @action
  addEvent(args) {
    if (!GameStore.sessionMode && args.refId) {
      if (
        args.refId.includes('startendmodal-button-end') ||
        args.refId.includes('startendmodal-button-start') ||
        args.refId.includes('startendmodal-button-cancel') ||
        args.refId.includes('header-button-start') ||
        args.refId.includes('header-button-end-cancel') ||
        args.refId.includes('header-button-end')
      ) {
        //do nothing
      } else {
        return
      }
    }

    if (args.refId) {
      if (args.isIncrementHeaderPlaySequence) {
        this.incrementHeaderPlaySequence()
      }

      if ('automation' === GameStore.executionType) {
        this.incrementSequence()
      }

      if ('recording' === GameStore.executionType) {
        if (
          args.refId.match(new RegExp('header-team-', 'gi')) ||
          (args.refId.match(new RegExp('header-button-', 'gi')) &&
            !args.refId.match(new RegExp('header-button-start-', 'gi')) &&
            args.refId.toLowerCase() !== 'header-button-end')
          // (args.refId.match(new RegExp('header-button-', 'gi')) && args.refId.toLowerCase() !== 'header-button-end'))
        ) {
          // header-button-start-0
          // startendmodal-button-start
          return
        }

        if (
          !args.refId.match(new RegExp('playitem-addtostack-button-', 'gi')) ||
          args.refId !== 'go-button-Announce'
        ) {
          if (!args.doNotSave) {
            agent.GameServer.insertRecordedAutomation({
              gameId: GameStore.gameId,
              playId: args.playId,
              evt: args.evt,
              refId: args.refId,
              wait: 0,
              value: args.value,
              sequence: 0,
              isPreviousPlayEnded: args.isPreviousPlayEnded,
              isIncrementHeaderPlaySequence: args.isIncrementHeaderPlaySequence,
              isIncrementSequence: true,
              timestampWait: args.wait,
            })

            this.currentTime = 0
          }
        }
      }
    }
  }

  @action
  startSession() {
    this.footage = setInterval(() => {
      this.currentTime++
    }, 1000)
  }

  pauseSession() {
    if (this.footage) {
      clearInterval(this.footage)
    }
  }

  @action
  resetCurrentTime() {
    this.currentTime = 0
    this.events = []
    this.tempPlayEvents = []
  }

  @action
  endSession() {
    clearInterval(this.footage)
    //agent.GameServer.saveRecordedPlays({gameId: GameStore.gameId, plays: this.events})
  }

  @action
  lastSessionTime() {
    agent.GameServer.sendBeaconLastSessionTime({
      gameId: GameStore.gameId,
      HCommLastHeaderSequence: this.headerPlaySequence,
      HCommLastPlaySequence: this.playSequence,
      HCommLastWait: this.currentTime,
    })
  }

  async resetRecording() {
    if (GameStore.gameId) {
      const _gameId = await GameStore.gameId
      await GameStore.resetVars()
      await PrePlayStore.resetValues()
      await this.resetVars()
      agent.GameServer.resetRecording({ gameId: _gameId })
      setTimeout(() => window.location.reload(), 500)
    }
  }

  automationWaits = []
  automationCurrentPos = 0
  automationPausedPos = 0
  lastTimestamp = null

  @observable
  hasStartedAutomation = false
  @action
  setHasStartedAutomation(val) {
    this.hasStartedAutomation = val
    this.executeAutomation(GameStore.gameId)
  }

  @observable
  hasRestartedAutomation = false
  @action
  async setHasRestartedAutomation(val) {
    this.hasRestartedAutomation = val
    this.hasPausedAutomation = false

    this.automationWaits.forEach(timer => {
      clearTimeout(timer)
    })
    this.automationPausedPos = 0
    this.automationCurrentPos = this.list.length
    GameStore.resetVars()
    PrePlayStore.resetValues()
    this.resetVars()

    if (val) {
      setTimeout(() => {
        agent.GameServer.restartAutomation({
          gameId: GameStore.initialGameInfo.gameId,
          isHeadless: GameStore.initialGameInfo.isHeadless,
          executionType: GameStore.initialGameInfo.executionType,
        })
      }, 1000)
    }
  }

  @observable
  hasPausedAutomation = false
  @action
  async setHasPausedAutomation(val) {
    this.hasPausedAutomation = val
    this.hasResumeAutomation = false

    this.automationWaits.forEach(timer => {
      clearTimeout(timer)
    })
    if (this.lastTimestamp) {
      this.lastTimestamp.gameId = GameStore.gameId
      this.pauseSession()
      agent.GameServer.automationPaused(this.lastTimestamp)
    }
    this.automationPausedPos = await this.automationCurrentPos
    this.automationCurrentPos = await this.list.length
  }

  hasResumeAutomation = true
  @action
  setHasResumeAutomation(val) {
    this.hasResumeAutomation = val
    this.hasPausedAutomation = false
    this.automationCurrentPos = this.automationPausedPos

    this.currentTime = this.lastTimestamp.running
    agent.GameServer.automationResumed(this.lastTimestamp)

    this.startSession()
    this.iteratePlay()
  }

  sleep(milliseconds) {
    return new Promise(resolve =>
      this.automationWaits.push(setTimeout(resolve, milliseconds))
    )
  }

  list = []
  @action
  async executeAutomation(gameId) {
    if (
      'automation' === GameStore.initialGameInfo.executionType &&
      GameStore.initialGameInfo.isHeadless
    ) {
      if (gameId) {
        let url = `http://sportocotoday.com:6604/automation/recorded_plays?game_id=${gameId}`
        try {
          axios.get(url).then(response => {
            this.list = response.data
            if (this.list && Array.isArray(this.list) && this.list.length > 0) {
              this.iteratePlay()
            }
          })
        } catch (e) {
          console.log('Testing Error ------', e)
        }
      }
    }

    /*
        await this.sleep(2000)
        console.log('Call the Script')
        if (GameStore.initialGameInfo.isHeadless) {
          if (gameId) {
            let url = `http://sportocotoday.com:6604/automation/recorded_plays?game_id=${gameId}`
            try {
              axios.get(url).then(async response => {
                console.log('response', response)
                let data = response.data

                for (let index = 0; index < data.length; index++) {
                  const iterator = data[index]
                  console.log('refer Id ::::', iterator.ref_id)
                  if (index == 0) {
                    //keep quite
                  } else {
                    await this.sleep(data[index - 1] * 1000)
                  }
                  if (
                    iterator.is_previous_play_ended == 1 ||
                    iterator.event == 'delay'
                  ) {
                    await this.sleep(iterator.wait * 1000)
                  } else {
                    await this.sleep(iterator.wait * 1000)
                    if (document.getElementById(iterator.ref_id)) {
                      await document.getElementById(iterator.ref_id).click()
                    } else {
                      while (true) {
                        this.sleep(5000)
                        if (document.getElementById(iterator.ref_id)) {
                          break
                        }
                      }
                    }
                  }
                }
              })
            } catch (error) {
              console.log('Testing Error ------', error)
            }
          }
        }
    */
  }

  async iteratePlay() {
    if (this.automationCurrentPos < this.list.length) {
      const play = await this.list[this.automationCurrentPos]
      if (play) {
        if (play.ref_id && play.event) {
          this.lastTimestamp = { running: this.currentTime, wait: play.wait }
          if (
            play.is_previous_play_ended ||
            play.event.toLowerCase() == 'delay'
          ) {
            await this.sleep(play.wait * 1000)
          } else {
            if (play.event.toLowerCase() == 'click') {
              await this.sleep(play.wait * 1000)
              if (document.getElementById(play.ref_id)) {
                await document.getElementById(play.ref_id).click()
              } else {
                this.automationCurrentPos += 1
                await this.iteratePlay()
                return
              }
            }
          }
        }
      }

      this.automationCurrentPos += 1
      await this.iteratePlay()
    } else {
      this.automationPausedPos = 0
      this.automationCurrentPos = 0
      this.automationWaits.forEach(timer => {
        clearTimeout(timer)
      })
      this.hasPausedAutomation = true
      return
    }
  }

  resetVars() {
    if (this.footage) {
      clearInterval(this.footage)
    }
    this.currentTime = 0
    this.footage = null
    this.events = []
    this.sequence = 0
    this.headerPlaySequence = 0
    this.playSequence = 0
    this.tempPlayEvents = []
    this.tempUnresolvedEvents = []
    this.hasRestartedAutomation = false
    this.automationWaits = []
  }
}

export default new AutomationStore()
