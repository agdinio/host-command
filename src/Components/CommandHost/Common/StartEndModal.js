import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import CheckIcon from '@/assets/images/play-resolved.svg'

@observer
export default class StartEndModal extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      locked: false,
    })
  }

  handleConfirmClick(refId) {
    this.props.confirm(true, 'START')
    this.locked = true
    this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
  }

  handleEndConfirmationClick(args) {
    if ('executive' === args) {
      this[`confirm-executive`].style.backgroundColor = '#d3d3d3'
      this[`confirm-director`].style.backgroundColor = 'transparent'
      this[`confirm-executive`].style.color = '#c61818'
      this[`confirm-director`].style.color = '#d3d3d3'
      this[`check-executive`].style.visibility = 'visible'
      this[`check-director`].style.visibility = 'hidden'
    } else {
      this[`confirm-executive`].style.backgroundColor = 'transparent'
      this[`confirm-director`].style.backgroundColor = '#d3d3d3'
      this[`confirm-executive`].style.color = '#d3d3d3'
      this[`confirm-director`].style.color = '#c61818'
      this[`check-executive`].style.visibility = 'hidden'
      this[`check-director`].style.visibility = 'visible'
    }
  }

  handleQuickEndLiveGame(refId) {
    this.props.confirm(true, 'END')
    this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
  }

  handleCancelClick(refId) {
    this.props.confirm(false)
    if (refId) {
      this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
    }
  }

  render() {
    let { item, sessionMode } = this.props

    const vs = `${item.participants[0].name} vs ${item.participants[1].name}`
    const venue = `at ${item.venue.stadium || ''}`
    const gameId = item.gameId

    const automationButtonStartId = `startendmodal-button-start`
    const automationButtonEndId = `startendmodal-button-end`
    const automationButtonCancel = `startendmodal-button-cancel-${this.props.headerPlaySequence}`

    if ('START' === sessionMode) {
      return (
        <Container>
          <Wrapper>
            <Section justifyContent={'center'}>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                you are about to start and broadcast
              </Label>
            </Section>
            <Section justifyContent={'center'} marginTop={2}>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {vs}&nbsp;
              </Label>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {venue}&nbsp;(
              </Label>
              <Label
                font={'pamainbold'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {gameId}
              </Label>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                )
              </Label>
            </Section>
            <Section justifyContent={'center'} marginTop={4}>
              <ConfirmButton
                id={automationButtonStartId}
                locked={this.locked}
                onClick={
                  this.locked
                    ? null
                    : this.handleConfirmClick.bind(
                        this,
                        automationButtonStartId
                      )
                }
              />
            </Section>
            <Section justifyContent={'center'} marginTop={4}>
              <CancelButton
                id={automationButtonCancel}
                onClick={this.handleCancelClick.bind(
                  this,
                  automationButtonCancel
                )}
              />
            </Section>
          </Wrapper>
        </Container>
      )
    }

    if ('END' === sessionMode) {
      return (
        <Container>
          <Wrapper>
            <Section justifyContent={'center'}>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                you are about to end the live game
              </Label>
            </Section>
            <Section justifyContent={'center'} marginTop={2}>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {vs}&nbsp;
              </Label>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {venue}&nbsp;(
              </Label>
              <Label
                font={'pamainbold'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {gameId}
              </Label>
              <Label
                font={'pamainregular'}
                size={4.2}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                )
              </Label>
            </Section>

            <Section justifyContent={'center'} direction={'row'} marginTop={4}>
              <ConfirmIcon
                key={`check-executive`}
                innerRef={ref => (this[`check-executive`] = ref)}
              />
              <ConfirmationButton
                key={`confirm-executive`}
                text={'executive confirmation'}
                innerRef={ref => (this[`confirm-executive`] = ref)}
                onClick={this.handleEndConfirmationClick.bind(
                  this,
                  'executive'
                )}
              />
              <div style={{ width: '5vh' }} />
              <ConfirmationButton
                key={`confirm-director`}
                text={'director confirmation'}
                innerRef={ref => (this[`confirm-director`] = ref)}
                onClick={this.handleEndConfirmationClick.bind(this, 'director')}
              />
              <ConfirmIcon
                key={`check-director`}
                innerRef={ref => (this[`check-director`] = ref)}
              />
            </Section>

            <Section justifyContent={'center'} marginTop={4}>
              <ConfirmationButton
                id={automationButtonEndId}
                key={`confirm-test`}
                text={'quick end live game'}
                onClick={this.handleQuickEndLiveGame.bind(
                  this,
                  automationButtonEndId
                )}
              />
            </Section>

            <Section justifyContent={'center'} marginTop={4}>
              <CancelButton
                // id={automationButtonCancel}
                id="header-button-end-cancel"
                onClick={this.handleCancelClick.bind(this, null)}
              />
            </Section>
          </Wrapper>
        </Container>
      )
    }

    return null
  }
}

const Container = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.95);
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Section = styled.div`
  width: 100%;
  margin-top: ${props => props.marginTop || 0}vh;
  margin-bottom: ${props => props.marginBottom || 0}vh;
  display: flex;
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
`

const Label = styled.span`
  height: ${props => props.size * 0.8 || 3}vh;
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => props.size || 3}vh;
  color: ${props => props.color || '#ffffff'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => (props.nospacing ? 0 : 0.1)}vh;
  cursor: ${props => props.cursor || 'default'};
  margin-bottom: ${props => props.marginBottom || 0}%;
`

const ConfirmButton = styled.div`
  width: ${props => 15}vh;
  height: ${props => 5}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  background-color: #18c5ff;
  cursor: pointer;
  margin-right: ${props => props.marginRight || 0}vh;
  &:after {
    content: 'confirm start';
    font-family: pamainbold;
    font-size: ${props => 5 * 0.4}vh;
    text-transform: uppercase;
    line-height: 1;
    height: ${props => 5 * 0.4}vh;
  }
`

const CancelButton = styled.div`
  cursor: pointer;
  &:after {
    content: 'cancel';
    font-family: pamainbold;
    font-size: ${props => 2}vh;
    color: #a7a9ac;
    line-height: 1;
    letter-spacing: ${props => 0.1}vh;
    text-transform: uppercase;
  }
`

const ConfirmIcon = styled.div`
  width: ${props => 5}vh;
  height: ${props => 5}vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 ${props => 0.5}vh 0 ${props => 0.5}vh;
  visibility: hidden;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${CheckIcon});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
`

const ConfirmationButton = styled.div`
  width: ${props => 28}vh;
  height: ${props => 5}vh;
  border: ${props => `${0.2}vh solid #d3d3d3`};
  display: flex;
  justify-content: center;
  align-items: center;
  color: #d3d3d3;
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => 5 * 0.4}vh;
    text-transform: uppercase;
    line-height: 1;
    height: ${props => 5 * 0.4}vh;
  }
`
