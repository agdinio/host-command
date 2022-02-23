import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { vhToPx } from '@/utils'
import DDGame from './DDGame'

@inject('NavigationStore', 'GameStore')
@observer
export default class ManualGameSelection extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      gameId: '',
      error: null,
      games: [],
    })

    this._isMounted = false

    this.destroyAvailable = intercept(
      this.props.GameStore,
      'isAvailable',
      change => {
        console.log('available:', change.newValue)
        if (change.newValue) {
          if (this._isMounted) {
            this.error = null
            this.props.NavigationStore.setCurrentView('/command')
          }
        } else {
          this.error = 'session unavailable'
        }

        if (this.refGameButton && this.refTextButton) {
          this.refGameButton.style.pointerEvents = 'auto'
          this.refTextButton.innerHTML = 'connect'
        }
        return change
      }
    )
  }

  handleGameChange(game) {
    if (game && game.gameId) {
      this.gameId = game.gameId
    }
  }

  handleButtonClick() {
    //this.props.setGameId(this.gameId)
    if (this.gameId) {
      if (this.refGameButton && this.refTextButton) {
        this.refGameButton.style.pointerEvents = 'none'
        this.refTextButton.innerHTML = 'connecting'
      }
      this.props.GameStore.subscribeToGame({
        operator: 'aurelio',
        event: this.gameId,
      })
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    this.destroyAvailable()
  }

  componentDidMount() {
    this._isMounted = true

    this.props.GameStore.getGames('').then(data => {
      for (let i = 0; i < data.data.data.readGames.length; i++) {
        const raw = data.data.data.readGames[i]
        delete Object.assign(raw, { ['state']: raw['stateName'] })['stateName']
      }

      this.games = data.data.data.readGames
    })
  }

  render() {
    return (
      <Container>
        <Wrapper>
          <Section marginTop="40" direction="column" justifyContent="center">
            <Row>
              {/*
              <DDGameContainer value={this.gameId} onChange={this.handleGameChange.bind(this)}>
                <option value="">SELECT A GAME SESSION</option>
                {
                  this.games.map(game => {
                    return <option key={game.gameId} value={game.gameId}>{game.gameId}</option>
                  })
                }
                <option key="xoxoxo" value="xoxoxo">xoxoxo</option>
              </DDGameContainer>
*/}

              <GamesWrapper>
                <DDGame
                  items={this.games}
                  value={this.handleGameChange.bind(this)}
                />
              </GamesWrapper>

              <GameButton
                innerRef={ref => (this.refGameButton = ref)}
                onClick={this.handleButtonClick.bind(this)}
              >
                <Text
                  font="pamainregular"
                  size={5 * 0.5}
                  color="#000000"
                  uppercase
                  innerRef={ref => (this.refTextButton = ref)}
                >
                  connect
                </Text>
              </GameButton>
            </Row>
            <Row marginTop="1">
              <Text font="pamainregular" size="3" color="#ff0000" uppercase>
                {this.error}
              </Text>
            </Row>
          </Section>
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #eaeaea;
  position: absolute;
`

const Wrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Section = styled.div`
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
`

const Text = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx(props.size || 3)};
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  ${props =>
    props.letterSpacing ? `letter-spacing:${vhToPx(props.letterSpacing)}` : ''};
`

const DDGameContainer = styled.select`
  width: ${props => vhToPx(40)};
  height: ${props => vhToPx(5)};
  /*
  border: none;
*/
  outline: none;
  font-family: pamainbold;
  font-size: ${props => vhToPx(5 * 0.5)};
  line-height: 1;
  text-transform: uppercase;
  padding-left: ${props => vhToPx(1)};
`

const GameButton = styled.div`
  width: ${props => vhToPx(20)};
  height: ${props => vhToPx(7)};
  background-color: #18c5ff;
  margin-left: ${props => vhToPx(2)};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${props => vhToPx(0.3)};
  cursor: pointer;
/*
  &:after {
    content: 'connect';
    font-family: pamainregular;
    font-size: ${props => vhToPx(5 * 0.5)};
    text-transform: uppercase;
    letters-spacing: ${props => vhToPx(0.1)};
    line-height: 1;
    height: ${props => vhToPx(5 * 0.5 * 0.8)};
  }
*/
`

const Row = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
`

const GamesWrapper = styled.div``
