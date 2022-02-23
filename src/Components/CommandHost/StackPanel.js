import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import PendingIndicatorIcon from '@/assets/images/pending-indicator-black.svg'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import AnnounceItemOnStack from '@/Components/CommandHost/AnnounceItemOnStack'
import PlayItemOnStack from '@/Components/CommandHost/PlayItemOnStack'
import { vhToPx, vhToPxNum } from '@/utils'

@inject('PrePlayStore', 'PlayStore', 'GameStore')
@observer
export default class StackPanel extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      isStackScrolling: false,
    })

    this.shufflePlays = []
    this.shuffleIds = []
  }

  onDragStart = async result => {
    if (this.props.PrePlayStore.preplayItems) {
      const arr = JSON.parse(
        JSON.stringify(this.props.PrePlayStore.preplayItems)
      )
      await arr.forEach(async p => {
        await this.shuffleIds.push({ id: p.gamePlayId, sequence: p.sequence })
      })
    }
  }

  onDragEnd = async result => {
    const { source, destination, draggableId } = result

    if (!destination) {
      return
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const newItem = await this.props.PrePlayStore.preplayItems[source.index]

    await this.props.PrePlayStore.preplayItems.splice(source.index, 1)
    await this.props.PrePlayStore.preplayItems.splice(
      destination.index,
      0,
      newItem
    )

    if (this.props.PrePlayStore.preplayItems) {
      const arr = await JSON.parse(
        JSON.stringify(this.props.PrePlayStore.preplayItems)
      )
      await arr.forEach(async (p, i) => {
        await this.shufflePlays.push({
          id: p.gamePlayId,
          sequence: this.shuffleIds[i].sequence,
        })
      })
    }

    if (this.shufflePlays && Array.isArray(this.shufflePlays)) {
      this.props.PlayStore.movePlay({
        gameId: this.props.GameStore.gameId,
        plays: JSON.stringify(this.shufflePlays),
        sourceIndex: source.index,
        destinationIndex: destination.index,
      })
    }
  }

  onDragEndORIG = result => {
    const { source, destination, draggableId } = result

    if (!destination) {
      return
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    //const newItem = this.props.PrePlayStore.preplayItems.filter(o => o.index === draggableId)[0]
    const newItem = this.props.PrePlayStore.preplayItems[source.index]
    //const beforeItem = this.props.PrePlayStore.preplayItems[source.index + 1]
    const beforeItem = this.props.PrePlayStore.preplayItems[destination.index]

    this.props.PrePlayStore.preplayItems.splice(source.index, 1)
    this.props.PrePlayStore.preplayItems.splice(destination.index, 0, newItem)

    if (beforeItem) {
      this.props.PlayStore.movePlayBefore({
        playId: newItem.id,
        beforeId: beforeItem.id,
      })
    }
  }

  handleRemoveFromStack(args) {
    this.props.GameStore.removePlay(args)
  }

  handleGoX(item) {
    this.props.PlayStore.gamesGoPlay(item, next => {
      this.props.PrePlayStore.setAddToStackItem(null)
    })
  }

  handleGo(item) {
    this.props.GameStore.syncRequest({
      processName: 'ADD_PLAY',
      gameId: this.props.GameStore.gameId,
      syncGuid: 'abc123',
      isReuse: true,
    })
    this.props.GameStore.goPlay(item)
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

  toggleStackScrolling() {
    setTimeout(() => {
      const stackwrapper = document.getElementById('stack-wrapper')
      if (stackwrapper) {
        if (stackwrapper.offsetHeight >= vhToPxNum(stackScrollHeight)) {
          this.isStackScrolling = true
        } else {
          this.isStackScrolling = false
        }
      }
    }, 100)
  }

  render() {
    this.toggleStackScrolling()

    return (
      <StackContainer isScrolling={this.isStackScrolling}>
        <LoadingComp />
        <StackContainerScrolling isScrolling={this.isStackScrolling}>
          {this.props.PrePlayStore.preplayItems &&
          this.props.PrePlayStore.preplayItems.length > 0 ? (
            <DragDropContext
              onDragStart={this.onDragStart}
              onDragEnd={this.onDragEnd}
              onDragUpdate={this.onDragUpdate}
            >
              <Droppable droppableId={'play-stack-1'}>
                {provided => (
                  <PrePlayStackWrapper
                    innerRef={provided.innerRef}
                    {...provided.droppableProps}
                    id="stack-wrapper"
                  >
                    {this.props.PrePlayStore.preplayItems.map((item, idx) => {
                      if ('announce' === item.type.toLowerCase()) {
                        return (
                          <AnnounceItemOnStack
                            key={`stack-${item.id}`}
                            item={item}
                            index={idx}
                            remove={this.handleRemoveFromStack.bind(this)}
                            go={this.handleGo.bind(this)}
                            currentStack={'stack'}
                            gamesUpdate={this.handleGamesUpdate.bind(this)}
                          />
                        )
                      }
                      return (
                        <PlayItemOnStack
                          key={`stack-play-${item.id}-${item.participantId}-${item.stars}-${item.sponsorId}`}
                          item={item}
                          // index={
                          //   idx - this.props.PrePlayStore.preplayItems.length
                          // }
                          index={idx}
                          zIndexIndex={
                            idx - this.props.PrePlayStore.preplayItems.length
                          }
                          remove={this.handleRemoveFromStack.bind(this)}
                          go={this.handleGo.bind(this)}
                          headerSelectedTeam={this.selectedTeam}
                          gamesUpdate={this.handleGamesUpdate.bind(this)}
                          gamesUpdatePreset={this.handleGamesUpdatePreset.bind(
                            this
                          )}
                        />
                      )
                    })}
                    {provided.placeholder}
                  </PrePlayStackWrapper>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <PrePlayStackWrapperEmpty />
          )}
        </StackContainerScrolling>
      </StackContainer>
    )
  }
}

@inject('PrePlayStore')
@observer
class LoadingComp extends Component {
  render() {
    if (this.props.PrePlayStore.isAddingStack) {
      return <PendingIndicator />
    } else {
      return null
    }
  }
}

const h = 5
const stackScrollHeight = 31

const StackContainer = styled.div`
  width: 100%;
  background-color: #eaeaea;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 4;
  padding-right: ${props => (props.isScrolling ? 0 : 0.6)}%;
`

const StackContainerScrolling = styled.div`
  position: relative;
  width: 100%;
  max-height: ${props => stackScrollHeight}vh;
  background-color: #eaeaea;
  overflow-y: ${props => (props.isScrolling ? 'scroll' : 'none')};
  ms-overflow-style: ${props =>
    props.isScrolling ? '-ms-autohiding-scrollbar' : 'none'};

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0.3vh rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
    border-radius: ${props => 1}vh;
  }
  &::-webkit-scrollbar {
    width: ${props => 1.2}vh;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 0, 0, 0.6);
    &:hover {
      background-color: rgba(255, 0, 0, 1);
    }
    border-radius: ${props => 1}vh;
  }
`

const PrePlayStackWrapper = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
`

const PrePlayStackWrapperEmpty = styled.div`
  width: 100%;
  height: ${props => h}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainlight;
  letter-spacing: ${props => 0.2}vh;
  font-size: ${props => 3}vh;
  color: #808285;
  &:after {
    content: 'DRAGGABLE STACK';
  }
`

const PendingIndicator = styled.div`
  width: ${props => h}vh;
  height: ${props => h}vh;
  display: flex;
  align-items: center;
  &:after {
    content: '';
    display: block;
    width: ${props => h}vh;
    height: ${props => h}vh;
    background-image: url(${props => PendingIndicatorIcon});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
    animation: ${props => pendingRotate} 1s linear infinite;
    transform-origin: center center;
  }
`

const pendingRotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const LoadingText = styled.span`
  font-family: pamainregular;
  font-size: ${props => 2.5}vh;
  color: #000000;
  letter-spacing: ${props => 0.2}vh;
  text-transform: uppercase;
  padding-left: ${props => 1}vh;
  &:after {
    content: '.';
    animation: ${props => dots} 1s steps(5, end) infinite;
  }
`

const dots = keyframes`
 0%, 20% {
    color: rgba(255,255,255,0);
    text-shadow:
      .25em 0 0 rgba(255,255,255,0);,
      .5em 0 0 rgba(255,255,255,0);;}
  40% {
    color: black;
    text-shadow:
      .25em 0 0 rgba(255,255,255,0);,
      .5em 0 0 rgba(255,255,255,0);;}
  60% {
    text-shadow:
      .25em 0 0 black,
      .5em 0 0 rgba(255,255,255,0);;}
  80%, 100% {
    text-shadow:
      .25em 0 0 black,
      .5em 0 0 black;}}
`
