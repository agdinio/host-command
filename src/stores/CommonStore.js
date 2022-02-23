import { observable, action, reaction } from 'mobx'
import agent from '@/Agent'

class CommonStore {
  @observable
  appName = 'Conduit'
  @observable
  token = window.localStorage.getItem('jwt')
  @observable
  appLoaded = false

  @observable
  tags = []
  @observable
  isLoadingTags = false

  @observable
  location = ''
  @observable
  locationHistory = []
  @observable
  isLoading = false
  @observable
  leaderboard = []
  @observable
  keySharedCredits = {}

  @observable
  replayed = false
  @action
  setReplayed(val) {
    this.replayed = val
  }

  getAppVersion() {
    return 'Ambassador Demo 1.0v'
  }
  constructor() {
    reaction(
      () => this.token,
      token => {
        if (token) {
          window.localStorage.setItem('jwt', token)
        } else {
          window.localStorage.removeItem('jwt')
        }
      }
    )
  }

  @action
  setToken(token) {
    this.token = token
  }

  @action
  clearToken() {
    this.token = undefined
    window.localStorage.removeItem('jwt')
  }

  @action
  setAppLoaded() {
    this.appLoaded = true
  }

  @action
  setLocation(location) {
    this.location = location
  }

  @action
  getLeaderboard() {
    this.isLoading = true
    return agent.Server.getLeaderboard()
      .then(data => {
        this.leaderboard = data
      })
      .finally(_ => {
        this.isLoading = false
      })
  }

  @action
  getKeySharedCredits() {
    this.isLoading = true
    return agent.Server.getKeySharedCredits()
      .then(data => {
        this.keySharedCredits = data
      })
      .catch(err => {
        console.log(err.message)
      })
      .finally(_ => {
        this.isLoading = false
      })
  }
}

export default new CommonStore()
