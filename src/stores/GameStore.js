import { observable, action, computed } from 'mobx'
import agent from '@/Agent'
import PrePlayStore from '@/stores/PrePlayStore'
import config from '@/Agent/config'

class GameStore {
  currentGameEvent = 'fbnfl'

  @action
  setCurrentGameEvent(val) {
    this.currentGameEvent = val
  }

  gameEvents = ['fbnfl', 'bbnba']

  @observable
  isLoading = false

  @observable
  isError = false
  @action
  setError(val) {
    this.isError = val
  }

  @observable
  isAvailable = false

  gameId = null

  @observable
  progress = 'active'

  dateEndSession = null
  progressStates = null

  participants = []
  preset = []
  baseOptions = []
  baseDefaults = []
  timePeriods = []
  interruptPlays = []
  venue = null
  prePicks = []
  recordedPlays = []
  lastSessionTime = 0
  videoPath = null
  isTimeStarted = false
  sponsorPackages = []
  sportTypes = []

  @observable
  lastSequence = 0

  @observable
  HCommLastHeaderSequence = 0

  @observable
  HCommLastPlaySequence = 0

  @observable
  HCommLastWait = 0

  @observable
  automationRestartedServerCallback = false

  @computed
  get sessionIsStarted() {
    return this.progress === 'live' ? true : false
  }

  connectSC() {
    agent.GameServer.connectSC()
  }

  initialGameInfo = null
  @action
  setInitialGameInfo(val) {
    this.initialGameInfo = val
  }

  subscribeToGame(params) {
    this.isLoading = true
    PrePlayStore.resetValues()
    agent.GameServer.subscribeToGame(params, this.gameEvents)
  }

  @observable
  hasReset = false
  setHasReset(val) {
    PrePlayStore.resetValues()
    this.hasReset = val
  }

  setInfo(data) {
    console.log('INFO: ', data)

    if (data) {
      this.gameId = data.gameId
      this.progress = data.progress
      this.lastSessionTime = data.lastSessionTime
      this.lastSequence = data.lastSequence
      this.HCommLastHeaderSequence = data.HCommLastHeaderSequence
      this.HCommLastPlaySequence = data.HCommLastPlaySequence
      this.HCommLastWait = data.HCommLastWait
      this.dateEndSession = data.dateEndSession
      this.progressStates = data.progressStates

      this.participants = data.participants
      this.preset = data.preset
      this.baseOptions = data.baseOptions
      this.baseDefaults = data.defaults
      this.timePeriods = data.timePeriods
      this.interruptPlays = data.interruptionPeriods
      this.venue = data.venue
      this.prePicks = data.prePicks
      this.videoPath = data.videoPath
      this.isTimeStarted = data.isTimeStarted
      this.recordedPlays = data.recordedPlays
      this.sportTypes = data.sportTypes
      this.sponsorPackages = data.sponsorPackages
      this.automationRestartedServerCallback =
        data.automationRestartedServerCallback || false

      // if (
      //   this.recordedPlays &&
      //   Array.isArray(this.recordedPlays) &&
      //   this.recordedPlays.length < 1
      // ) {
      //   this.recordedPlays = data.recordedPlays
      // }

      // if (this.sponsorPackages &&
      //   Array.isArray(this.sponsorPackages) &&
      //   this.sponsorPackages.length < 1
      // ) {
      //   this.sponsorPackages = data.sponsorPackages
      // }

      // if (this.sportTypes &&
      //   Array.isArray(this.sportTypes) &&
      //   this.sportTypes.length < 1
      // ) {
      //   this.sportTypes = data.sportTypes
      // }

      if (data.isFootageRecorded) {
        if (this.executionType === 'recording') {
          this.setRecordEnded(true)
        }
        this.setSessionMode(0)
      }

      if (data.dateEndSession) {
        PrePlayStore.sessionButtons['start'] = {
          backgroundColor: '#18c5ff',
          color: '#000000',
          text: 'session ended',
          locked: true,
        }
        PrePlayStore.sessionButtons['end'].locked = true
      } else {
        PrePlayStore.sessionButtons['start'].locked = data.progress === 'live'
      }

      PrePlayStore.setCurrentPlayItem(data.currentPlay)
      if (data.unresolvedPlays) {
        //PrePlayStore.setUnresolvedItems(data.unresolvedPlays)
        //PrePlayStore.unresolvedItems.unshift(data.unresolvedPlay)
        this.setPlayUnresolved(data.unresolvedPlays)
      }

      if (data.resolvedPlays) {
        this.setPlayResolved(data.resolvedPlays)
      }

      this.extractPresets()

      agent.GameServer.setHeadless(this.headless)
    } else {
      this.gameId = null
      this.isAvailable = false
      this.isLoading = false
    }
  }

  extractPresets() {
    this.extractTeams()
      .then(next => {
        if (next) {
          return this.assignIdOnPredetermined()
        }
      })
      .then(next => {
        if (next) {
          return this.extractPreDetermined()
        }
      })
      .then(next => {
        if (next) {
          return this.extractBaseOptions()
        }
      })
      .then(next => {
        if (next) {
          return this.addNonLivePlayOptions()
        }
      })
      .then(next => {
        if (next) {
          return this.extractTimePeriods()
        }
      })
      .then(next => {
        if (next) {
          return this.extractInterruptPlays()
        }
      })
      .then(next => {
        if (next) {
          return this.extractSponsors()
        }
      })
      .then(next => {
        if (next) {
          this.extractPrePicks()
        }
      })
      .finally(() => {
        this.isLoading = false
        this.isAvailable = true

        //AUTOMATION
        if (
          this.recordedPlays &&
          Array.isArray(this.recordedPlays) &&
          this.recordedPlays.length > 2 &&
          'recording' === this.executionType
        ) {
          PrePlayStore.sessionButtons['start'] = {
            backgroundColor: '#18c5ff',
            color: '#000000',
            text: 'record ended',
            locked: true,
          }
          PrePlayStore.sessionButtons['end'].locked = true
        } else {
          if (this.isTimeStarted) {
            /**
             * this.isTimeStarted will be used during recording
             */

            this.sessionStartedButtonAttributes()
          } else {
            if (
              this.progress === 'live' &&
              this.executionType === 'recording'
            ) {
              if (
                PrePlayStore.sessionButtons['start'] &&
                (
                  PrePlayStore.sessionButtons['start'].text || ''
                ).toLowerCase() !== 'pause'
              ) {
                this.sessionResumeButtonAttributes()
              }
            } else if (
              this.progress === 'live' &&
              this.executionType !== 'recording'
            ) {
              this.sessionStartedButtonAttributes()
            }
          }
        }
      })
  }

