import { observable, action, computed, reaction } from 'mobx'

class GameEventStore {
  @observable
  teamCounter = 0
  @action
  incrementTeamCounter(callback) {
    this.teamCounter = this.teamCounter + 1
    if (callback) {
      callback(this.teamCounter)
    }
  }
}

export default new GameEventStore()
