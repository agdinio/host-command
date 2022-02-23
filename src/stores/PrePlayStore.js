import { observable, action } from 'mobx'
import _ from 'lodash'
import GameStore from '@/stores/GameStore'
import agent from '@/Agent'
import { guid } from '@/utils'

class PrePlayStore {
  PlayColors = {
    LivePlay: '#c61818',
    GameMaster: '#19d1bf',
    Sponsor: '#495bdb',
    Prize: '#9368aa',
  }

  @observable
  isLoading = false
  @action
  setIsLoading(val) {
    this.isLoading = val
  }

  @observable
  teams = []
  @action
  setTeams(val) {
    this.teams = val
  }

  @observable
  preplayItems = []
  @action
  setPrePlayItems(val) {
    this.preplayItems = val
  }

  @observable
  nextPlayItem = null
  @action
  setNextPlayItem(val) {
    this.nextPlayItem = val
  }

  @observable
  currentPlayItem = null
  @action
  setCurrentPlayItem(val) {
    this.currentPlayItem = val
  }

  @observable
  unresolvedItems = []
  @action
  setUnresolvedItems(val) {
    this.unresolvedItems = val
  }

  @observable
  resolvedItems = []
  @action
  setResolvedItems(val) {
    this.resolvedItems = val
  }

  @observable
  tmpPreplayItem = null

  @observable
  multiplierChoices = []

  @observable
  groupPlays = []
  @action
  setGroupPlays(val) {
    this.groupPlays = val
  }

  @observable
  sessionButtons = {
    start: {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'start session',
      locked: true,
    },
    session: {
      text: '',
      locked: true,
    },
    interruption: {
      value: '',
      text: '',
      locked: false,
    },
    end: {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'end session',
      locked: true,
    },
  }

  @observable
  timePeriods = []
  @action
  setTimePeriods(val) {
    this.timePeriods = val
  }

  @observable
  interruptPlays = []
  @action
  setInterruptPlays(val) {
    this.interruptPlays = val
  }

  @observable
  sponsors = []

  @observable
  sponsorsxx = [
    {
      id: 1,
      name: 'platinum package',
      initial: 'p',
      initialColor: '#383644',
      backgroundColor: '#b2cbce',
      circleBorderColor: '#91a5c1',
      circleFill: '#a3c2cc',
      count: 10,
      length: 5,
      items: [
        { id: 11, name: 'sony', category: 'platinum' },
        { id: 12, name: 'panasonic', category: 'platinum' },
        { id: 13, name: 'heier', category: 'platinum' },
      ],
    },
    {
      id: 2,
      name: 'bronze package',
      initial: 'b',
      initialColor: '#3f2919',
      backgroundColor: '#e2a069',
      circleBorderColor: '#7c4724',
      circleFill: '#af643e',
      count: 2,
      length: 7,
      items: [
        { id: 21, name: 'volvo', category: 'bronze' },
        { id: 22, name: 'subaru', category: 'bronze' },
        { id: 23, name: 'toyota', category: 'bronze' },
        { id: 24, name: 'hyundai', category: 'bronze' },
      ],
    },
    {
      id: 3,
      name: 'silver package',
      initial: 's',
      initialColor: '#4c4c4c',
      backgroundColor: '#bababa',
      circleBorderColor: '#999999',
      circleFill: '#cecece',
      count: 5,
      length: 5,
      items: [
        { id: 31, name: 'iphone', category: 'silver' },
        { id: 32, name: 'samsung', category: 'silver' },
        { id: 33, name: 'motorola', category: 'silver' },
      ],
    },
    {
      id: 4,
      name: 'gold package',
      initial: 'g',
      initialColor: '#754b00',
      backgroundColor: '#ffde9c',
      circleBorderColor: '#f4a300',
      circleFill: '#ffda3e',
      count: 4,
      length: 5,
      items: [
        { id: 41, name: 'daikin', category: 'gold' },
        { id: 42, name: 'kolin', category: 'gold' },
        { id: 43, name: 'carrier', category: 'gold' },
      ],
    },
  ]