  extractTeams() {
    return new Promise(resolve => {
      if (this.participants && this.participants.length > 0) {
        let teams = []
        this.participants.forEach((team, idx) => {
          teams.push({
            publicId: team.id,
            id: team.sequence,
            teamName: team.name,
            initial: team.initial,
            iconTopColor: team.topColor,
            iconBottomColor: team.bottomColor,
            index: idx,
            score: 0,
          })
        })

        PrePlayStore.setTeams(teams)
      }

      resolve(true)
    })
  }

  async assignBlankPresetItems() {
    let id = await PrePlayStore.presetItems.reduce((prev, curr) => {
      return prev.id > curr.id ? prev.id : curr.id
    })

    const blankPresets = [
      {
        id: 1,
        preset: '2-CHOICE',
        isMultiplier: false,
        question: '',
        choices: [{ value: '' }, { value: '' }],
        type: 'LivePlay',
        isBlank: true,
      },
      {
        id: 2,
        preset: '3-CHOICE',
        isMultiplier: false,
        question: '',
        choices: [{ value: '' }, { value: '' }, { value: '' }],
        type: 'LivePlay',
        isBlank: true,
      },
      {
        id: 3,
        preset: '4-CHOICE',
        isMultiplier: false,
        question: '',
        choices: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
        type: 'LivePlay',
        isBlank: true,
      },
      {
        id: 4,
        preset: '5-CHOICE',
        isMultiplier: false,
        question: '',
        choices: [
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
        ],
        type: 'LivePlay',
        isBlank: true,
      },
    ]
    blankPresets.forEach(preset => {
      preset.id = ++id
      PrePlayStore.presetItems.push(preset)
    })
  }

  assignIdOnPredetermined() {
    PrePlayStore.resetPresetItems()

    return new Promise(resolve => {
      let id = 0

      for (let i = 0; i < this.preset.length; i++) {
        this.preset[i].id = ++id
      }

      for (let j = 0; j < this.baseOptions.length; j++) {
        this.baseOptions[j].id = ++id
      }

      resolve(true)
    })
  }

  assignIdOnPredeterminedORIG__() {
    PrePlayStore.resetPresetItems()

    return new Promise(resolve => {
      let id = 0

      if (!this.preset || (this.preset && this.preset.length < 1)) {
        id = 1000
        const blankPresets = [
          {
            id: 1,
            preset: '2-CHOICE',
            isMultiplier: false,
            question: '',
            choices: [{ value: '' }, { value: '' }],
            type: 'LivePlay',
          },
          {
            id: 2,
            preset: '3-CHOICE',
            isMultiplier: false,
            question: '',
            choices: [{ value: '' }, { value: '' }, { value: '' }],
            type: 'LivePlay',
          },
          {
            id: 3,
            preset: '4-CHOICE',
            isMultiplier: false,
            question: '',
            choices: [
              { value: '' },
              { value: '' },
              { value: '' },
              { value: '' },
            ],
            type: 'LivePlay',
          },
          {
            id: 4,
            preset: '5-CHOICE',
            isMultiplier: false,
            question: '',
            choices: [
              { value: '' },
              { value: '' },
              { value: '' },
              { value: '' },
              { value: '' },
            ],
            type: 'LivePlay',
          },
        ]
        blankPresets.forEach(preset => {
          preset.id = ++id
          PrePlayStore.presetItems.push(preset)
        })
      } else {
        for (let i = 0; i < this.preset.length; i++) {
          this.preset[i].id = ++id
        }

        for (let j = 0; j < this.baseOptions.length; j++) {
          this.baseOptions[j].id = ++id
        }

        // for (let k = 0; k < this.baseDefaults.length; k++) {
        //  this.baseDefaults[k].id = ++id
        // }
      }

      resolve(true)
    })
  }

