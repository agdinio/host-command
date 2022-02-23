import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import { extendObservable } from 'mobx'
import { vhToPx, vhToPxNum, evalImage } from '@/utils'
import Draggable, { DraggableCore } from 'react-draggable'
import VolumeOn from '@/assets/images/icon-volume_on.svg'
import VolumeOff from '@/assets/images/icon-volume_off.svg'
const h = 20
const w = h * 1.8

export default class VideoPreview extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      //muted: false,
      //volumeIcon: VolumeOn,
      currentTime: 0,
    })

    this.state = {
      muted: false,
    }
  }

  videoTimer() {
    this.videoTimerInterval = setInterval(() => {
      ++this.currentTime
    }, 1000)
  }

  toggleVolume() {
    //this.muted = !this.muted
    this.setState({ muted: !this.state.muted })
    // if (this.muted) {
    //   this.volumeIcon = VolumeOff
    // } else {
    //   this.volumeIcon = VolumeOn
    // }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.muted !== this.state.muted) {
      return true
    }
    return false
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.pause()
    }
  }

  componentDidMount() {
    if (this.player) {
      if (this.props.lastSessionTime) {
        this.player.currentTime = this.props.lastSessionTime + 1
      } else {
        this.player.currentTime = 1
      }
      this.player.play()
    }
  }

  render() {
    let { videoSource } = this.props

    return (
      <PreviewContainer grab={true}>
        <Draggable
          positionOffset={{ x: '100%', y: 0 }}
          defaultPosition={{ x: 0, y: vhToPxNum(100 - h) }}
          handle=".handle"
          grid={[5, 5]}
          scale={1}
          bounds="body"
        >
          <Container className="handle">
            <video
              controls={false}
              playsInline
              muted={this.state.muted}
              ref={ref => (this.player = ref)}
              style={{ width: '100%' }}
            >
              <source src={videoSource} />
              Your browser does not support HTML5 video.
            </video>
            <MuteButton onClick={this.toggleVolume.bind(this)}>
              <img
                src={
                  this.state.muted
                    ? evalImage('icon-volume_off.svg')
                    : evalImage('icon-volume_on.svg')
                }
              />
            </MuteButton>

            {/*<FootageWrapper>*/}
            {/*  <FootageTimer>{this.currentTime}</FootageTimer>*/}
            {/*</FootageWrapper>*/}
          </Container>
        </Draggable>
      </PreviewContainer>
    )
  }
}

const PreviewContainer = styled.div`
  background: red;
  position: absolute;
  width: ${props => w}vh;
  height: ${props => h}vh;
  z-index: 202;
  left: ${props => -w}vh;
  top: 0;
  &:hover {
    cursor: ${props => (props.grab ? '-moz-grab' : '')};
    cursor: ${props => (props.grab ? '-webkit-grab' : '')};
    cursor: ${props => (props.grab ? 'grab' : '')};
  }
  &:active {
    cursor: ${props => (props.grab ? '-moz-grabbing' : '')};
    cursor: ${props => (props.grab ? '-webkit-grabbing' : '')};
    cursor: ${props => (props.grab ? 'grabbing' : '')};
  }
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const MuteButton = styled.span`
  position: absolute;
  top: 5%;
  right: 5%;
  z-index: 5;
  color: white;
  cursor: pointer;
  opacity: 0;
  animation: ${props => fadeIn} 0.4s forwards;
  animation-delay: 2s;
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1;}
`

const FootageWrapper = styled.div`
  position: absolute;
  bottom: 5%;
  z-index: 5;
  font-size: ${props => h * 0.1}vh;
  color: white;

  width: inherit;
  display: flex;
  flex-direction: row;
`

const FootageTimer = styled.div`
  width: inherit;
  display: flex;
  justify-content: flex-end;
  margin-right: 5%;
`
