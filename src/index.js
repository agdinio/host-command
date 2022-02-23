import React from 'react'
import ReactDOM from 'react-dom'
import promiseFinally from 'promise.prototype.finally'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import App from '@/Containers/App'
import AuthStore from '@/stores/AuthStore'
import CommonStore from '@/stores/CommonStore'
import NavigationStore from '@/stores/NavigationStore'
import PrizeChestStore from '@/stores/PrizeChestStore'
import CommandHostStore from '@/stores/CommandHostStore'
import PrePlayStore from '@/stores/PrePlayStore'
import GameEventStore from '@/stores/GameEventStore'
import PlayStore from '@/stores/PlayStore'
import GameStore from '@/stores/GameStore'
import AutomationStore from '@/stores/AutomationStore'
import ImportStore from '@/stores/ImportStore'
import '@/styles/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'

const stores = {
  AuthStore,
  CommonStore,
  NavigationStore,
  PrizeChestStore,
  CommandHostStore,
  PrePlayStore,
  GameEventStore,
  PlayStore,
  GameStore,
  AutomationStore,
  ImportStore,
}

// needed for PWA
//import registerServiceWorker from "./registerServiceWorker";

// debugging
window._____APP_STATE_____ = stores

promiseFinally.shim()

ReactDOM.render(
  <Provider {...stores}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
