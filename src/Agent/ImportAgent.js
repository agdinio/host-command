import axios from 'axios'
import config from '@/Agent/config'

const URL = `${config.PROTOCOL}://${config.URL}:${config.PORT}`

const readGameEvents = args => {
  return axios({
    method: 'GET',
    url: `${URL}/game/read_game_events_for_import`,
    params: args,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

module.exports = {
  readGameEvents,
}
