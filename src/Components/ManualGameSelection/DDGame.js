import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx } from '@/utils'
import GameItem from './GameItem'

@observer
export default class DDGame extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selectedGame: null,
    })
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[`game-option`]

      if (option) {
        let targetElement = evt.target // clicked element

        do {
          if (targetElement == option) {
            // This is a click inside. Do nothing, just return.
            return
          }
          // Go up the DOM
          targetElement = targetElement.parentNode
        } while (targetElement)

        // This is a click outside.
        if (option.classList.contains('open')) {
          option.className = option.className.replace(' open', '')
          option.style.visibility = 'hidden'
        }
        document.removeEventListener('click', func)
      }
    }

    if (mode === 0) {
      document.removeEventListener('click', func)
    } else {
      document.addEventListener('click', func)
    }
  }

  handleOptionClick() {
    const option = this[`game-option`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        option.style.visibility = 'hidden'
      } else {
        setTimeout(() => {
          this.initOptionEventListener(1)
          option.className += ' open'
          option.style.visibility = 'visible'
        }, 0)
      }
    }
  }

  handleOptionItemClick(selectedGame) {
    this.selectedGame = selectedGame

    const option = this[`game-option`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        option.style.visibility = 'hidden'
        option.style.zIndex = -1000
      }
    }

    if (this.props.playItemValue) {
      this.props.playItemValue(selectedGame)
    } else {
      if (this.props.value) {
        this.props.value(selectedGame)
      }
    }
  }

  render() {

    let { items } = this.props

    return (
      <Scrolling>
        <Button onClick={this.handleOptionClick.bind(this)}>
          {
            this.selectedGame ? (
              <GameItem key={this.selectedGame.gameId} item={this.selectedGame} />
            ) : (
              <NoGame>SELECT A GAME SESSION</NoGame>
            )
          }
        </Button>

        <Option>
          <OptionItems innerRef={ref => (this[`game-option`] = ref)}>
            <OptionItem>
              <NoGame border="0.1" onClick={this.handleOptionItemClick.bind(this, null)}>NONE</NoGame>
            </OptionItem>
            {
              (items || []).map(game => {
                return (
                  <OptionItem key={game.gameId} onClick={this.handleOptionItemClick.bind(this, game)}>
                    <GameItem item={game} />
                  </OptionItem>
                  )
              })
            }
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const h = 7

const Scrolling = styled.div`
  width: ${props => vhToPx(50)};
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`

const Button = styled.div`
  width: inherit;
  height: ${props => vhToPx(h)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Option = styled.div`
  width: inherit;
`

const OptionItems = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  visibility: hidden;
  position: absolute;
  z-index: 1000 !important;
`

const OptionItem = styled.div`
  width: auto;
  height: auto;
  min-height: ${props => vhToPx(h)};
  &:hover {
    opacity: 0.7;
  }
`

const NoGame = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: ${props => vhToPx(1.5)};
  border-top: ${props => `${vhToPx(props.border)} solid #cccccc`};
`
