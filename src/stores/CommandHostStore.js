import { observable, action, computed, reaction } from 'mobx'
import agent from '@/Agent'
import { guid } from '@/utils'

class CommandHostStore {
  @observable
  COMMAND_MODE = true

  @observable
  currentPlay = null

  @observable
  lockout = false
  @action
  setLockout(val) {
    this.lockout = val
  }

  @observable
  playCounter = 0
  @action
  incrementPlayCounter(callback) {
    this.playCounter = this.playCounter + 1
    callback(this.playCounter)
  }

  @observable
  activePlay = {
    id: 0,
    type: '',
    multiplier: 1,
    length: 0,
    withStar: false,
  }

  @observable
  screen = null
  @action
  setScreen(val) {
    this.screen = val
  }

  @observable
  preplayItems = []
  @action
  setPrePlayItems(val) {
    this.preplayItems = val
  }

  @observable
  preplayItem = null
  @action
  setPreplayItem(val) {
    this.preplayItem = val
  }

  announcement(val) {
    agent.GameServer.announcement(val)
  }

  fontSize = 1.8

  @observable
  reusePlay = null
  @action
  setReusePlay(val) {
    this.reusePlay = val
  }
}

export default new CommandHostStore()
