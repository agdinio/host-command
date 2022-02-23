import { observable, action, computed } from 'mobx'
import CryptoJS from 'crypto-js'
import createHistory from 'history/createBrowserHistory'
import CommandHostStore from '@/stores/CommandHostStore'
import CommandHost from '@/Components/CommandHost'
import ErrorPrompt from '@/Components/CommandHost/ErrorPrompt'
import GameEvent from '@/Components/GameEvent'
import Login from '@/Components/Auth/Login'
import ManualGameSelection from '@/Components/ManualGameSelection'

class NavigationStore {
  @observable
  isFromMenu
  @observable
  history = createHistory()
  @observable
  location = sessionStorage.getItem('currentLocation')
    ? CryptoJS.AES.decrypt(
        sessionStorage.getItem('currentLocation').toString(),
        'NavigationStore'
      ).toString(CryptoJS.enc.Utf8)
    : 'init'
  listen = this.history.listen(location => {
    if (location && location.state && location.state.path !== this.location) {
      this.setCurrentView(location.state.path)
      /*
       * commented out. it causes iphone chrome crash
       */
      //this.history.goBack()
    }
  })

  authRoutes = [
    '/livegame',
    '/prepick',
    '/socialranking',
    '/prizeboard',
    '/outro',
    '/prizechest',
    '/keyreview',
    '/profile',
    '/sharestatus',
    '/wallet',
    '/resolve',
    '/starprize',
    '/globalranking',
    '/leaderboard',
  ]
  freeRoutes = ['/login', '/register', '/signup', '/keycode', '/prebegin']

  @computed
  get currentView() {
    switch (this.location.toLocaleLowerCase()) {
      case '/command':
        return CommandHost
      case '/manual_game_selection':
        return ManualGameSelection
      case '/error':
        return ErrorPrompt
      default:
        return CommandHost
    }
  }

  @computed
  get currentViewWhileOnGameState() {
    switch (
      this.locationWhileOnGameState &&
      this.locationWhileOnGameState.toLocaleLowerCase()
    ) {
      case '/leaderboardxxxxxxxxxxx':
        return null
      default:
        return null
    }
  }

  @computed
  get showHeader() {
    const screens = [
      'init',
      'init2',
      '/login',
      '/register',
      '/signup',
      '/keycode',
      '/prebegin',
      '/invitation',
    ]
    return screens.indexOf(this.location.toLocaleLowerCase()) === -1
  }

  /*
  @action
  setCurrentView(name, isFromMenu = false) {
    if (name.toString().trim() !== this.location.toString().trim()) {
      if (name === '/prepick' || this.location === '/prepick' || name === '/livegame' || this.location === '/livegame') {
        this.setBackScreen(this.location)
      }
    }

    this.isFromMenu = isFromMenu
    this.location = name
    this.history.push('', { path: name.toLocaleLowerCase() })
    sessionStorage.setItem(
      'currentLocation',
      CryptoJS.AES.encrypt(name.toLocaleLowerCase(), 'NavigationStore')
    )
  }
*/

  @action
  setCurrentView(name, isFromMenu = false) {
    this.isFromMenu = isFromMenu
    this.location = name
    this.history.push('', { path: name.toLocaleLowerCase() })
    sessionStorage.setItem(
      'currentLocation',
      CryptoJS.AES.encrypt(name.toLocaleLowerCase(), 'NavigationStore')
    )
  }

  checkCommandMode() {
    if (CommandHostStore.COMMAND_MODE) {
      let name = '/livegame-xxxxx'
      this.pushReturnLocation(name)
      this.location = name
      this.history.push('', { path: name.toLocaleLowerCase() })
      sessionStorage.setItem(
        'currentLocation',
        CryptoJS.AES.encrypt(name.toLocaleLowerCase(), 'NavigationStore')
      )

      /*
            let currLoc = this.bypassActiveMenu.filter(
              o => o.route === this.location
            )[0]

            if (currLoc && !currLoc.through) {
              this.locationWhileOnGameState = name
              return
            }
      */
    }
  }

  @observable
  isShareKeyScreen = false
  @action
  setIsShareKeyScreen(val) {
    this.isShareKeyScreen = val
  }

  @observable
  backScreen = ''
  @action
  setBackScreen(val) {
    this.backScreen = val
  }

  @observable
  locationWhileOnGameState = null
  @action
  setLocationWhileOnGameState(val) {
    this.locationWhileOnGameState = val
  }

  @observable
  activeMenu = null
  @action
  setActiveMenu(val) {
    this.activeMenu = val
  }

  @observable
  returnLocations = []

  @computed
  get returnLocation() {
    return this.returnLocations.filter(o => o.curr === this.activeMenu)[0]
  }

  @action
  pushReturnLocation(name) {
    let elemToRemove = this.returnLocations.filter(o => o.curr === name)[0]
    if (elemToRemove) {
      let idx = this.returnLocations.indexOf(elemToRemove)
      if (idx !== -1) {
        this.returnLocations.splice(idx, 1)
        let exists = this.returnLocations.filter(o => o.curr === name)[0]
        if (!exists) {
          this.returnLocations.push({ prev: this.location, curr: name })
        }
      } else {
        let exists = this.returnLocations.filter(o => o.curr === name)[0]
        if (!exists) {
          this.returnLocations.push({ prev: this.location, curr: name })
        }
      }
    } else {
      let exists = this.returnLocations.filter(o => o.curr === name)[0]
      if (!exists) {
        this.returnLocations.push({ prev: this.location, curr: name })
      }
    }
  }

  @observable
  bypassActiveMenu = [
    {
      route: '/prepick',
      backButtonText: 'PRE PICKS',
      backButtonColor: '#22ba2c',
      through: false,
    },
    {
      route: '/livegame',
      backButtonText: 'LIVE PLAY',
      backButtonColor: '#c61818',
      through: false,
    },
    {
      route: '/starprize',
      backButtonText: 'STAR',
      backButtonTextColor: '#000000',
      backButtonColor: '#eedf17',
      through: false,
    },
    {
      route: '/resolve',
      backButtonText: 'RESOLVE',
      backButtonColor: '#22ba2c',
      through: false,
    },
  ]

  @action
  resetBypassActiveMenu() {
    for (let i = 0; i < this.bypassActiveMenu.length; i++) {
      let elem = this.bypassActiveMenu[i]
      elem.through = false
    }
  }

  @action
  setSessionLogin(email, password) {
    sessionStorage.setItem('login', { email: email, password: password })
  }
}

export default new NavigationStore()
