import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import ArrowDownIcon from '@/assets/images/host-command-arrow-down.svg'
import AnnounceItem from '@/Components/CommandHost/AnnounceItem'
import PlayItem from '@/Components/CommandHost/PlayItem'
import { vhToPx } from '@/utils'

@inject('PrePlayStore', 'PlayStore', 'GameStore')
@observer
export default class AssemblyPanel extends Component {
  constructor(props) {
    super(props)
  }

  setSessionButtonValues(resp) {
    this.props.PrePlayStore.sessionButtons[resp.type].locked = resp.locked

    if (resp.backgroundColor) {
      this.props.PrePlayStore.sessionButtons[resp.type].backgroundColor =
        resp.backgroundColor
    }
    if (resp.color) {
      this.props.PrePlayStore.sessionButtons[resp.type].color = resp.color
    }
    if (resp.text) {
      this.props.PrePlayStore.sessionButtons[resp.type].text =
        resp.text === '-' ? '' : resp.text
    }
  }

  handleAddToStackValues(values) {
    this.props.PrePlayStore.setIsAddingStack(true)
    this.props.PrePlayStore.setAddToStackItem(null)

    //this.props.PlayStore.addThePlay(values)

    this.props.GameStore.syncRequest({
      processName: 'ADD_PLAY',
      gameId: this.props.GameStore.gameId,
      syncGuid: 'abc123',
    })
    this.props.GameStore.addThePlay(values)

    if (!this.props.PrePlayStore.nextPlayItem) {
      this.setSessionButtonValues({ type: 'start', locked: false })
    }
  }

  handleGo(item) {
    // this.props.PlayStore.gamesGoPlay(item, next => {
    //   this.props.PrePlayStore.setAddToStackItem(null)
    // })

    this.props.GameStore.syncRequest({
      processName: 'ADD_PLAY',
      gameId: this.props.GameStore.gameId,
      syncGuid: 'abc123',
    })
    this.props.GameStore.goPlay(item)
    this.props.PrePlayStore.setAddToStackItem(null)
  }

  handlePreviewValue(val) {
    this.props.previewValue(val)
  }

  render() {
    let {
      addToStackItem,
      selectedTeam,
      selectedSponsor,
    } = this.props.PrePlayStore
    return (
      <AddStack>
        <AssemblyWrapper>
          {addToStackItem ? (
            'Announce' === addToStackItem.type ? (
              <AnnounceItem
                key={0}
                item={addToStackItem}
                addToStackValues={this.handleAddToStackValues.bind(this)}
                currentStack={'assembly'}
                go={this.handleGo.bind(this)}
              />
            ) : (
              <PlayItem
                key={0}
                resetValue={addToStackItem}
                playType={addToStackItem.type}
                addToStackValues={this.handleAddToStackValues.bind(this)}
                headerSelectedTeam={selectedTeam}
                headerSelectedSponsor={selectedSponsor}
                go={this.handleGo.bind(this)}
                previewValue={this.handlePreviewValue.bind(this)}
              />
            )
          ) : null}
        </AssemblyWrapper>
        <SpaceArrow />
      </AddStack>
    )
  }
}

const AddStack = styled.div`
  width: 100%;
  height: ${props => 20}vh;
  display: flex;
  padding-top: ${props => 1}vh;
  position: relative;
  z-index: 5;
  background-color: #eaeaea;
  padding-right: 0.6%;
`

const AssemblyWrapper = styled.div`
  /*width: 93vw;*/
  width: 100%;
  display: flex;
  flex-direction: column;
`

const SpaceArrow = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    width: ${props => 8}vh;
    height: ${props => 8}vh;
    content: '';
    display: inline-block;
    background-image: url(${ArrowDownIcon});
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    margin-top: 2%;
  }
  z-index: -10;
`
