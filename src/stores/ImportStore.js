import { observable, action, computed } from 'mobx'
import agent from '@/Agent'
import dateFormat from 'dateformat'
import GameStore from '@/stores/GameStore'

class ImportStore {
  gameStatus = {
    active: {
      bg: '#ffffff',
      text: 'active',
      color: '#000000',
      invertedColor: '#ffffff',
      prePicksEditable: true,
      slidingButton: { text: 'details', color: '#000000', bg: '#E5E5E5' },
    },
    public: {
      bg: '#e6e7e8',
      text: 'public',
      color: '#000000',
      invertedColor: '#ffffff',
      prePicksEditable: true,
      slidingButton: { text: 'edit prepicks', color: '#ffffff', bg: '#22ba2c' },
    },
    pregame: {
      bg: '#22ba2c',
      text: 'PRE-GAME',
      color: '#ffffff',
      invertedColor: '#22ba2c',
      prePicksEditable: false,
      slidingButton: { text: 'access h-comm', color: '#ffffff', bg: '#18c5ff' },
    },
    pending: {
      bg: '#efdf17',
      text: 'PENDING',
      color: '#000000',
      invertedColor: '#efdf17',
      prePicksEditable: false,
      slidingButton: { text: 'access h-comm', color: '#ffffff', bg: '#18c5ff' },
    },
    live: {
      bg: '#c61818',
      text: 'LIVE',
      color: '#ffffff',
      invertedColor: '#c61818',
      prePicksEditable: false,
      slidingButton: { text: 'join h-comm', color: '#ffffff', bg: '#c61818' },
    },
    postgame: {
      bg: '#4d92ad',
      text: 'POST-GAME',
      color: '#ffffff',
      invertedColor: '#ffffff',
      prePicksEditable: false,
      slidingButton: { text: 'access stats', color: '#ffffff', bg: '#808285' },
    },
    end: {
      bg: '#3d3d3d',
      text: 'END',
      color: '#ffffff',
      invertedColor: '#ffffff',
      prePicksEditable: false,
      slidingButton: { text: 'access stats', color: '#ffffff', bg: '#808285' },
    },
  }

  @action
  getEventsBySportType(option) {
    return agent.GameServer.readGameEvents(option)
      .then(async data => {
        console.log('RAW...', JSON.parse(JSON.stringify(data)))

        let parsedEvents = []
        for (let i = 0; i < data.length; i++) {
          const _event = data[i]

          const _sportType = await GameStore.sportTypes.filter(
            o => o.code === _event.sportType
          )[0]
          const _subSportGenre = await _sportType.subSportGenres.filter(
            o => o.code === _event.subSportGenre
          )[0]

          const _latlong = _event.latlong.split(',')
          _event.venue = {
            countryCode: _event.countryCode,
            state: { code: _event.stateCode, name: _event.stateName },
            city: {
              name: _event.city,
              lat: _latlong.length > 1 ? _latlong[0] : '',
              long: _latlong.length > 1 ? _latlong[1] : '',
            },
            latitude: '',
            longitude: '',
            stadiumName: _event.stadium,
          }

          _event.dateAnnounce = dateFormat(
            _event.dateAnnounce,
            'yyyy-mm-dd 00:00:00'
          )
          _event.datePrePicks = dateFormat(
            _event.datePrePicks,
            'yyyy-mm-dd 00:00:00'
          )
          _event.dateStart = dateFormat(_event.dateStart, 'yyyy-mm-dd')
          _event.timeStart = _event.formattedTimeStart

          delete _event.city
          delete _event.countryCode
          delete _event.latlong
          delete _event.stateCode
          delete _event.stateName

          let item = await parsedEvents.filter(
            o =>
              o.subSportGenreCode === _event.subSportGenre &&
              o.keySportType.code === _event.sportType
          )[0]
          if (item) {
            item.events.push(_event)
          } else {
            item = {
              subSportGenreCode: _subSportGenre.code,
              keyEventType: _subSportGenre.name,
              keySportType: _sportType,
              events: [],
            }
            item.events.push(_event)
            parsedEvents.push(item)
          }
        }

        console.log('PARSED...', parsedEvents)

        return Promise.resolve(parsedEvents)
      })
      .catch(err => {
        console.log('err', err)
        //CommonStore.setErrorResponse(err.response)
      })
  }

  @action
  getImportFilterArgs(args) {
    return agent.GameServer.readImportFilterArgs(args)
  }

  @action
  getGamePlaysByGameId(args) {
    return agent.GameServer.getGamePlaysByGameId(args)
  }

  @action
  importPlaystack(args) {
    return agent.GameServer.importPlaystack(args)
  }

  @observable
  selectedGameId = null
  @action
  setSelectedGameId(val) {
    this.selectedGameId = val
  }
}

module.exports = new ImportStore()
