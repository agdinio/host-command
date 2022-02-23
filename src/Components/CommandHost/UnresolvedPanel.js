import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import PlayItemUnresolved from '@/Components/CommandHost/PlayItemUnresolved'
import { vhToPx } from '@/utils'

@inject('PrePlayStore', 'PlayStore', 'GameStore')
@observer
export default class UnresolvedPanel extends Component {
  constructor(props) {
    super(props)
  }

  handleResolvePending(args) {
    this.props.GameStore.resolvePlay(args)
  }

  render() {
    const items = this.props.PrePlayStore.unresolvedItems.sort(
      (a, b) => new Date(b.started) - new Date(a.started)
    )

    return (
      <UnResolvedContainer len={items.length}>
        {items.map(item => {
          return (
            <PlayItemUnresolved
              //key={item.index}
              key={`unresolved-play-${item.id}`}
              item={item}
              resolvePending={this.handleResolvePending.bind(this)}
            />
          )
        })}
      </UnResolvedContainer>
    )
  }
}

const UnResolvedContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #eaeaea;
  position: relative;
  z-index: 0;
  padding-top: ${props => (props.len ? 0.7 : 0)}vh;
  padding-bottom: ${props => (props.len ? 0.7 : 0)}vh;
  padding-right: 0.6%;
`
