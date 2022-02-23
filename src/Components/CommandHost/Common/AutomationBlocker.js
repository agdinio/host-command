import React, { Component } from 'react'
import { vhToPx } from '@/utils'
import styled, { keyframes } from 'styled-components'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'

@inject('GameStore', 'AutomationStore')
@observer
export default class AutomationBlocker extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      idx: 0,
    })
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //
  //   return false
  // }

  componentDidMount() {}

  render() {
    /*
    if (!this.props.GameStore.recordedPlays ||
      (this.props.GameStore.recordedPlays && Array.isArray(this.props.GameStore.recordedPlays) && this.props.GameStore.recordedPlays.length < 1)) {
      return null
    }

    const recordedPlay = this.props.GameStore.recordedPlays[this.idx]
    let _wait = ''
    if (recordedPlay) {
      _wait = recordedPlay.wait
      console.log('::::::::::::::::', recordedPlay)
      this.idx += 1
    }
*/

    return (
      <Container>
        <BlockerSection>
          {/*<ActivityIndicator color={'#000000'} height="6" />*/}
          <BlockerMessageWrapper>
            <BlockerMessage text={'automation in mirror mode'} />
          </BlockerMessageWrapper>
        </BlockerSection>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: ${props => 100}vh;
  position: absolute;
  z-index: 3000;
`

const BlockerSection = styled.div`
  margin: ${props => (props.headless ? 8 : 4)}% 0 0 1.5%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const BlockerMessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const BlockerMessage = styled.div`
  color: #000000;
  text-transform: uppercase;
  &:before {
    content: '${props => props.text}';
    font-family: pamainextrabold;
    font-size: ${props => 2.5}vh;
    color: #000000;
    text-transform: uppercase;
    line-height: 1;
  }
  &:after {
    content: '.';
    font-family: pamainextrabold;
    font-size: ${props => 2.5}vh;
    animation: ${props => dots} 1.3s steps(5, end) infinite;
  }
`

const dots = keyframes`
  0%, 20% {
    color: rgba(0,0,0,0);
    text-shadow:
      .25em 0 0 rgba(0,0,0,0),
      .5em 0 0 rgba(0,0,0,0);
  }
  40% {
    color: #000;
    text-shadow:
      .25em 0 0 rgba(0,0,0,0),
      .5em 0 0 rgba(0,0,0,0);
  }
  60% {
    text-shadow:
      .25em 0 0 #000,
      .5em 0 0 rgba(0,0,0,0);
  }
  80%, 100% {
    text-shadow:
      .25em 0 0 #000,
      .5em 0 0 #000;
  }
`

export const HeadlessMode = props => {
  return (
    <BlockerSection headless style={{ position: 'absolute', zIndex: '3000' }}>
      <BlockerMessageWrapper>
        <BlockerMessage
          text={props.recording ? `recording mode` : `automation mode`}
        />
      </BlockerMessageWrapper>
    </BlockerSection>
  )
}
