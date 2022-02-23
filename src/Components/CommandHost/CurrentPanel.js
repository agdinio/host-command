import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import AnnounceItemLoad from '@/Components/CommandHost/AnnounceItemLoad'
import PlayItemLoad from '@/Components/CommandHost/PlayItemLoad'
import KillPlayItem from '@/Components/CommandHost/KillPlayItem'
import { TweenMax } from 'gsap'
import { vhToPx } from '@/utils'

@inject('PrePlayStore', 'PlayStore', 'GameStore')
@observer
export default class CurrentPanel extends Component {
  constructor(props) {
    super(props)
  }

  // handleEndAnnouncement() {
  //   let args = {
  //     playId: this.props.PrePlayStore.currentPlayItem.id,
  //     result: {
  //       type: 'Announce',
  //       hasNextPlay: this.props.PrePlayStore.nextPlayItem ? true : false,
  //     },
  //   }
  //   this.props.PlayStore.gamesEndPlay(args)
  //   this.props.PrePlayStore.setCurrentPlayItem(null)
  //
  //   this.executeNextPlayItem()
  // }

  handleEndAnnouncement(item) {
    this.props.GameStore.endCurrentPlay(item)
  }

  executeNextPlayItem() {
    if (this.props.PrePlayStore.nextPlayItem) {
      this.props.PlayStore.gamesGoPlay(this.props.PrePlayStore.nextPlayItem)
    } else {
      this.props.PlayStore.gamesStartPlay(null)
    }
  }

  handleStartPlay() {
    //this.props.CommandHostStore.broadcastLockout(true)
    this.props.PlayStore.gamesLockPlay(
      this.props.PrePlayStore.currentPlayItem.id
    )
    TweenMax.to(this.LoadPlayContainer, 0.3, { backgroundColor: '#562525' })
  }

  handleEndPlayResult() {
    //REMOVED TO GIVE WAY TO THE GAMESERVER this.props.CommandHostStore.endPlay()
    TweenMax.to(this.LoadPlayContainer, 0.3, { backgroundColor: '#07414f' })
  }

  handleShowResultOLD(result) {
    result['comment'] = result.resultTitle
    result['correctValue'] = -1

    this.props.PrePlayStore.currentPlayItem.result = result
    //REMOVED TO GIVE WAY TO THE GAMESERVER this.props.CommandHostStore.showResult(result)
    TweenMax.to(this.LoadPlayContainer, 0.3, { backgroundColor: '#07414f' })

    let args = {
      playId: this.props.PrePlayStore.currentPlayItem.id,
      result: result,
    }
    this.props.PlayStore.gamesEndPlay(args)

    setTimeout(() => {
      this.executeNextPlayItem()
    }, 3000)
  }

  handleShowResult(args) {
    TweenMax.to(this.LoadPlayContainer, 0.3, { backgroundColor: '#07414f' })
    this.props.GameStore.endCurrentPlay(args)
  }

  handleOverlayKillPlayOpen() {
    TweenMax.to(this.KillPlayWrapper, 0.3, { x: '0%' })
    TweenMax.to(this.KillPlayOverlayOpenButton, 0.3, {
      opacity: 1,
      cursor: 'default',
    })
  }

  handleOverlayKillPlayClose() {
    TweenMax.to(this.KillPlayWrapper, 0.3, { x: '97%' })
    TweenMax.to(this.KillPlayOverlayOpenButton, 0.3, {
      opacity: 0.2,
      cursor: 'pointer',
    })
  }

  render() {
    return (
      <LoadPlayContainer
        innerRef={ref => (this.LoadPlayContainer = ref)}
        exists={this.props.PrePlayStore.currentPlayItem}
      >
        <LoadPlayContainerInner
          exists={this.props.PrePlayStore.currentPlayItem}
        >
          {this.props.PrePlayStore.currentPlayItem ? (
            'Announce' === this.props.PrePlayStore.currentPlayItem.type ? (
              <AnnounceItemLoad
                key={`current-${this.props.PrePlayStore.currentPlayItem.id}`}
                item={this.props.PrePlayStore.currentPlayItem}
                endAnnouncement={this.handleEndAnnouncement.bind(this)}
              />
            ) : (
              <PlayItemLoad
                key={`current-${this.props.PrePlayStore.currentPlayItem.id}`}
                item={this.props.PrePlayStore.currentPlayItem}
                //loadPlay={this.handleLoadPlay.bind(this)}
                startPlay={this.handleStartPlay.bind(this)}
                endPlayResult={this.handleEndPlayResult.bind(this)}
                showResult={this.handleShowResult.bind(this)}
                //resolve={this.handleResolve.bind(this)}
                killPlayRemoved={val => {
                  this.killPlayRemoved = val
                }}
              />
            )
          ) : null}

          {this.props.PrePlayStore.currentPlayItem &&
          this.props.PrePlayStore.currentPlayItem.length > 0 &&
          !this.killPlayRemoved ? (
            <KillPlayWrapper innerRef={ref => (this.KillPlayWrapper = ref)}>
              <KillPlayOverlayOpenButton
                innerRef={ref => (this.KillPlayOverlayOpenButton = ref)}
                onClick={this.handleOverlayKillPlayOpen.bind(this)}
              />
              <KillPlayItem />
              <KillPlayOverlayCloseButton
                onClick={this.handleOverlayKillPlayClose.bind(this)}
              />
            </KillPlayWrapper>
          ) : null}
        </LoadPlayContainerInner>
      </LoadPlayContainer>
    )
  }
}

const LoadPlayContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #414042;
  position: relative;
  z-index: 1;
  padding-right: 0.6%;
`

const LoadPlayContainerInner = styled.div`
  width: 100%;
/*
  padding: ${props => (props.exists ? '5vh' : 0)} 0
    ${props => (props.exists ? '5vh' : 0)} 0;
*/
`

const KillPlayWrapper = styled.div`
  position: absolute;
  width: 100%;
  //min-height: ${props => 20}vh;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: row;
  color: white;
  display: flex;
  align-items: center;
  transform: translateX(97%);
`

const KillPlayOverlayOpenButton = styled.div`
  width: 3%;
  height: inherit;
  font-family: pamainbold;
  line-height: 1;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  &:before {
    content: 'KILL';
    writing-mode: vertical-lr;
    text-orientation: upright;
  }
  &:after {
    content: 'PLAY';
    writing-mode: vertical-lr;
    text-orientation: upright;
  }
  opacity: 0.2;
  cursor: pointer;
`

const KillPlayOverlayCloseButton = styled.div`
  position: absolute;
  left: 98.5%;
  top: -1%;
  &:after {
    content: 'x';
    font-weight: bolder;
    font-size: 4vh;
    color: #808285;
    line-height: 0.9;
  }
  cursor: pointer;
`
