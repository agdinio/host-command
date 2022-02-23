import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import PlayItemUnresolved from '@/Components/CommandHost/PlayItemUnresolved'
import { vhToPx } from '@/utils'
import PrePickItem from '@/Components/CommandHost/PrePickItem'

@inject('GameStore')
export default class PrePicksPanel extends Component {
  render() {
    let { GameStore } = this.props

    return (
      <Container>
        <Wrapper>
          {(GameStore.prePicks || []).map(pp => {
            return (
              <PrePickItem key={`prepick-item-${pp.prePickId}`} item={pp} />
            )
          })}
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  display: flex;
  background-color: #eaeaea;
  position: relative;
`

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: ${props => 20}vh;
  margin-bottom: ${props => 5}vh;
`
