import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import AnnounceItemResolved from '@/Components/CommandHost/AnnounceItemResolved'
import PlayItemResolved from '@/Components/CommandHost/PlayItemResolved'
import { vhToPx } from '@/utils'

@inject('PrePlayStore', 'GameStore')
@observer
export default class ResolvedPanel extends Component {
  constructor(props) {
    super(props)
  }

  handleReuse(play) {
    this.props.GameStore.syncRequest({
      processName: 'ADD_PLAY',
      gameId: this.props.GameStore.gameId,
      syncGuid: 'abc123',
      isReuse: true,
    })
    this.props.GameStore.addThePlay(play)
  }

  render() {
    const resolvedItems = this.props.PrePlayStore.resolvedItems.sort(
      (a, b) => new Date(b.started) - new Date(a.started)
    )

    return (
      <ResolvedContainer len={resolvedItems.length}>
        {resolvedItems.map(item => {
          if ('announce' === item.type.toLowerCase()) {
            return (
              <AnnounceItemResolved
                key={`resolved-announce-play-${item.id}`}
                item={item}
                reuse={this.handleReuse.bind(this)}
              />
            )
          } else {
            return (
              <PlayItemResolved
                //key={item.index}
                key={`resolved-play-${item.id}`}
                item={item}
                reuse={this.handleReuse.bind(this)}
              />
            )
          }
        })}
      </ResolvedContainer>
    )
  }
}

const ResolvedContainer = styled.div`
  width: 100%;
  //min-height: ${props => 10}vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #eaeaea;
  position: relative;
  z-index: 0;
  padding-top: ${props => (props.len ? 0.7 : 0)}vh;
  padding-bottom: ${props => (props.len ? 0.7 : 0)}vh;
  padding-right: 0.4%;
`
