import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled, { keyframes } from 'styled-components'
import { vhToPx } from '@/utils'
import { PACircle } from '@/Components/PACircle'
import GameItem from './GameItem'
let scale_size = 1

const SportIcons = {
  football: 'icon-football-white.svg',
  basketball: 'icon-basketball-white.svg',
  golf: 'icon-golf-white.svg',
}

@inject('NavigationStore', 'GameEventStore')
@observer
export default class GameEventItem extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      gameItems: null,
    })
    this._isMounted = false
    this.cnt = 100
    this.reference = `${this.props.eventItem.keyEventType}-${this.props.eventItem.keySportType.name}`
    scale_size = this.props.scaleSize || 1
  }

  handleDetailsClick(item) {
    this.props.GameEventStore.values.gameId = item.gameId
    this.props.NavigationStore.setCurrentView('/gamedetail')
  }

  async handleAccessHComm(item) {
    this.props.GameEventStore.accessHComm(item)
    /*
    const info = {
      gameId: item.gameId,
      username: 'ab@local.com',
      password: 'SportocoToday.v1',
      isLeap: item.isLeap,
      executionType: !item.leapType ? 'normal' : item.leapType === 'recording' ? (item.dateEndSession && new Date() > new Date(item.dateEndSession)) ? 'automation' : 'recording' : 'normal'
    }

    const key = crypto.createCipher('aes-128-cbc', config.SALT)

    let ciphertext = key.update(JSON.stringify(info), 'utf8', 'hex')
    ciphertext += key.final('hex')

    const url = `${config.PROTOCOL}://${config.HOST_COMMAND_URL}:${config.HOST_COMMAND_PORT}/?info=${ciphertext}`
    window.open(url, '_blank')

    // if (info.executionType === 'automation') {
    //   const t_url = `${config.PROTOCOL}://${config.AUTOMATION_URL}:${config.AUTOMATION_PORT}${config.AUTOMATION_AGENT}&gameId=${item.gameId}&url=${url}`
    //   const testingPageWindow = window.open(t_url, '_blank')
    //   setTimeout(() => testingPageWindow.close(),10000)
    // } else {
    //   window.open(url, '_blank')
    // }
*/
  }

  handleViewRecordedEvent(item) {
    this.props.GameEventStore.viewRecordedEvent(item)
  }

  handleDeleteClick(item) {
    this.props.GameEventStore.deleteGame(item.gameId).then(async data => {
      if (data.data) {
        const idx = this.gameItems.findIndex(o => o.gameId === item.gameId)
        if (idx > -1) {
          await this.gameItems.splice(idx, 1)
          if (!this.gameItems || this.gameItems.length < 1) {
            this.props.updateGameEventItem({
              sportType: item.sportType,
              subSportGenre: item.subSportGenre,
            })
          }
        }
      }
    })
  }

  handleCreateGameClick(eventItem) {
    const sportType = this.props.GameEventStore.sportTypes.filter(
      o => o.code === eventItem.keySportType.code
    )[0]
    const subSportGenre = sportType.eventTypes.filter(
      o => o.code === eventItem.subSportGenreCode
    )[0]

    if (
      this.props.GameEventStore.values &&
      this.props.GameEventStore.values.autofillGameId &&
      sportType &&
      Object.keys(sportType).length > 0 &&
      subSportGenre &&
      Object.keys(subSportGenre).length > 0
    ) {
      this.props.GameEventStore.values.autofillGameId.sportType = sportType.code
      this.props.GameEventStore.values.autofillGameId.eventType =
        subSportGenre.code
      this.props.GameEventStore.values.sportType = sportType
      this.props.GameEventStore.values.subSportGenre = subSportGenre

      this.props.NavigationStore.setCurrentView('/gamedetail')
    }

    // const newGame = {sportEventId: eventId, name: this.cnt++, backgroundColor: '#E6E7E8', stage: 'reserve'}
    // GameList.push(newGame)
    // this.gameItems.push(newGame)
  }

  componentDidUpdate() {
    const elBoxScrolling = this[`boxscrolling-${this.reference}`]
    const elBox = this[`box-${this.props.eventItem.keySportType.code}`]

    if (elBoxScrolling && elBox) {
      if (elBox.offsetHeight > elBoxScrolling.offsetHeight) {
        elBoxScrolling.style.overflowY = 'scroll'
        elBoxScrolling.scrollTop = elBoxScrolling.scrollHeight
      } else {
        elBoxScrolling.style.overflowY = 'hidden'
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  componentDidMount() {
    this._isMounted = true
    if (this._isMounted) {
      this.gameItems = this.props.eventItem.events
    }
  }

  render() {
    let { eventItem } = this.props
    let { gameItems } = this
    let sportIcon = null

    try {
      //sportIcon = require(`@/assets/images/${SportIcons[eventItem.keySportType.name]}`)
      sportIcon = require(`@/assets/images/${eventItem.keySportType.icon[1]}`)
    } catch (err) {
      sportIcon = ''
    }

    if (!gameItems || (gameItems && gameItems.length < 1)) {
      return (
        <Container>
          <Wrapper>
            <Header withBorder={this.props.forImport}>
              <PACircle size={4} />
            </Header>
          </Wrapper>
        </Container>
      )
    }

    return (
      <Container>
        <Wrapper>
          <Header withBorder={this.props.forImport}>
            <Text
              font={'pamainbold'}
              color={'#fff'}
              size={6 * 0.5 * scale_size}
              uppercase
            >
              {eventItem.keyEventType}&nbsp;
            </Text>
            <SportImage src={sportIcon} />
            <Text
              font={'pamainbold'}
              color={'#fff'}
              size={6 * 0.35 * scale_size}
              uppercase
            >
              &nbsp;{eventItem.keySportType.name}
            </Text>
          </Header>
          <FadeIn>
            <BoxScrolling
              innerRef={ref => (this[`boxscrolling-${this.reference}`] = ref)}
            >
              <Box
                innerRef={ref =>
                  (this[`box-${eventItem.keySportType.code}`] = ref)
                }
              >
                {gameItems.map(item => {
                  return (
                    <GameItem
                      key={`gameitem-${this.reference}-${item.gameId}`}
                      item={item}
                      detailsClick={this.handleDetailsClick.bind(this, item)}
                      accessHComm={gameId =>
                        this.handleAccessHComm.bind(this, item)
                      }
                      deleteClick={this.handleDeleteClick.bind(this, item)}
                      viewRecordedEvent={() =>
                        this.handleViewRecordedEvent.bind(this, item)
                      }
                      selectedGameEvent={this.props.selectedGameEvent}
                      scaleSize={this.props.scaleSize}
                      forImport={this.props.forImport}
                    />
                  )
                })}
                {this.props.forImport ? null : (
                  <CreateGameButton
                    onClick={this.handleCreateGameClick.bind(this, eventItem)}
                  >
                    create game +
                  </CreateGameButton>
                )}
              </Box>
            </BoxScrolling>
          </FadeIn>
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: ${props => 83 * scale_size}vh;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f2f2f2;
`

const FadeIn = styled.div`
  width: 100%;
  height: 100%;
  animation: ${props => fadein} 0.4s forwards;
  opacity: 0;
`

const fadein = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1;}
`

const Header = styled.div`
  width: 100%;
  height: ${props => 6 * scale_size}vh;
  background-color: #000000;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  padding-left: 4%;
  ${props =>
    props.withBorder
      ? `
        border-left: ${0.1}vh solid gray;
        border-top: ${0.1}vh solid gray;
        border-right: ${0.1}vh solid gray;
      `
      : null}
`

const Text = styled.div`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => props.size || 3}vh;
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 0.9};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => 0.1}vh;
  height: ${props => props.size * 0.8}vh;
`

const BoxScrolling = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;

  -ms-overflow-style: -ms-autohiding-scrollbar;
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 1vh rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar {
    width: ${props => 1}vh;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 1vh rgba(0, 0, 0, 0.3);
    background-color: rgba(85, 85, 85, 0.5);
    &:hover {
      background-color: #555;
    }
  }
`

const Box = styled.div`
  width: 100%;
  position: absolute;
  flex-direction: column;
  display: flex;
`

const CreateGameButton = styled.div`
  width: 100%;
  height: ${props => 8}vh;
  background-color: #f2f2f2;
  margin-bottom: 0.3%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => 8 * 0.4}vh;
  color: #cccccc;
  text-transform: uppercase;
  cursor: pointer;
  border-bottom-width: ${props => 0.1}vh;
  border-bottom-color: #ffffff;
  border-bottom-style: solid;
`

const SportImage = styled.img`
  height: ${props => 70 * scale_size}%;
`
