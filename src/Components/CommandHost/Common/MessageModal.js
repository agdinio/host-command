import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'

export default class MessageModal extends Component {
  handleExitMessageClick(refId) {
    this.props.close()
    this.props.automationAddEvent({
      evt: 'click',
      refId: refId,
      wait: 0.5,
      isIncrementHeaderPlaySequence: true,
    })
  }

  render() {
    const automationExitButtonId = `message-modal-button-exit-${this.props.headerPlaySequence}`

    return (
      <Container>
        <Wrapper>
          <Section justifyContent="center">
            <Label font="pamainregular" size="4" color={'#ffffff'} uppercase>
              session cannot be ended. please end current play first.
            </Label>
          </Section>
          <Section justifyContent="center" marginTop="3">
            <ConfirmationButton
              id={automationExitButtonId}
              key={`confirm-test`}
              text={'close message'}
              onClick={this.handleExitMessageClick.bind(
                this,
                automationExitButtonId
              )}
            />
          </Section>
        </Wrapper>
      </Container>
    )
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

const ConfirmationButton = styled.div`
  width: ${props => 28}vh;
  height: ${props => 5}vh;
  border: ${props => `${0.2} solid #d3d3d3`}vh;
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
