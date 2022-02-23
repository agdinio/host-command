import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import CryptoJS from 'crypto-js'
import crypto from 'crypto'
import config from '@/Agent/config'
import 'url-search-params-polyfill'
import { vhToPx } from '@/utils'
import axios from 'axios'

@inject('NavigationStore', 'GameStore', 'AutomationStore')
@observer
export default class Main extends Component {
  // componentWillMount() {
  //   window.addEventListener('resize', () => {
  //     window.location.reload(true)
  //   })
  // }

  constructor(props) {
    super(props)
    extendObservable(this, {
      showModal: false,
    })

    this.gameId = null

    let queryString = new URLSearchParams(window.location.search)

    if (queryString.has('info')) {
      const ciphertext = queryString.get('info')
      const isHeadless = queryString.get('headless')
      if (ciphertext) {
        const key = crypto.createDecipher('aes-128-cbc', config.SALT)

        let data = key.update(ciphertext, 'hex', 'utf8')
        data += key.final('utf8')

        const info = JSON.parse(data)
        console.log('GAME ADMIN INFO ====>', info, ` HEADLESS: ${isHeadless}`)
        if (info.gameId) {
          this.gameId = info.gameId
          this.props.GameStore.setLeap(info.isLeap)
          this.props.GameStore.setExecutionType(info.executionType)
          this.props.GameStore.setViewRecordedEvent(info.isViewRecordedEvent)
          this.props.GameStore.setRecordEnded(info.isRecordEnded)
          this.props.GameStore.setOperator(info.username)

          if (navigator.webdriver || window.Cypress) {
            if ('automation' !== info.executionType) {
              this.showModal = true
              return
            }
          }

          this.props.GameStore.subscribeToGame({
            username: info.username,
            password: info.password,
            event: info.gameId,
            executionType: info.executionType,
            headless: isHeadless,
          })

          this.props.GameStore.setHeadless(isHeadless || false)
          this.props.GameStore.setSportType(info.sportType)
          this.props.GameStore.setSubSportGenre(info.subSportGenre)

          info.isHeadless =
            isHeadless && isHeadless.toLowerCase() === 'true' ? true : false
          this.props.GameStore.setInitialGameInfo(info)
          return
        }
      }
    }

    //this.props.NavigationStore.setCurrentView('/manual_game_selection')

    // if (queryString.has('gameId')) {
    //   if (queryString.get('gameId')) {
    //     this.props.GameStore.subscribeToGame({operator: 'aurelio', event: queryString.get('gameId')})
    //   } else {
    //     this.props.NavigationStore.setCurrentView('/manual_game_selection')
    //   }
    // } else {
    //   this.props.NavigationStore.setCurrentView('/manual_game_selection')
    // }
  }

  componentDidMount() {
    //this.props.GameStore.connectSC()
    //////this.props.AutomationStore.executeAutomation(this.gameId)
  }

  render() {
    const View = this.props.NavigationStore.currentView

    return (
      <MainFrame>
        <ContentWrapper>
          {this.showModal ? (
            <ModalWrapper>
              <Message>incorrect host command automation url.</Message>
            </ModalWrapper>
          ) : (
            <View />
          )}
        </ContentWrapper>
      </MainFrame>
    )
  }
}

const MainFrame = styled.div`
  // width: 100vw;
  // height: 100vh;
  // display: flex;

  width: 100%;
  height: 100%;
  display: flex;
`

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  // position: absolute;
  display: flex;
  flex-direction: column;
`

const ModalWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Message = styled.span`
  font-family: pamainbold;
  font-size: ${props => 4}vh;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: ${props => 0.3}vh;
`