  TypeButtons = [
    {
      type: 'LivePlay',
      width: 10,
      text: 'live',
      color: '#c61818',
      id: 'header-button-liveplay',
    },
    {
      type: 'GameMaster',
      width: 18,
      text: 'gamemaster',
      color: '#19d1bf',
      id: 'header-button-gamemaster',
    },
    {
      type: 'Sponsor',
      width: 18,
      text: 'sponsor',
      color: '#495bdb',
      id: 'header-button-sponsor',
    },
    {
      type: 'Prize',
      width: 18,
      text: 'prize',
      color: '#9368aa',
      id: 'header-button-prize',
    },
    {
      type: 'Announce',
      width: 18,
      text: 'announce',
      color: '#000000',
      id: 'header-button-announce',
    },
  ]

  AwardList = {
    LivePlay: {
      backgroundColor: '#c61818',
      awards: [
        {
          id: 1,
          value: 'spot fee',
          bg: '#c61818',
          c: 'white',
          init: true,
          isLocked: true,
        },
      ],
      lockIcon: 'icon-lock-white.svg',
    },
    GameMaster: {
      backgroundColor: '#19d1bf',
      awards: [
        { id: 1, value: 'spot fee', bg: '#19d1bf', c: 'white', init: true },
        { id: 2, value: 'tokens', bg: '#ffb600', c: 'black' },
        { id: 3, value: 'points', bg: '#ffb600', c: 'black' },
        { id: 4, value: 'tokens, points', bg: '#ffb600', c: 'black' },
        { id: 5, value: 'use sponsor', bg: '#495bdb', c: 'white' },
      ],
    },
    Sponsor: {
      backgroundColor: '#495bdb',
      awards: [
        {
          id: 1,
          value: 'tokens',
          bg: '#ffb600',
          c: 'black',
          awardValues: { tokens: 50, points: 0 },
        },
        {
          id: 2,
          value: 'points',
          bg: '#ffb600',
          c: 'black',
          awardValues: { tokens: 0, points: 5000 },
        },
        {
          id: 3,
          value: 'tokens, points',
          bg: '#ffb600',
          c: 'black',
          init: true,
          awardValues: { tokens: 50, points: 5000 },
        },
        {
          id: 4,
          value: 'use sponsor',
          bg: '#495bdb',
          c: 'white',
          awardValues: { tokens: 50, points: 5000 },
        },
      ],
    },
    Prize: {
      backgroundColor: '#9368aa',
      awards: [
        {
          id: 1,
          value: 'star',
          bg: '#efdf17',
          c: 'black',
          init: true,
          isLocked: true,
        },
      ],
      lockIcon: 'icon-lock-black.svg',
    },
  }

  /*
  @action
  resetTmpPreplayItem() {
    if (this.tmpPreplayItem && this.tmpPreplayItem.choices) {
      this.tmpPreplayItem.choices = []
    }
  }
  @action
  setTmpPreplayItemChoice(val) {
    if (this.tmpPreplayItem && this.tmpPreplayItem.choices) {
      this.tmpPreplayItem.choices.push(val)
    }
  }

*/

  @action
  setTmpPreplayItem(val) {
    this.tmpPreplayItem = val
  }

  @observable
  presetItems = []
  //FROM DEMO presetItems = presetScript
  @action
  setPresetItems(val) {
    this.presetItems = val
  }
  @action
  resetPresetItems() {
    this.presetItems = []
  }

  @observable
  addToStackItem = null
  @action
  setAddToStackItem(val) {
    this.addToStackItem = val
  }

  @observable
  selectedTeam = null
  @action
  setSelectedTeam(val) {
    this.selectedTeam = val

    const stackToUpdate = { gameId: GameStore.gameId, plays: [] }

    if (this.preplayItems && this.preplayItems.length > 0) {
      for (let i = 0; i < this.preplayItems.length; i++) {
        stackToUpdate.plays.push({
          gameId: this.preplayItems[i].gameId,
          id: this.preplayItems[i].id,
          participantId: val.publicId,
        })
      }
    }

    if (this.nextPlayItem) {
      stackToUpdate.plays.push({
        gameId: this.nextPlayItem.gameId,
        id: this.nextPlayItem.id,
        participantId: val.publicId,
      })
    }

    // if (stackToUpdate && stackToUpdate.plays && stackToUpdate.plays.length > 0) {
    //   agent.GameServer.updateParticipantForStack(stackToUpdate)
    // }
  }

