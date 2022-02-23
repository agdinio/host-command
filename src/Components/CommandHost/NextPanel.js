import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import styled, { keyframes } from 'styled-components'
import AnnounceItemPreLoad from '@/Components/CommandHost/AnnounceItemPreLoad'
import PlayItemPreLoad from '@/Components/CommandHost/PlayItemPreLoad'
import { vhToPx } from '@/utils'

@inject('PrePlayStore', 'PlayStore', 'GameStore')
@observer
export default class NextPanel extends Component {
  constructor(props) {
    super(props)
  }

  handleRemoveFromStack(args) {
    this.props.GameStore.removePlay(args)
  }

  handleRemoveNextPlay() {
    this.props.PrePlayStore.setNextPlayItem(null)
    setTimeout(() => {
      const idxToPullFromStack = this.props.PrePlayStore.preplayItems.length - 1
      const itemToPullFromStack = this.props.PrePlayStore.preplayItems[
        idxToPullFromStack
      ]
      this.props.PrePlayStore.setNextPlayItem(itemToPullFromStack)
      this.props.PrePlayStore.preplayItems.splice(idxToPullFromStack, 1)
    }, 0)
  }

  handleGoX(item) {
    this.props.PlayStore.gamesGoPlay(item, next => {
      this.props.PrePlayStore.setAddToStackItem(null)
    })
  }

  handleGo(item) {
    const _item = Object.assign({}, item)
    this.props.GameStore.syncRequest({
      processName: 'ADD_PLAY',
      gameId: this.props.GameStore.gameId,
      syncGuid: 'abc123',
      isReuse: true,
    })
    this.props.GameStore.goPlay(_item)
    setTimeout(() => {
      this.props.PrePlayStore.setNextPlayItem(null)
    }, 0)
  }

  // handleGamesUpdate(item) {
  //   setTimeout(() => {
  //     this.props.PlayStore.gamesUpdate(item).then(response => {
  //       console.log('ITEM - UPDATED', response)
  //     })
  //   }, 0)
  // }

  handleGamesUpdate(item) {
    this.props.GameStore.updatePlay(item)
  }

  handleGamesUpdatePreset(args) {
    this.props.PlayStore.gamesUpdatePreset(args)
  }

  render() {
    let { nextPlayItem } = this.props.PrePlayStore
    return (
      <PreloadPlayContainer>
        {nextPlayItem ? (
          'Announce' === nextPlayItem.type ? (
            <AnnounceItemPreLoad
              key={`preload-${nextPlayItem.id}`}
              item={nextPlayItem}
              remove={this.handleRemoveFromStack.bind(this)}
              //removeNextPlay={this.handleRemoveNextPlay.bind(this)}
              currentStack={'preload'}
              go={this.handleGo.bind(this)}
            />
          ) : (
            <PlayItemPreLoad
              key={`preload-${nextPlayItem.id}-${nextPlayItem.participantId}`}
              item={nextPlayItem}
              remove={this.handleRemoveFromStack.bind(this)}
              //removeNextPlay={this.handleRemoveNextPlay.bind(this)}
              headerSelectedTeam={this.selectedTeam}
              gamesUpdate={this.handleGamesUpdate.bind(this)}
              gamesUpdatePreset={this.handleGamesUpdatePreset.bind(this)}
              go={this.handleGo.bind(this)}
            />
          )
        ) : null}
      </PreloadPlayContainer>
    )
  }
}

const PreloadPlayContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eaeaea;
  position: relative;
  padding-top: ${props => 0.2}vh;
  z-index: 2;
  padding-right: 0.6%;
`
