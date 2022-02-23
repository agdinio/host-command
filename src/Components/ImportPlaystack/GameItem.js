import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { intercept, extendObservable } from 'mobx'
import styled from 'styled-components'
import { vhToPx, isEqual } from '@/utils'
import dateFormat from 'dateformat'
import TeamIcon from './ImportTeamIcon'
import { TweenMax } from 'gsap'
let scale_size = 1
let h = 7.6

const SlidingButton = {
  active: { text: 'details', color: '#000000', bg: '#E5E5E5' },
  public: { text: 'edit prepicks', color: '#ffffff', bg: '#22ba2c' },
  pregame: { text: 'access h-comm', color: '#ffffff', bg: '#18c5ff' },
  pending: { text: 'access h-comm', color: '#ffffff', bg: '#18c5ff' },
  live: { text: 'join h-comm', color: '#ffffff', bg: '#c61818' },
  postgame: { text: 'access stats', color: '#ffffff', bg: '#4d92ad' },
  end: { text: 'access stats', color: '#ffffff', bg: '#3d3d3d' },
}

@inject('ImportStore')
@observer
export default class GameItem extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      isSelected: false,
    })
    this.animSlidRefToggle = null
    this.uniqueIdentifier = null
    this.check = null
    this.timeoutConfirmDelete = null
    scale_size = this.props.scaleSize || 1
    h = 7.6 * scale_size

    intercept(this.props.ImportStore, 'selectedGameId', change => {
      if (this.props.item.gameId === change.newValue) {
        this.isSelected = true
      } else {
        this.isSelected = false
      }
      return change
    })
  }

  executeSlide() {
    const refSlidingPanel = this[`sliding-${this.uniqueIdentifier}`]
    if (refSlidingPanel) {
      this.animSlidRefToggle = TweenMax.to(refSlidingPanel, 0.1, { x: 0 })

      setTimeout(() => {
        if (this.animSlidRefToggle) {
          this.animSlidRefToggle.reverse()
        }
      }, 10000)
    }
  }

  reverseSlide() {
    if (this.check) {
      clearTimeout(this.check)
    }

    if (this.animSlidRefToggle) {
      this.animSlidRefToggle.reverse()
    }

    this.animSlidRefToggle = null

    if (this.timeoutConfirmDelete) {
      clearTimeout(this.timeoutConfirmDelete)
    }

    if (this[`confirm-delete-${this.props.item.gameId}`]) {
      TweenMax.to(this[`confirm-delete-${this.props.item.gameId}`], 0.1, {
        x: '-101%',
      })
    }
  }

  handleImportGamePlaystackClick() {
    if (this.props.selectedGameEvent) {
      this.props.selectedGameEvent(this.props.item)
    }
  }

  handleShowSlidingClick() {
    this.uniqueIdentifier = `${this.props.item.subSportGenre}-${this.props.item.sportType}-${this.props.item.gameId}`
    this.props.GameEventStore.setActiveSlidingItem(this.uniqueIdentifier)
  }

  handleConfirmDelete(gameId, deleteType) {
    if (this[`confirm-${deleteType}-${gameId}`]) {
      TweenMax.to(this[`confirm-${deleteType}-${gameId}`], 0.1, { x: '0%' })

      // this.timeoutConfirmDelete = setTimeout(() => {
      //   TweenMax.to(this[`confirm-delete-${gameId}`], 0.1, {x:'-101%'})
      // }, 5000)
    }
  }

  handleCancelDelete(deleteType) {
    if (this.timeoutConfirmDelete) {
      clearTimeout(this.timeoutConfirmDelete)
    }

    if (this[`confirm-${deleteType}-${this.props.item.gameId}`]) {
      TweenMax.to(
        this[`confirm-${deleteType}-${this.props.item.gameId}`],
        0.1,
        { x: '-101%' }
      )
    }
  }

  handleSureDelete(deleteType) {
    if (this[`sure-${deleteType}-${this.props.item.gameId}`]) {
      TweenMax.to(this[`sure-${deleteType}-${this.props.item.gameId}`], 0.1, {
        display: 'flex',
      })
    }

    this.props.deleteClick()
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (!isEqual(this.props.item, nextProps.item)) {
  //     return true
  //   }
  //
  //   return false
  // }

  render() {
    let {
      item,
      detailsClick,
      accessHComm,
      viewRecordedEvent,
      ImportStore,
    } = this.props
    let { participants } = item

    if (!item || (item && !item.stage) || !participants) {
      return null
    }

    const isAccessHComm = false
    /*
    let timeOfGame = null
    if (item.timeStart) {
      timeOfGame = dateFormat(item.timeStart, 'hh:MM TT' )
    } else {
      return (
        <Container>
          INVALID START DATE FORMAT
        </Container>
      )
    }
*/

    return (
      <Container>
        {this.isSelected ? <Highlighted /> : null}
        <Wrapper
          backgroundColor={ImportStore.gameStatus[item.stage].bg}
          onClick={
            this.props.forImport
              ? this.handleImportGamePlaystackClick.bind(this)
              : this.handleShowSlidingClick.bind(this)
          }
          id={`game-item-${item.gameId}`}
        >
          <TeamsWrapper>
            <TeamIconWrapper>
              <TeamIcon
                teamInfo={participants[0]}
                size={2.3 * scale_size}
                outsideBorderColor={'#ffffff'}
                outsideBorderWidth={0.15 * scale_size}
              />
              <TeamName>{participants[0].name}</TeamName>
            </TeamIconWrapper>
            <TeamIconWrapper>
              <TeamIcon
                teamInfo={participants[1]}
                size={2.3 * scale_size}
                outsideBorderColor={'#ffffff'}
                outsideBorderWidth={0.15 * scale_size}
              />
              <TeamName>{participants[1].name}</TeamName>
            </TeamIconWrapper>
          </TeamsWrapper>
          <InfoWrapper>
            {item.stage === 'active' ? (
              <StatusWrapper>
                <Status
                  font={'pamainbold'}
                  color={ImportStore.gameStatus[item.stage].color}
                  size={h * 0.45}
                >
                  {ImportStore.gameStatus[item.stage].text}
                </Status>
                <Venue>
                  {item.venue.city.name}&nbsp;{item.venue.state.name},&nbsp;
                  {item.venue.stadiumName}
                </Venue>
              </StatusWrapper>
            ) : item.stage === 'public' ? (
              <StatusWrapper>
                <TimeWrapper>
                  <MonthDay>
                    {dateFormat(item.dateStart, 'mmmm dS, dddd')}&nbsp;
                  </MonthDay>
                  <Time ap color={'#22ba2c'}>
                    {item.timeStart}
                  </Time>
                </TimeWrapper>
                <Venue>
                  {item.venue.city.name}&nbsp;{item.venue.state.name},&nbsp;
                  {item.venue.stadiumName}
                </Venue>
              </StatusWrapper>
            ) : (
              <StatusWrapper>
                <TimeWrapper>
                  <Time color={ImportStore.gameStatus[item.stage].color}>
                    {dateFormat(
                      item.dateStart + ' ' + item.timeStart.substring(0, 5),
                      'mm/dd/yyyy hh:MMTT'
                    )}
                  </Time>
                </TimeWrapper>
                <Status
                  font={'pamainbold'}
                  color={ImportStore.gameStatus[item.stage].color}
                  size={h * 0.45}
                >
                  {('recording' === item.leapType
                    ? item.dateEndSession
                      ? 'automate - '
                      : 'record - '
                    : '') + ImportStore.gameStatus[item.stage].text}
                </Status>
              </StatusWrapper>
            )}
          </InfoWrapper>
        </Wrapper>

        <SlidingPanel
          backgroundColor={'#212121'}
          innerRef={ref =>
            (this[
              `sliding-${item.subSportGenre}-${item.sportType}-${item.gameId}`
            ] = ref)
          }
          hidden={this.props.forImport}
        >
          <SlidingStageWrap>
            {item.stage === 'active' ? (
              <ButtonWrapper>
                <Button
                  text={ImportStore.gameStatus[item.stage].slidingButton.text}
                  color={ImportStore.gameStatus[item.stage].slidingButton.color}
                  backgroundColor={
                    ImportStore.gameStatus[item.stage].slidingButton.bg
                  }
                  width="15"
                  onClick={detailsClick}
                />
                <Button
                  text="delete"
                  color="#ffffff"
                  backgroundColor="#c61818"
                  width="8"
                  marginLeft="1"
                  onClick={this.handleConfirmDelete.bind(
                    this,
                    item.gameId,
                    'delete'
                  )}
                />
              </ButtonWrapper>
            ) : item.stage === 'postgame' || item.stage === 'end' ? (
              <ButtonWrapper>
                {item.leapType === 'recording' && item.dateEndSession ? (
                  <Button
                    style={{ paddingLeft: '1vh', paddingRight: '1vh' }}
                    text={'view recorded game'}
                    color={
                      isAccessHComm
                        ? ImportStore.gameStatus[item.stage].slidingButton.color
                        : '#8f8f8f'
                    }
                    backgroundColor={isAccessHComm ? '#28A745' : '#a8a8a8'}
                    onClick={isAccessHComm ? viewRecordedEvent() : null}
                    cursor={isAccessHComm ? 'pointer' : 'default'}
                  />
                ) : null}
                {item.leapType === 'recording' ? (
                  <Button
                    text={'automate h-comm'}
                    color={'#ffffff'}
                    backgroundColor={'#18c5ff'}
                    width="15"
                    onClick={accessHComm(item.gameId)}
                    marginLeft={
                      'recording' === item.leapType && item.dateEndSession
                        ? 1
                        : 0
                    }
                  />
                ) : null}
                <Button
                  text={ImportStore.gameStatus[item.stage].slidingButton.text}
                  color={ImportStore.gameStatus[item.stage].slidingButton.color}
                  backgroundColor={
                    ImportStore.gameStatus[item.stage].slidingButton.bg
                  }
                  width="15"
                  marginLeft="1"
                />
              </ButtonWrapper>
            ) : item.stage === 'public' ? (
              <ButtonWrapper>
                <Button
                  text={ImportStore.gameStatus[item.stage].slidingButton.text}
                  color={ImportStore.gameStatus[item.stage].slidingButton.color}
                  backgroundColor={
                    ImportStore.gameStatus[item.stage].slidingButton.bg
                  }
                  width="15"
                  onClick={detailsClick}
                />
                <Button
                  text="details"
                  color="#000000"
                  backgroundColor="#E5E5E5"
                  width="8"
                  marginLeft="1"
                  onClick={detailsClick}
                />
                <Button
                  text="delete"
                  color="#ffffff"
                  backgroundColor="#c61818"
                  width="8"
                  marginLeft="1"
                  onClick={this.handleConfirmDelete.bind(
                    this,
                    item.gameId,
                    'delete'
                  )}
                />
              </ButtonWrapper>
            ) : (
              <ButtonWrapper>
                {item.leapType === 'recording' && item.dateEndSession ? (
                  <Button
                    style={{ paddingLeft: '1vh', paddingRight: '1vh' }}
                    text={'view recorded game'}
                    color={
                      isAccessHComm
                        ? ImportStore.gameStatus[item.stage].slidingButton.color
                        : '#8f8f8f'
                    }
                    backgroundColor={isAccessHComm ? '#28A745' : '#a8a8a8'}
                    onClick={isAccessHComm ? viewRecordedEvent() : null}
                    cursor={isAccessHComm ? 'pointer' : 'default'}
                  />
                ) : null}
                <Button
                  text={
                    item.leapType === 'recording'
                      ? item.dateEndSession
                        ? 'automate game'
                        : 'record game'
                      : ImportStore.gameStatus[item.stage].slidingButton.text
                  }
                  color={
                    isAccessHComm
                      ? ImportStore.gameStatus[item.stage].slidingButton.color
                      : '#8f8f8f'
                  }
                  backgroundColor={
                    isAccessHComm
                      ? ImportStore.gameStatus[item.stage].slidingButton.bg
                      : '#a8a8a8'
                  }
                  width="15"
                  onClick={isAccessHComm ? accessHComm(item.gameId) : null}
                  cursor={isAccessHComm ? 'pointer' : 'default'}
                  marginLeft={
                    'recording' === item.leapType && item.dateEndSession ? 1 : 0
                  }
                  id={
                    item.leapType === 'recording'
                      ? item.dateEndSession
                        ? `game-item-button-${item.gameId}-automate`
                        : `game-item-button-${item.gameId}-record`
                      : `game-item-button-${
                          item.gameId
                        }-${ImportStore.gameStatus[
                          item.stage
                        ].slidingButton.text.replace(/\s/g, '')}`
                  }
                />

                {item.leapType === 'recording' ? (
                  !item.dateEndSession ? (
                    <Button
                      text="details"
                      color="#000000"
                      backgroundColor="#E5E5E5"
                      width="8"
                      marginLeft="1"
                      onClick={detailsClick}
                    />
                  ) : null
                ) : (
                  <Button
                    text="details"
                    color="#000000"
                    backgroundColor="#E5E5E5"
                    width="8"
                    marginLeft="1"
                    onClick={detailsClick}
                  />
                )}
                <Button
                  text="remove"
                  color="#ffffff"
                  backgroundColor="#c61818"
                  width="8"
                  marginLeft="1"
                  onClick={this.handleConfirmDelete.bind(
                    this,
                    item.gameId,
                    'remove'
                  )}
                />
              </ButtonWrapper>
            )}
            <InfoWrapper>
              {item.stage === 'active' ? (
                <StatusWrapper>
                  <Status
                    font={'pamainbold'}
                    color={ImportStore.gameStatus[item.stage].invertedColor}
                    size={h * 0.45}
                  >
                    {ImportStore.gameStatus[item.stage].text}
                  </Status>
                  {/*<Venue color={ImportStore.gameStatus[item.stage].invertedColor}>{item.venue.city.name}&nbsp;{item.venue.state.name},&nbsp;{item.venue.stadiumName}</Venue>*/}
                </StatusWrapper>
              ) : item.stage === 'public' ? (
                <StatusWrapper>
                  <Status
                    font={'pamainbold'}
                    color={ImportStore.gameStatus[item.stage].invertedColor}
                    size={h * 0.45}
                  >
                    {ImportStore.gameStatus[item.stage].text}
                  </Status>
                  {/*
                    <TimeWrapper>
                      <MonthDay>{dateFormat(item.dateStart, 'mmmm dS, dddd')}&nbsp;</MonthDay>
                      <Time ap color={'#22ba2c'}>{item.timeStart}</Time>
                    </TimeWrapper>
                    <Venue color={ImportStore.gameStatus[item.stage].invertedColor}>{item.venue.city.name}&nbsp;{item.venue.state.name},&nbsp;{item.venue.stadiumName}</Venue>
*/}
                </StatusWrapper>
              ) : (
                <StatusWrapper>
                  {'recording' === item.leapType &&
                  item.dateEndSession ? null : (
                    <StatusWrapper>
                      <TimeWrapper>
                        <Time
                          color={
                            ImportStore.gameStatus[item.stage].invertedColor
                          }
                        >
                          {dateFormat(
                            item.dateStart +
                              ' ' +
                              item.timeStart.substring(0, 5),
                            'mm/dd/yyyy hh:MMTT'
                          )}
                        </Time>
                      </TimeWrapper>
                      <Status
                        font={'pamainbold'}
                        color={ImportStore.gameStatus[item.stage].invertedColor}
                        size={h * 0.45}
                      >
                        {ImportStore.gameStatus[item.stage].text}
                      </Status>
                    </StatusWrapper>
                  )}
                </StatusWrapper>
              )}
            </InfoWrapper>
          </SlidingStageWrap>

          <ConfirmDeleteWrapper
            innerRef={ref => (this[`confirm-delete-${item.gameId}`] = ref)}
          >
            <Text font={'pamainregular'} size={3} color={'#ffffff'} uppercase>
              confirm delete
            </Text>
            <DeleteButton
              text="cancel"
              backgroundColor={'#ffffff'}
              marginLeft={2}
              onClick={this.handleCancelDelete.bind(this, 'delete')}
            />
            <DeleteButton
              text="delete"
              backgroundColor={'#ff0000'}
              marginLeft={2}
              onClick={this.handleSureDelete.bind(this, 'delete')}
            />
          </ConfirmDeleteWrapper>
          <ConfirmDeleteWrapper
            innerRef={ref => (this[`confirm-remove-${item.gameId}`] = ref)}
          >
            <Text font={'pamainregular'} size={3} color={'#ffffff'} uppercase>
              confirm remove
            </Text>
            <DeleteButton
              text="cancel"
              backgroundColor={'#ffffff'}
              marginLeft={2}
              onClick={this.handleCancelDelete.bind(this, 'remove')}
            />
            <DeleteButton
              text="remove"
              backgroundColor={'#ff0000'}
              marginLeft={2}
              onClick={this.handleSureDelete.bind(this, 'remove')}
            />
          </ConfirmDeleteWrapper>
        </SlidingPanel>

        <SureDeleteMessage
          text="deleting from the database..."
          innerRef={ref => (this[`sure-delete-${item.gameId}`] = ref)}
        />
        <SureDeleteMessage
          text="removing from the list..."
          innerRef={ref => (this[`sure-remove-${item.gameId}`] = ref)}
        />
      </Container>
    )
  }
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: ${props => h}vh;
  margin-bottom: 0.4%;
  display: flex;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#3d3d3d'};
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`

const TeamsWrapper = styled.div`
  width: 30%;
  height: 100%;
  border-top-right-radius: ${props => h / 2}vh;
  border-bottom-right-radius: ${props => h / 2}vh;
  background-color: #d1d3d3;
  display: flex;
  flex-direction: column;
  padding-left: 4%;
`

const TeamIconWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TeamName = styled.div`
  font-family: pamainbold;
  font-size: ${props => h * 0.25}vh;
  color: #000000;
  text-transform: uppercase;
  line-height: 1;
  margin-left: 10%;
`

const InfoWrapper = styled.div`
  height: 100%;
  display: flex;
  // flex-direction: column;
  // align-items: flex-end;
  // justify-content: center;
  padding-right: 3%;
`

const StatusWrapper = styled.div`
  height: inherit;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
`

const TimeWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const MonthDay = styled.div`
  font-family: pamainbold;
  font-size: ${props => h * 0.25}vh;
  color: #808285;
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: ${props => 0.1}vh;
`

const Time = styled.div`
  font-family: pamainregular;
  font-size: ${props => h * 0.25}vh;
  color: ${props => props.color || '#000000'};
  text-transform: uppercase;
  line-height: 1;
  //padding-top: ${props => (props.ap ? 0 : '5%')};
  //padding-bottom: ${props => (props.ap ? 0 : '5%')};
  letter-spacing: ${props => 0.1}vh;
  height: ${props => h * 0.25 * 0.8}vh;
  margin-bottom: ${props => (props.ap ? 0 : '5%')};
  white-space: nowrap;
`

const Status = styled.div`
  font-family: ${props => props.font};
  font-size: ${props => props.size}vh;
  color: ${props => props.color || '#000000'};
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: ${props => 0.1}vh;
`

const Venue = styled.div`
  font-family: pamainbold;
  font-size: ${props => h * 0.25}vh;
  color: ${props => props.color || '#000000'};
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: ${props => 0.1}vh;
  white-space: nowrap;
`

const SlidingPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  /*padding-left: 3%;*/
  transform: translateX(-101%);
  display: ${props => (props.hidden ? 'none' : 'flex')};
`

const SlidingStageWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding-left: 3%;
`

const ButtonWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Button = styled.div`
  width: ${props => props.width}vh;
  height: ${props => h * 0.65}vh;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: ${props => props.marginLeft || 0}vh;
  cursor: ${props => props.cursor || 'pointer'};
  border-radius: ${props => 0.2}vh;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => h * 0.23}vh;
    color ${props => props.color};
    text-transform: uppercase;
    letter-spacing: ${props => 0.1}vh;
    line-height: 1;
  }
`

const ConfirmDeleteWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  background: #212121;
  padding-left: 3%;
  padding-right: 3%;
  transform: translateX(-101%);
`

const DeleteButton = styled.div`
  width: ${props => 12}vh;
  height: ${props => h * 0.6}vh;
  border: ${props => `${0.3}vh solid ${props.backgroundColor}`};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: ${props => props.marginLeft || 0}vh;
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainregular;
    font-size: ${props => h * 0.3}vh;
    text-transform: uppercase;
    color: ${props => props.backgroundColor};
    line-height: 0.9;
  }
`

const SureDeleteMessage = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #212121;
  display: none;
  justify-content: center;
  align-items: center;
  &:after {
    content: '${props => props.text}';
    font-family: pamainregular;
    font-size: ${props => h * 0.4}vh;
    text-transform: uppercase;
    color: #E5E5E5;
    line-height: 0.9;
  }
`

const Text = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => props.size || 3}vh;
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')};
  ${props => (props.italic ? 'font-style: italic;' : '')};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => 0.1}vh;
`

const Highlighted = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
  border: 0.5vh solid red;
`
