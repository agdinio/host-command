import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'
import { observer } from 'mobx-react'

@observer
export default class ResetRecordingModal extends Component {
  constructor(props) {
    super(props)
  }

  handleConfirmClick() {
    this.props.confirmed()
  }

  handleCancelClick() {
    this.props.cancel()
  }

  render() {
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
              do you want to reset playstack and all of its timestamps?
            </Label>
          </Section>
          <Section justifyContent={'center'} marginTop={4}>
            <ConfirmationButton
              key={`confirm-test`}
              text={'confirm'}
              border
              onClick={this.handleConfirmClick.bind(this)}
            />
            <CancelButton
              text={'cancel'}
              onClick={this.handleCancelClick.bind(this)}
            />
          </Section>
          <Section justifyContent={'center'} marginTop={4}></Section>
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
  letter-spacing: ${props => (props.nospacing ? 0 : 0.2)}vh;
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

const CancelButton = styled.div`
  width: ${props => 28}vh;
  height: ${props => 5}vh;
  ${props => (props.border ? `border:${0.2}vh solid #d3d3d3;` : ``)};
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