  extractPreDetermined() {
    return new Promise(resolve => {
      if (this.preset && this.preset.length > 0) {
        this.preset.forEach(item => {
          let choices = []
          if (item.values && item.values.length > 0) {
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

      resolve(true)
    })
  }

  extractBaseOptions() {
    return new Promise(resolve => {
      const _baseOptions = JSON.parse(JSON.stringify(this.baseOptions))
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

      resolve(true)
    })
  }

  addNonLivePlayOptions() {
    return new Promise(async resolve => {
      let id = 1000

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

      this.assignBlankPresetItems()

      resolve(true)
    })
  }

  addNonLivePlayOptionsORIG__() {
    return new Promise(async resolve => {
      let id = await PrePlayStore.presetItems.reduce((prev, curr) => {
        return prev.id > curr.id ? prev.id : curr.id
      })

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

      resolve(true)
    })
  }

  extractTimePeriods() {
    return new Promise(resolve => {
      if (this.timePeriods && this.timePeriods.length > 0) {
        let _tp = []
        this.timePeriods.forEach(t => {
          _tp.push(t)
        })

        _tp.unshift({ name: '' })
        PrePlayStore.setTimePeriods(_tp)
      }

      resolve(true)
    })
  }

  extractInterruptPlays() {
    return new Promise(resolve => {
      if (this.interruptPlays && this.interruptPlays.length > 0) {
        let _ip = []
        this.interruptPlays.forEach(i => {
          _ip.push(i)
        })

        PrePlayStore.setInterruptPlays(_ip)
      }

      resolve(true)
    })
  }

  extractPrePicks() {
    return new Promise(resolve => {
      if (this.prePicks && this.prePicks.length > 0) {
        this.prePicks.forEach(async pp => {
          let _question =
            JSON.parse(
              JSON.parse(JSON.stringify(pp.questionHeader.replace(/'/g, '"')))
            ).value + ', '

          const _qDetail = JSON.parse(
            JSON.parse(JSON.stringify(pp.questionDetail.replace(/'/g, '"')))
          )
          _qDetail.forEach(qd => {
            _question += qd.value
          })

          pp.question = _question
          pp.choices = JSON.parse(
            JSON.parse(JSON.stringify(pp.choices.replace(/'/g, '"')))
          )

          if (pp.choiceType === 'ab') {
            for (let i = 0; i < pp.choices.length; i++) {
              pp.choices[i] = Object.assign(
                {},
                PrePlayStore.teams.filter(o => o.id === pp.choices[i].id)[0]
              )
            }
          }

          pp.forParticipant = JSON.parse(
            JSON.parse(JSON.stringify(pp.forParticipant.replace(/'/g, '"')))
          )
          if (pp.forParticipant && Object.keys(pp.forParticipant).length > 0) {
            pp.forParticipant = Object.assign(
              {},
              PrePlayStore.teams.filter(o => o.id === pp.forParticipant.id)[0]
            )
          }

          pp.correctChoice =
            pp.correctChoice && Object.keys(pp.correctChoice).length > 0
              ? JSON.parse(
                  JSON.parse(
                    JSON.stringify(pp.correctChoice.replace(/'/g, '"'))
                  )
                )
              : null
        })
      }
    })
  }

  extractSponsors() {
    return new Promise(async resolve => {
      debugger
      const _sponsors = []
      for (let i = 0; i < this.sponsorPackages.length; i++) {
        const _raw = this.sponsorPackages[i]
        const _sponsor = await _sponsors.filter(
          o => o.id === _raw.package_id
        )[0]
        if (_sponsor) {
          if (_raw.sponsor_id) {
            await _sponsor.brands.push({
              brandId: _raw.sponsor_id,
              brandName: _raw.sponsor_name,
              brandImage: `${config.SECURE_PROTOCOL}://${config.IMAGE_URL}/${config.IMAGE_FOLDER}/${_raw.sponsor_image}`,
              brandExposureCount: _raw.sponsor_exposure_count,
            })
          }
        } else {
          await _sponsors.push({
            id: _raw.package_id,
            name: _raw.package_name,
            initial: _raw.package_initial,
            initialColor: _raw.package_initial_color,
            backgroundColor: _raw.package_background_color,
            circleBorderColor: _raw.package_circle_border_color,
            circleFill: _raw.package_circle_fill,
            brands: [
              {
                brandId: _raw.sponsor_id,
                brandName: _raw.sponsor_name,
                brandImage: `${config.SECURE_PROTOCOL}://${config.IMAGE_URL}/${config.IMAGE_FOLDER}/${_raw.sponsor_image}`,
                brandExposureCount: _raw.sponsor_exposure_count,
              },
            ],
          })
        }
      }

      PrePlayStore.sponsors = _sponsors

      return resolve(true)
    })
  }

  sessionResumeButtonAttributes() {
    PrePlayStore.sessionButtons['start'] = {
      backgroundColor: '#008001',
      color: '#fff',
      text: 'resume session',
      locked: false,
    }
    PrePlayStore.sessionButtons['end'].locked = true
    this.setSessionMode(0)
  }

  sessionPauseButtonAttributes() {
    PrePlayStore.sessionButtons['start'] = {
      locked: this.executionType === 'recording' ? false : true,
      backgroundColor: '#000000',
      color: '#c61818',
      text: 'recording' === this.executionType ? 'pause' : 'in session',
    }
    PrePlayStore.sessionButtons['end'].locked = false
    this.setSessionMode(1)
  }

  sessionStartedButtonAttributes() {
    PrePlayStore.sessionButtons['start'] = {
      backgroundColor: '#000000',
      color: '#c61818',
      text: this.executionType === 'recording' ? 'pause' : 'in session',
      locked: this.executionType === 'recording' ? false : true,
    }
    PrePlayStore.sessionButtons['end'].locked = false
    this.setSessionMode(1)
  }

  addThePlay(playItem) {
    console.log('addThePlay: ', JSON.parse(JSON.stringify(playItem)))
    let play = null
    if ('announce' === playItem.type.trim().toLowerCase()) {
      const replaceWords = '<span class="ql-cursor">﻿</span>'
      let header = playItem.announcements
        .filter(o => o.area === 'header')[0]
        .value.replace(replaceWords, '')
        .replace('<span class="ql-cursor">?</span>', '')
      let middle = playItem.announcements
        .filter(o => o.area === 'middle')[0]
        .value.replace(replaceWords, '')
        .replace('<span class="ql-cursor">?</span>', '')
      let bottom = playItem.announcements
        .filter(o => o.area === 'bottom')[0]
        .value.replace(replaceWords, '')
        .replace('<span class="ql-cursor">?</span>', '')

      play = {
        id: playItem.id,
        index: playItem.id,
        type: 'Announce',
        sponsor: playItem.sponsor,
        sponsorId:
          playItem.sponsor &&
          playItem.sponsor.sponsorItem &&
          playItem.sponsor.sponsorItem.brandId
            ? playItem.sponsor.sponsorItem.brandId
            : 0,
        announcements: [
          { area: 'header', value: header },
          { area: 'middle', value: middle },
          { area: 'bottom', value: bottom },
        ],
        executionType: playItem.executionType,
        recordedAutomation: playItem.recordedAutomation,
        editorEvents: playItem.editorEvents,
      }
    } else {
      //delete playItem.choices
      play = JSON.parse(JSON.stringify(playItem))
      delete play.index
      delete play.length

      //////////--OLD play.participantId = play.team.publicId
      play.participantId =
        play.team && play.team.publicId
          ? play.team.publicId
          : play.participantId
      //delete Object.assign(play, {['forParticipant']: play['team']})['team'];
      delete play.team

      if (play.multiplierChoices.length > 0) {
        play.multiplierChoices[0].question = play.playTitle.value
        for (let i = 0; i < play.multiplierChoices.length; i++) {
          if (play.multiplierChoices[i].isBlank) {
            play.multiplierChoices[i].choices = play.choices
          }
        }
      }
      play.playTitle = play.playTitle.value
      //+mod by aurelio play.presetId = play.preset.id
      ///////////--OLD
      //play.presetId = play.preset.preset
      play.presetId =
        play.preset && play.preset.preset ? play.preset.preset : play.presetId
      delete play.preset
      // if (playItem.multiplierChoices && playItem.multiplierChoices.length > 0) {
      //   playItem.multiplierChoices.forEach(item => {
      //     delete item.isMultiplier
      //     delete item.locked
      //     delete item.type
      //   })
      // }
      play.award =
        play.award && Object.keys(play.award).length > 0
          ? play.award.value
          : null
      play.sponsorId =
        play.sponsor &&
        play.sponsor.sponsorItem &&
        play.sponsor.sponsorItem.brandId
          ? play.sponsor.sponsorItem.brandId
          : 0
      delete play.sponsor
    }

    agent.GameServer.addThePlay(play)
  }

  updatePlay(playItem) {
    const playItemToUpdate = Object.assign({}, playItem)
    delete playItemToUpdate.choices
    delete playItemToUpdate.index
    delete playItemToUpdate.length
    //delete Object.assign(playItemToUpdate, {['forParticipant']: playItemToUpdate['team']})['team'];

    playItemToUpdate.participantId = playItemToUpdate.team
      ? playItemToUpdate.team.publicId || 0
      : 0
    delete playItemToUpdate.team
    playItemToUpdate.playTitle = playItemToUpdate.playTitle.value
    playItemToUpdate.award =
      playItemToUpdate.award && Object.keys(playItemToUpdate.award).length > 0
        ? playItemToUpdate.award.value
        : null

    // old
    // playItemToUpdate.sponsorId = playItemToUpdate.sponsor
    //   ? playItemToUpdate.sponsor.id
    //   : 0;

    // new
    playItemToUpdate.sponsorId =
      playItemToUpdate.sponsor &&
      playItemToUpdate.sponsor.sponsorItem &&
      playItemToUpdate.sponsor.sponsorItem.brandId
        ? playItemToUpdate.sponsor.sponsorItem.brandId
        : 0

    delete playItemToUpdate.sponsor

    agent.GameServer.updatePlay(playItemToUpdate)
  }

  removePlay(args) {
    agent.GameServer.removePlay({
      gameId: this.gameId,
      id: args.id,
      executionType: args.executionType,
    })
  }

  async setPlayCurrent(data) {
    console.log('CURRENT\n', data)
    if (data) {
      if ('announce' === data.type.toLowerCase()) {
        //id, index, choies, playTitle, stars
        data.index = data.id
        data.choices = []
        data.sponsorExpanded = false
        data.sessionStarted = this.progress === 'live'

        // old sponsor
        // data.sponsor = await PrePlayStore.sponsors.filter(
        //   o => o.id === data.sponsorId
        // )[0]

        // new sponsor
        data.sponsor = await this.getSelectedSponsor(data.sponsorId)

        PrePlayStore.setCurrentPlayItem(data)
        return
      }
      //////////////////////////////data.choices = data.multiplierChoices[0].choices
      data.choices = await data.multiplierChoices.filter(
        o => o.id === data.id
      )[0].choices
      data.choices.sort((a, b) => a.sequence - b.sequence)
      //////////////////////////////data.id = data.multiplierChoices[0].id
      //////////////////////////////data.index = data.multiplierChoices[0].id
      data.index = data.id
      data.length = 0
      data.lockedOut = false
      data.multiplierItems = []
      data.playInProcess = false
      data.resultConfirmed = false
      data.sessionStarted = this.progress === 'live'
      data.playTitle = { id: 1, value: data.playTitle }
      //delete Object.assign(data, {['team']: data['forParticipant']})['forParticipant'];
      data.team = await PrePlayStore.teams.filter(
        o => o.publicId === data.participantId
      )[0]
      //+mod by aurelio data.preset = await PrePlayStore.presetItems.filter(o => o.id === data.presetId)[0]
      data.preset = await PrePlayStore.presetItems.filter(
        o =>
          (o.preset || '').toLowerCase() === (data.presetId || '').toLowerCase()
      )[0]

      // old sponsor
      // data.sponsor = await PrePlayStore.sponsors.filter(
      //   o => o.id === data.sponsorId
      // )[0]

      // new sponsor
      data.sponsor = await this.getSelectedSponsor(data.sponsorId)

      for (let i = 0; i < data.multiplierChoices.length; i++) {
        data.multiplierChoices[i].choices.sort(
          (a, b) => a.sequence - b.sequence
        )
      }

      if (PrePlayStore.currentPlayItem) {
        if (PrePlayStore.currentPlayItem.id !== data.id) {
          await PrePlayStore.setCurrentPlayItem(null)
          PrePlayStore.setCurrentPlayItem(data)
        }
      } else {
        PrePlayStore.setCurrentPlayItem(data)
      }
    } else {
      PrePlayStore.setCurrentPlayItem(null)
    }
  }

  async setPlayNext(data) {
    console.log('NEXT\n', data)
    if (data) {
      //-- au await PrePlayStore.setAddToStackItem(null)
      await PrePlayStore.setNextPlayItem(null)
      if ('announce' === data.type.toLowerCase()) {
        //id, index, choies, playTitle, stars
        data.index = data.id
        data.choices = []
        data.sponsorExpanded = false
        data.sessionStarted = this.progress === 'live'

        // old sponsor
        // data.sponsor = await PrePlayStore.sponsors.filter(
        //   o => o.id === data.sponsorId
        // )[0]

        // new sponsor
        data.sponsor = await this.getSelectedSponsor(data.sponsorId)

        PrePlayStore.setNextPlayItem(data)
        return
      }

      /////////////data.choices = data.multiplierChoices[0].choices
      data.choices = await data.multiplierChoices.filter(
        o => o.id === data.id
      )[0].choices
      data.choices.sort((a, b) => a.sequence - b.sequence)
      /////////////data.id = data.multiplierChoices[0].id
      /////////////data.index = data.multiplierChoices[0].id
      data.index = data.id
      data.length = 0
      data.lockedOut = false
      data.multiplierItems = []
      data.playInProcess = false
      data.resultConfirmed = false
      data.sessionStarted = this.progress === 'live'
      data.started = null
      data.playTitle = { id: 1, value: data.playTitle }
      //delete Object.assign(data, {['team']: data['forParticipant']})['forParticipant'];
      data.team = await PrePlayStore.teams.filter(
        o => o.publicId === data.participantId
      )[0]
      //+mod by aurelio data.preset = await PrePlayStore.presetItems.filter(o => o.id === data.presetId)[0]
      data.preset = await PrePlayStore.presetItems.filter(
        o =>
          (o.preset || '').toLowerCase() === (data.presetId || '').toLowerCase()
      )[0]

      // old sponsor
      // data.sponsor = await PrePlayStore.sponsors.filter(
      //   o => o.id === data.sponsorId
      // )[0]

      // new sponsor
      data.sponsor = await this.getSelectedSponsor(data.sponsorId)

      for (let i = 0; i < data.multiplierChoices.length; i++) {
        data.multiplierChoices[i].choices.sort(
          (a, b) => a.sequence - b.sequence
        )
      }

      if (PrePlayStore.nextPlayItem) {
        if (
          PrePlayStore.nextPlayItem.id !== data.id ||
          PrePlayStore.nextPlayItem.participantId !== data.participantId
        ) {
          await PrePlayStore.setNextPlayItem(null)
          PrePlayStore.setNextPlayItem(data)
        }
      } else {
        PrePlayStore.setNextPlayItem(data)
      }
    } else {
      PrePlayStore.setNextPlayItem(null)
    }
  }

  async setUpdatedPlay(item) {
    item.choices = await item.multiplierChoices.filter(o => o.id === item.id)[0]
      .choices
    if (item.choices) {
      item.choices.sort((a, b) => a.sequence - b.sequence)
    }
    /////////////////////////////////////item.id = item.multiplierChoices[0].id
    /////////////////////////////////////item.index = item.multiplierChoices[0].id
    item.index = item.id
    item.length = 0
    item.lockedOut = false
    item.multiplierItems = []
    item.playInProcess = false
    item.resultConfirmed = false
    item.sessionStarted = this.progress === 'live'
    item.started = null
    item.playTitle = { id: 1, value: item.playTitle }
    //delete Object.assign(item, {['team']: item['forParticipant']})['forParticipant'];
    item.team = await PrePlayStore.teams.filter(
      o => o.publicId === item.participantId
    )[0]
    //+mod by aurelio item.preset = await PrePlayStore.presetItems.filter(o => o.id === item.presetId)[0]
    item.preset = await PrePlayStore.presetItems.filter(
      o =>
        (o.preset || '').toLowerCase() === (item.presetId || '').toLowerCase()
    )[0]

    // old
    // item.sponsor = await PrePlayStore.sponsors.filter(
    //   o => o.id === item.sponsorId
    // )[0]

    // new sponsor
    item.sponsor = await this.getSelectedSponsor(item.sponsorId)

    for (let i = 0; i < item.multiplierChoices.length; i++) {
      await item.multiplierChoices[i].choices.sort(
        (a, b) => a.sequence - b.sequence
      )
    }

    PrePlayStore.setUpdatedPlay(item)
  }

  async setPlayStack(data) {
    console.log('STACK\n', data)

    if (data && data.length > 0) {
      //-- au await PrePlayStore.setAddToStackItem(null)

      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if ('announce' === item.type.toLowerCase()) {
          //id, index, choies, playTitle, stars
          item.index = item.id
          item.choices = []
          item.sponsorExpanded = false
          item.sessionStarted = this.progress === 'live'

          // old sponsor
          // item.sponsor = await PrePlayStore.sponsors.filter(
          //   o => o.id === item.sponsorId
          // )[0]

          // new sponsor
          item.sponsor = await this.getSelectedSponsor(item.sponsorId)
        } else {
          /////////////////////////////////////item.choices = item.multiplierChoices[0].choices
          item.choices = await item.multiplierChoices.filter(
            o => o.id === item.id
          )[0].choices
          if (item.choices) {
            item.choices.sort((a, b) => a.sequence - b.sequence)
          }
          /////////////////////////////////////item.id = item.multiplierChoices[0].id
          /////////////////////////////////////item.index = item.multiplierChoices[0].id
          item.index = item.id
          item.length = 0
          item.lockedOut = false
          item.multiplierItems = []
          item.playInProcess = false
          item.resultConfirmed = false
          item.sessionStarted = this.progress === 'live'
          item.started = null
          item.playTitle = { id: 1, value: item.playTitle }
          //delete Object.assign(item, {['team']: item['forParticipant']})['forParticipant'];
          item.team = await PrePlayStore.teams.filter(
            o => o.publicId === item.participantId
          )[0]
          //+mod by aurelio item.preset = await PrePlayStore.presetItems.filter(o => o.id === item.presetId)[0]
          item.preset = await PrePlayStore.presetItems.filter(
            o =>
              (o.preset || '').toLowerCase() ===
              (item.presetId || '').toLowerCase()
          )[0]

          // old sponsor
          // item.sponsor = await PrePlayStore.sponsors.filter(
          //   o => o.id === item.sponsorId
          // )[0]

          // new sponsor
          item.sponsor = await this.getSelectedSponsor(item.sponsorId)

          for (let i = 0; i < item.multiplierChoices.length; i++) {
            await item.multiplierChoices[i].choices.sort(
              (a, b) => a.sequence - b.sequence
            )
          }
        }
      }
    }

    PrePlayStore.setPrePlayItems(data)
    PrePlayStore.setIsAddingStack(false)
  }

  async setPlayUnresolved(data) {
    const list = []
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if ('announce' !== item.type.toLowerCase()) {
          //////////////////////////////////////item.choices = item.multiplierChoices[0].choices
          item.choices = await item.multiplierChoices.filter(
            o => o.id === item.id
          )[0].choices
          item.choices.sort((a, b) => a.sequence - b.sequence)
          //////////////////////////////////////item.id = item.multiplierChoices[0].id
          //////////////////////////////////////item.index = item.multiplierChoices[0].id
          item.index = item.id
          item.length = 0
          item.lockedOut = false
          item.multiplierItems = []
          item.playInProcess = false
          item.resultConfirmed = false
          item.sessionStarted = this.progress === 'live'
          item.playTitle = { id: 1, value: item.playTitle }
          //delete Object.assign(item, {['team']: item['forParticipant']})['forParticipant'];
          item.team = await PrePlayStore.teams.filter(
            o => o.publicId === item.participantId
          )[0]
          //+mod by aurelio item.preset = await PrePlayStore.presetItems.filter(o => o.id === item.presetId)[0]
          item.preset = await PrePlayStore.presetItems.filter(
            o =>
              (o.preset || '').toLowerCase() ===
              (item.presetId || '').toLowerCase()
          )[0]

          // old sponsor
          // item.sponsor = await PrePlayStore.sponsors.filter(
          //   o => o.id === item.sponsorId
          // )[0]

          // new sponsor
          item.sponsor = await this.getSelectedSponsor(item.sponsorId)

          for (let i = 0; i < item.multiplierChoices.length; i++) {
            item.multiplierChoices[i].choices.sort(
              (a, b) => a.sequence - b.sequence
            )
          }

          list.push(item)
        }
      }
    }

    console.log('UNRESOLVED\n', data)
    PrePlayStore.setUnresolvedItems(list)
  }

  async setPlayResolved(data) {
    const list = []
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if ('announce' === item.type.toLowerCase()) {
          item.index = data.id
          item.choices = []
          item.sponsorExpanded = false
          item.sessionStarted = false

          // old sponsor
          // item.sponsor = await PrePlayStore.sponsors.filter(
          //   o => o.id === item.sponsorId
          // )[0]

          // new sponsor
          item.sponsor = await this.getSelectedSponsor(item.sponsorId)
        } else {
          ////////////////////////////////////////item.choices = item.multiplierChoices[0].choices
          item.choices = await item.multiplierChoices.filter(
            o => o.id === item.id
          )[0].choices
          item.choices.sort((a, b) => a.sequence - b.sequence)
          ////////////////////////////////////////item.id = item.multiplierChoices[0].id
          ////////////////////////////////////////item.index = item.multiplierChoices[0].id
          item.index = item.id
          item.length = 0
          item.lockedOut = false
          item.multiplierItems = []
          item.playInProcess = false
          item.resultConfirmed = false
          item.sessionStarted = this.progress === 'live'
          item.playTitle = { id: 1, value: item.playTitle }
          //delete Object.assign(item, {['team']: item['forParticipant']})['forParticipant'];
          item.team = await this.participants.filter(
            o => o.publicId === item.participantId
          )[0]
          //+mod by aurelio item.preset = await PrePlayStore.presetItems.filter(o => o.id === item.presetId)[0]
          item.preset = await PrePlayStore.presetItems.filter(
            o => o.preset === item.presetId
          )[0]

          // old sponsor
          // item.sponsor = await PrePlayStore.sponsors.filter(
          //   o => o.id === item.sponsorId
          // )[0]

          // new sponsor
          item.sponsor = await this.getSelectedSponsor(item.sponsorId)

          for (let i = 0; i < item.multiplierChoices.length; i++) {
            item.multiplierChoices[i].choices.sort(
              (a, b) => a.sequence - b.sequence
            )
          }
        }

        list.push(item)
      }
    }

    console.log('RESOLVED\n', list)
    PrePlayStore.setResolvedItems(list)
  }
  async setPlayResolved_02192021(data) {
    const list = []
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if ('announce' !== item.type.toLowerCase()) {
          ////////////////////////////////////////item.choices = item.multiplierChoices[0].choices
          item.choices = await item.multiplierChoices.filter(
            o => o.id === item.id
          )[0].choices
          item.choices.sort((a, b) => a.sequence - b.sequence)
          ////////////////////////////////////////item.id = item.multiplierChoices[0].id
          ////////////////////////////////////////item.index = item.multiplierChoices[0].id
          item.index = item.id
          item.length = 0
          item.lockedOut = false
          item.multiplierItems = []
          item.playInProcess = false
          item.resultConfirmed = false
          item.sessionStarted = this.progress === 'live'
          item.playTitle = { id: 1, value: item.playTitle }
          //delete Object.assign(item, {['team']: item['forParticipant']})['forParticipant'];
          item.team = await this.participants.filter(
            o => o.publicId === item.participantId
          )[0]
          //+mod by aurelio item.preset = await PrePlayStore.presetItems.filter(o => o.id === item.presetId)[0]
          item.preset = await PrePlayStore.presetItems.filter(
            o => o.preset === item.presetId
          )[0]
          item.sponsor = await PrePlayStore.sponsors.filter(
            o => o.id === item.sponsorId
          )[0]

          for (let i = 0; i < item.multiplierChoices.length; i++) {
            item.multiplierChoices[i].choices.sort(
              (a, b) => a.sequence - b.sequence
            )
          }

          list.push(item)
        }
      }
    }

    console.log('RESOLVED\n', data)
    PrePlayStore.setResolvedItems(list)
  }

  gameStart() {
    agent.GameServer.gameStart({
      gameId: this.gameId,
      executionType: this.executionType,
    })
    this.setSessionMode(1)
  }

  gameEnd() {
    agent.GameServer.gameEnd({
      gameId: this.gameId,
      stage: 'recording' === this.executionType ? 'pending' : 'postgame',
      executionType: this.executionType,
    })
    this.setSessionMode(0)
  }

  goPlay(playItem) {
    let play = null

    if ('announce' === playItem.type.trim().toLowerCase()) {
      const replaceWords = '<span class="ql-cursor">﻿</span>'
      let header = playItem.announcements
        .filter(o => o.area === 'header')[0]
        .value.replace(replaceWords, '')
        .replace('<span class="ql-cursor">?</span>', '')
      let middle = playItem.announcements
        .filter(o => o.area === 'middle')[0]
        .value.replace(replaceWords, '')
        .replace('<span class="ql-cursor">?</span>', '')
      let bottom = playItem.announcements
        .filter(o => o.area === 'bottom')[0]
        .value.replace(replaceWords, '')
        .replace('<span class="ql-cursor">?</span>', '')

      if (!playItem.id) {
        play = {
          id: '',
          index: '',
          gameId: this.gameId,
          type: 'Announce',
          sponsor: playItem.sponsor,
          sponsorId:
            playItem.sponsor &&
            playItem.sponsor.sponsorItem &&
            playItem.sponsor.sponsorItem.brandId
              ? playItem.sponsor.sponsorItem.brandId
              : 0,
          isNew: playItem.isNew,
          announcements: [
            { area: 'header', value: header },
            { area: 'middle', value: middle },
            { area: 'bottom', value: bottom },
          ],
          recordedAutomation: playItem.recordedAutomation,
          editorEvents: playItem.editorEvents,
          executionType: playItem.executionType,
        }
      } else {
        play = { ...playItem }
        play.executionType = this.executionType
        play.gameId = this.gameId
        play.sponsor = playItem.sponsor
        ;(play.sponsorId =
          playItem.sponsor &&
          playItem.sponsor.sponsorItem &&
          playItem.sponsor.sponsorItem.brandId
            ? playItem.sponsor.sponsorItem.brandId
            : 0),
          (play.announcements = [
            { area: 'header', value: header },
            { area: 'middle', value: middle },
            { area: 'bottom', value: bottom },
          ])
      }
    } else {
      play = JSON.parse(JSON.stringify(playItem))

      delete play.index
      delete play.length

      play.gameId = this.gameId
      play.executionType = this.executionType

      play.participantId =
        play.team && play.team.publicId
          ? play.team.publicId
          : play.participantId
      delete play.team

      if (play.multiplierChoices.length > 0) {
        play.multiplierChoices[0].question = play.playTitle.value
        for (let i = 0; i < play.multiplierChoices.length; i++) {
          if (play.multiplierChoices[i].isBlank) {
            play.multiplierChoices[i].choices = play.choices
          }
        }
      }
      play.playTitle = play.playTitle.value
      play.presetId =
        play.preset && play.preset.preset ? play.preset.preset : play.presetId
      delete play.preset
      play.award =
        play.award && Object.keys(play.award).length > 0
          ? play.award.value
          : null
      play.sponsorId =
        play.sponsor &&
        play.sponsor.sponsorItem &&
        play.sponsor.sponsorItem.brandId
          ? play.sponsor.sponsorItem.brandId
          : 0
      delete play.sponsor
    }

    console.log('GO PLAY', play)
    agent.GameServer.goPlay(play)
  }

  resolvePlay(args) {
    agent.GameServer.resolvePlay(args)
  }

  endCurrentPlay(args) {
    agent.GameServer.endCurrentPlay(args)
  }

  resetDatabase() {
    agent.GameServer.resetDatabase(this.gameId)
    PrePlayStore.resetValues()
  }

  getGames(args) {
    return agent.GameServer.getGames(args)
  }

  resolvePrePick(args) {
    return agent.GameServer.resolvePrePick(args)
  }

  @observable
  announcementValueObservable = null
  @action
  setAnnouncementValueObservable(val) {
    this.announcementValueObservable = val
  }

  gameResume() {
    this.sessionPauseButtonAttributes()
    agent.GameServer.gameResume({
      gameId: this.gameId,
      lastSessionTime: this.lastSessionTime,
    })
    return Promise.resolve(true)
  }

  gameResumeRespond(next) {
    if (next) {
      this.progress = 'live'
      this.sessionPauseButtonAttributes()
    }
  }

  gamePause() {
    this.sessionResumeButtonAttributes()
    agent.GameServer.gamePause({ gameId: this.gameId })
  }

  gamePauseRespond(next) {
    if (next) {
      this.sessionResumeButtonAttributes()
    }
  }

  @computed
  get disableHeader() {
    return (
      this.dateEndSession ||
      this.progress === 'postgame' ||
      this.progress === 'end' ||
      (this.recordedPlays &&
        Array.isArray(this.recordedPlays) &&
        this.recordedPlays.length > 2 &&
        'recording' === this.executionType) ||
      PrePlayStore.sessionButtons['start'].text.includes('resume') ||
      this.isRecordEnded ||
      this.executionType === 'automation'
    )
  }

  isLeap = false
  @action
  setLeap(val) {
    this.isLeap = val
  }

  executionType = 'normal'
  @action
  setExecutionType(val) {
    this.executionType = val
  }

  isViewRecordedEvent = false
  @action
  setViewRecordedEvent(val) {
    this.isViewRecordedEvent = val
  }

  isRecordEnded = false
  @action
  setRecordEnded(val) {
    this.isRecordEnded = val
  }

  operator = null
  @action
  setOperator(val) {
    this.operator = val
  }

  headless = false
  @action
  setHeadless(val) {
    this.headless = val
  }

  @observable
  sessionMode = 0
  @action
  setSessionMode(val) {
    this.sessionMode = val
  }

  sportType = null
  @action
  setSportType(val) {
    this.sportType = val
  }

  subSportGenre = null
  @action
  setSubSportGenre(val) {
    this.subSportGenre = val
  }

  @action
  setSequences(val) {
    this.HCommLastHeaderSequence = val.headerPlaySequence
    this.HCommLastPlaySequence = val.playSequence
    this.lastSequence = val.sequence
  }

  @observable
  syncSessionStartInitResponded = null

  @observable
  syncSessionStartFinalResponded = null

  @observable
  syncSessionStartCancelResponded = null

  @observable
  syncSessionCreatePlayResponded = null
  @action
  setSyncSessionCreatePlayResponded(val) {
    this.syncSessionCreatePlayResponded = val
  }

  @observable
  syncCreateSessionResponded = null
  @action
  setSyncCreateSessionResponded(val) {
    this.syncCreateSessionResponded = val
  }

  @observable
  syncCreateInterruptionResponded = null
  @action
  setSyncCreateInterruptionResponded(val) {
    this.syncCreateInterruptionResponded = val
  }

  @observable
  syncHeaderTeamResponded = null
  @action
  setSyncHeaderTeamResponded(val) {
    this.syncHeaderTeamResponded = val
  }

  @observable
  syncInput = null

  @observable
  syncDD = null

  @observable
  syncCreatePlayStar = null
  @action
  setSyncCreatePlayStar(val) {
    this.syncCreatePlayStar = val
  }

  @action
  resetSyncCreatePlay() {
    this.syncSessionCreatePlayResponded = null
    this.syncCreateSessionResponded = null
    this.syncCreateInterruptionResponded = null
  }

  syncAssemblePlay(item) {
    agent.GameServer.syncAssemblePlay(item)
  }

  syncRequest(params) {
    params.gameId = this.gameId
    params.operator = this.operator
    agent.GameServer.syncRequest(params)
  }

  syncResponse(data) {
    if (!data) {
      return
    }
    console.log('SYNC RESPONSE', data)
    switch (data.processName) {
      case 'START_INIT':
        this.syncSessionStartInitResponded = data
        break
      case 'START_FINAL':
        this.syncSessionStartFinalResponded = data
        break
      case 'START_CANCEL':
        this.syncSessionStartCancelResponded = data
        break
      case 'CREATE_PLAY':
        this.syncSessionCreatePlayResponded = data
        break
      case 'CREATE_SESSION':
        this.syncCreateSessionResponded = data
        break
      case 'CREATE_INTERRUPTION':
        this.syncCreateInterruptionResponded = data
        break
      case 'ADD_PLAY':
        if (!data.isReuse) {
          PrePlayStore.setAddToStackItem(null)
          this.resetSyncCreatePlay()
        }
        break
      case 'HEADER_TEAM_CHANGE':
        this.syncHeaderTeamResponded = data
        break
      case 'INPUT_CHANGE':
        if (this.operator !== data.operator) {
          this.syncInput = data
        }
        break
      case 'DD_CHANGE':
        this.syncDD = data
        break
      case 'DD_CHANGE_STAR':
        this.syncCreatePlayStar = data
    }
  }

  @computed
  get isSessionStarted() {
    return (
      (this.executionType === 'recording' &&
        this.progress === 'live' &&
        !this.isViewRecordedEvent &&
        this.sessionMode === 1) ||
      (this.executionType !== 'recording' && this.progress === 'live')
    )
  }

  @computed
  get isLockedForAllExecutionType() {
    return 'recording,automation'.match(new RegExp(this.executionType, 'gi'))
      ? 'live' === this.progress
        ? !this.isSessionStarted
        : false
      : false
  }

  async getSelectedSponsor(_sponsorId) {
    const _sponsor = { sponsorCategory: null, sponsorItem: null }
    _sponsor.sponsorCategory = await PrePlayStore.sponsors.filter(cat => {
      return cat.brands.filter(brand => {
        return brand.brandId === _sponsorId
      })[0]
    })[0]
    _sponsor.sponsorItem =
      (await _sponsor.sponsorCategory) && _sponsor.sponsorCategory.brands
        ? _sponsor.sponsorCategory.brands.filter(
            o => o.brandId === _sponsorId
          )[0]
        : null

    return _sponsor
  }

  resetVars() {
    this.isLoading = false
    this.isError = false
    this.isAvailable = false
    this.gameId = null
    this.progress = 'active'
    this.dateEndSession = null
    this.progressStates = null
    this.participants = []
    this.preset = []
    this.baseOptions = []
    this.baseDefaults = []
    this.timePeriods = []
    this.interruptPlays = []
    this.venue = null
    this.prePicks = []
    this.recordedPlays = []
    this.lastSessionTime = 0
    this.videoPath = null
    this.isTimeStarted = false
    this.sponsorPackages = []
    this.sportTypes = []
    this.lastSequence = 0
    this.HCommLastHeaderSequence = 0
    this.HCommLastPlaySequence = 0
    this.HCommLastWait = 0
    this.automationRestartedServerCallback = false
    this.hasReset = false
    this.announcementValueObservable = null
    this.isLeap = false
    this.isViewRecordedEvent = false
    this.isRecordEnded = false
    this.sessionMode = 0

    // COMMENTED OUT FOR RESET RECORD GAME EVENT.
    // this.sportType = null
    // this.subSportGenre = null

    this.syncSessionStartInitResponded = null
    this.syncSessionStartFinalResponded = null
    this.syncSessionStartCancelResponded = null
  }
}

module.exports = new GameStore()