  @observable
  selectedSponsor = null
  @action
  setSelectedSponsor(val) {
    this.selectedSponsor = val
  }

  @observable
  isAddingStack = false
  @action
  setIsAddingStack(val) {
    this.isAddingStack = val
  }

  getPresetItemById(id) {
    return this.presetItems.filter(o => o.id === id)[0]
  }

  getPresetItemsByType(type) {
    return this.presetItems.filter(o => o.type.match(type) && !o.isMultiplier)
  }

  pullMultiplierChoices(id) {
    this.multiplierChoices = []
    return new Promise(resolve => {
      this.setMultiplierChoicesById(id)
      resolve(this.multiplierChoices)
    })
  }

  setMultiplierChoicesById(id) {
    let parent = this.presetItems.filter(o => o.id === id)[0]
    if (parent) {
      parent.locked = false
      const exists = this.multiplierChoices.filter(o => o.id === parent.id)[0]
      //if (!exists) {
      this.multiplierChoices.push(parent)
      //}
      if (parent.choices && parent.choices.length >= 2) {
        for (let i = 0; i < parent.choices.length; i++) {
          let nextId = parent.choices[i].nextId
          if (nextId > 0) {
            this.setMultiplierChoicesByNextId(nextId)
          }
        }
      }
    }
  }

  setMultiplierChoicesByNextId(nextId) {
    let item = this.presetItems.filter(o => o.id === nextId)[0]
    if (item) {
      this.setMultiplierChoicesById(item.id)
    }
  }

  levels = []

  getStarMax(presets) {
    this.levels = []
    let max = 1
    return new Promise(resolve => {
      const major = presets[0]
      this.levels.push(max)
      major.choices.forEach(a => {
        if (a.nextId) {
          this.levels.push(max + 1)
          this.deepStarMax(presets, a, max + 1)
        }
      })

      const returnValue = _.max(this.levels)
      resolve(returnValue)
    })
  }

  deepStarMax(presets, pre, max) {
    const b = presets.filter(o => o.id === pre.nextId)[0]
    if (b) {
      b.choices.forEach(c => {
        if (c.nextId) {
          this.levels.push(max + 1)
          this.deepStarMax(presets, c, max + 1)
        }
      })
    }
  }

  prePicks = []
  setPrePicks(val) {
    this.prePicks = val
  }

  @action
  resetValues() {
    this.isLoading = false
    this.teams = []
    this.preplayItems = []
    this.nextPlayItem = null
    this.currentPlayItem = null
    this.unresolvedItems = []
    this.resolvedItems = []
    this.tmpPreplayItem = null
    this.multiplierChoices = []
    this.groupPlays = []
    this.sessionButtons = {
      start: {
        backgroundColor: '#18c5ff',
        color: '#000000',
        text: 'start session',
        locked: true,
      },
      session: {
        text: '',
        locked: true,
      },
      interruption: {
        value: '',
        text: '',
        locked: false,
      },
      end: {
        backgroundColor: '#18c5ff',
        color: '#000000',
        text: 'end session',
        locked: true,
      },
    }
    this.timePeriods = []
    this.interruptPlays = []
    this.presetItems = []
    this.addToStackItem = null
    this.selectedTeam = null
    this.selectedSponsor = null
    this.isAddingStack = false
    this.levels = []
    this.prePicks = []
  }

  async setUpdatedPlay(val) {
    const idx = await this.preplayItems.findIndex(o => o.id === val.id)
    if (idx > -1) {
      this.preplayItems[idx] = val
    } else {
      if (this.nextPlayItem.id === val.id) {
        this.nextPlayItem = await null
        this.nextPlayItem = val
      }
    }
  }
}

export default new PrePlayStore()
