import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept, runInAction } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import DDSession from '@/Components/CommandHost/Common/DDSession'
import DDInterruption from '@/Components/CommandHost/Common/DDInterruption'
import DDSponsorBrand from '@/Components/CommandHost/Common/DDSponsorBrand'
import PlayTypeIcon from '@/assets/images/preplay-type.png'
import PreviewIcon from '@/assets/images/preview-icon.svg'
import Team from '@/Components/Common/TeamIcon'
import { vhToPx, vwToPx, evalImage, guid } from '@/utils'
import DDAutomationController from '@/Components/CommandHost/Common/DDAutomationController'

@inject(
  'PrePlayStore',
  'PlayStore',
  'CommandHostStore',
  'GameStore',
  'AutomationStore',
  'ImportStore'
)
@observer
export default class HeaderPanel extends Component {
  constructor(props) {
    super(props)

    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'

    this._isMounted = false
    this.isShownDraggablePreview = false

    this.automationHeaderButtonStart = null

    this.destroyAddToStackItem = intercept(
      this.props.PrePlayStore,
      'addToStackItem',
      change => {
        if (!change.newValue) {
          this.resetHeaderPrePlayButtons()
        }
        return change
      }
    )

    this.destroyReusePlay = intercept(
      this.props.CommandHostStore,
      'reusePlay',
      change => {
        if (change.newValue) {
          const typeButton = this.props.PrePlayStore.TypeButtons.filter(
            o => o.type === change.newValue.type
          )[0]
          const args = {
            color: typeButton ? typeButton.color : '',
            id:
              'header-button-' +
              (change.newValue.type || 'liveplay').toLowerCase(),
            text: (change.newValue.type || 'liveplay').toLowerCase(),
            type: change.newValue.type || 'LivePlay',
            width: 'announce' === change.newValue.type.toLowerCase() ? 18 : 10,
            announcements: change.newValue.announcements,
            started: null,
            ended: null,
            resultConfirmed: false,
            sponsor: change.newValue.sponsor,
            sponsorId: change.newValue.sponsorId,
          }

          this.handleAddAssemblyClick(args)
        }
        return change
      }
    )

    this.destroyIsSyncCreatePlay = intercept(
      this.props.GameStore,
      'syncSessionCreatePlayResponded',
      change => {
        if (change.newValue) {
          this.syncAssembly(change.newValue)
        }
        return change
      }
    )

    this.destroySyncCreateSession = intercept(
      this.props.GameStore,
      'syncCreateSessionResponded',
      change => {
        if (change.newValue) {
          this.syncSession(change.newValue)
        }
        return change
      }
    )

    this.destroySyncCreateInterruption = intercept(
      this.props.GameStore,
      'syncCreateInterruptionResponded',
      change => {
        if (change.newValue) {
          this.syncInterruption(change.newValue)
        }
        return change
      }
    )

    this.destroySyncHeaderTeamChange = intercept(
      this.props.GameStore,
      'syncHeaderTeamResponded',
      change => {
        if (change.newValue) {
          this.syncHeaderTeamChange(change.newValue)
        }
        return change
      }
    )
  }

  handleImportClick() {
    this.handleSessionButtonClick('import', this.automationHeaderButtonStart)
    this.props.importPlaystack()
  }

  handleShowPreviewClick(refId) {
    this.props.AutomationStore.addEvent({
      evt: 'click',
      refId: refId,
      wait: 0.5,
    })

    if (this.isShownDraggablePreview) {
      this.isShownDraggablePreview = false
      this.props.showPreview(false)
    } else {
      this.isShownDraggablePreview = true
      this.props.showPreview(true)
    }

    if (this._isMounted) {
      this.forceUpdate()
    }
  }

  resetHeaderPrePlayButtons() {
    for (let i = 0; i < this.props.PrePlayStore.TypeButtons.length; i++) {
      if ('Announce' === this.props.PrePlayStore.TypeButtons[i].type) {
        if (this[`type-button-${i}`]) {
          TweenMax.set(this[`type-button-${i}`], {
            color: '#000000',
            borderBottom: `${props => 0.5}vh; solid #000000`,
          })
        }
      }

      if (this[`type-button-${i}`]) {
        TweenMax.set(this[`type-button-${i}`], { backgroundColor: '#f1f2f2' })
      }
    }
  }

  RenderTeams(locked) {
    let comp = []
    if (!this.props.PrePlayStore.isLoading && this.props.PrePlayStore.teams) {
      for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
        const team = this.props.PrePlayStore.teams[i]
        runInAction(() => (team.index = i))
        const automationTeamId = `header-team-${team.teamName}-${this.props.AutomationStore.headerPlaySequence}`
        comp.push(
          <TeamWrapper
            id={automationTeamId}
            key={i}
            onClick={
              locked
                ? null
                : this.handleSelectTeamClick.bind(
                    this,
                    { index: i },
                    automationTeamId
                  )
            }
            innerRef={ref => (this[`team-button-${i}`] = ref)}
            borderRight={i === 0 ? true : false}
          >
            <TeamLabel>{team.teamName}</TeamLabel>
            <TeamCircleWrapper>
              <Team
                teamInfo={team}
                size={3}
                abbrSize={1.5}
                outsideBorderColor={'#000000'}
              />
            </TeamCircleWrapper>
          </TeamWrapper>
        )
      }

      return comp
    }

    return null
  }

  setActivePlayTab(playType) {
    this.props.PrePlayStore.TypeButtons.forEach((b, i) => {
      if (playType === b.type) {
        TweenMax.set(this[`type-button-${i}`], {
          backgroundColor: '#000000',
          color: 'white',
          borderBottom: `${props => 0.5}vh; solid white`,
        })
      } else {
        TweenMax.set(this[`type-button-${i}`], { backgroundColor: '#f1f2f2' })
      }
    })
  }

  syncAssembly(params) {
    params.args.syncGuid = params.syncGuid
    this.handleAddAssemblyClick(params.args, null)
  }

  syncSession(params) {
    params.args.syncGuid = params.syncGuid
    this.handleSessionValue(params.args)
  }

  syncInterruption(params) {
    params.args.syncGuid = params.syncGuid
    this.handleInterruptionValue(params.args)
  }

  syncHeaderTeamChange(params) {
    params.args.syncGuid = params.syncGuid
    this.handleSelectTeamClick(params.args)
  }

  handleAddAssemblyClick(args, refId) {
    if (!args.syncGuid) {
      this.props.GameStore.syncRequest({
        processName: 'CREATE_PLAY',
        syncGuid: guid(),
        args,
      })
    }

    if (refId) {
      this.props.AutomationStore.addEvent({
        evt: 'click',
        refId: refId,
        wait: 1,
      })
      this.props.GameStore.resetSyncCreatePlay()
    }

    if (!this.props.GameStore.gameId) {
      return
    }

    for (let i = 0; i < this.props.PrePlayStore.TypeButtons.length; i++) {
      const btn = this.props.PrePlayStore.TypeButtons[i]
      if (args.type === btn.type) {
        if (btn.type === 'Announce') {
          TweenMax.set(this[`type-button-${i}`], {
            backgroundColor: '#000000',
            color: 'white',
            borderBottom: `${props => 0.5}vh; solid white`,
          })
        } else {
          TweenMax.set(this[`type-button-${i}`], { backgroundColor: '#000000' })
        }
      } else {
        if (btn.type === 'Announce') {
          TweenMax.set(this[`type-button-${i}`], {
            backgroundColor: '#f1f2f2',
            color: 'black',
            borderBottom: `${props => 0.5}vh; solid black`,
          })
        } else {
          TweenMax.set(this[`type-button-${i}`], { backgroundColor: '#f1f2f2' })
        }
      }
    }

    this.props.PrePlayStore.setAddToStackItem(null)
    this.announceValues = []

    const item = {
      index: 0,
      type: args.type,
      playTitle: {},
      choices: [],
      stars: 0,
    }

    if ('Announce' === args.type) {
      item.sponsorExpanded = false
      item.announcements = []

      if (this.announceValues && this.announceValues.length > 0) {
        if (this.props.PrePlayStore.sessionButtons['interruption'].text) {
          this.announceValues[0].value = this.props.PrePlayStore.sessionButtons[
            'interruption'
          ].text
        }
        item.announcements.push(this.announceValues[0])
        item.announcements.push(this.announceValues[1])
        item.announcements.push(this.announceValues[2])
      } else {
        item.announcements.push({ area: 'header', value: '' })
        item.announcements.push({ area: 'middle', value: '' })
        item.announcements.push({ area: 'bottom', value: '' })
      }
    }

    setTimeout(() => {
      this.props.PrePlayStore.setAddToStackItem(item)
    }, 0)
  }

  handleSessionButtonClick(sessionType, refId) {
    this.props.PrePlayStore.setAddToStackItem(null)
    // if ('start' === sessionType) {
    //   this.sessionStart()
    // } else if ('end' === sessionType) {
    //   this.sessionEnd()
    // }

    /*
    if (sessionType === 'start') {
      this.props.sessionStartEnd(sessionType)
    } else {
      if (window.confirm(sessionType.toUpperCase() + ' SESSION?')) {
        this.props.sessionStartEnd(sessionType)
      }
    }
*/

    /*
    if (this.props.PrePlayStore.sessionButtons['start'] && (this.props.PrePlayStore.sessionButtons['start'].text || '').toLowerCase() === 'resume session') {
      this.props.sessionStartEnd('resume')
    } else if (this.props.PrePlayStore.sessionButtons['start'] && (this.props.PrePlayStore.sessionButtons['start'].text || '').toLowerCase() === 'pause') {
      this.props.sessionStartEnd('pause')
    } else {
      this.props.AutomationStore.addEvent({evt:'click', refId: refId, wait: 2, isIncrementHeaderPlaySequence: true})

      this.props.sessionStartEnd(sessionType)
    }
*/

    if ('start' === sessionType.toLowerCase()) {
      if (
        this.props.PrePlayStore.sessionButtons['start'] &&
        (
          this.props.PrePlayStore.sessionButtons['start'].text || ''
        ).toLowerCase() === 'resume session'
      ) {
        this.props.sessionStartEnd('resume')
      } else if (
        this.props.PrePlayStore.sessionButtons['start'] &&
        (
          this.props.PrePlayStore.sessionButtons['start'].text || ''
        ).toLowerCase() === 'pause'
      ) {
        this.props.sessionStartEnd('pause')
      } else {
        this.props.AutomationStore.addEvent({
          evt: 'click',
          refId: refId,
          wait: 2,
          isIncrementHeaderPlaySequence: true,
        })
        this.props.sessionStartEnd(sessionType)
      }
    } else if ('end' === sessionType.toLowerCase()) {
      this.props.AutomationStore.addEvent({
        evt: 'click',
        refId: refId,
        wait: 2,
        isIncrementHeaderPlaySequence: true,
      })
      this.props.sessionStartEnd(sessionType)
    } else if ('import' === sessionType.toLowerCase()) {
      if (
        this.props.PrePlayStore.sessionButtons['start'] &&
        (
          this.props.PrePlayStore.sessionButtons['start'].text || ''
        ).toLowerCase() === 'pause'
      ) {
        this.props.sessionStartEnd('pause')
      }
    }
  }

  handleAutomationAddEvent(params) {
    this.props.AutomationStore.addEvent(params)
  }

  handleSessionValue(val) {
    if (!val.syncGuid) {
      this.props.GameStore.syncRequest({
        processName: 'CREATE_SESSION',
        syncGuid: guid(),
        args: val,
      })
    }

    this.props.GameStore.resetSyncCreatePlay()

    this.props.PrePlayStore.sessionButtons['session'].text = val.name

    if (val.name) {
      this.announceValues = [
        { area: 'header', value: val.header },
        {
          area: 'middle',
          value: val.middle,
        },
        {
          area: 'bottom',
          value: val.bottom,
        },
      ]
    } else {
      this.announceValues = [
        { area: 'header', value: '' },
        { area: 'middle', value: '' },
        { area: 'bottom', value: '' },
      ]
    }

    this.props.PrePlayStore.setAddToStackItem(null)
    this.setActivePlayTab('Announce')
    setTimeout(() => {
      let item = {
        index: 0,
        type: 'Announce',
        playTitle: '',
        choices: [],
        stars: 0,
        announcements: [],
      }

      item.announcements.push(this.announceValues[0])
      item.announcements.push(this.announceValues[1])
      item.announcements.push(this.announceValues[2])

      this.props.PrePlayStore.setAddToStackItem(item)
    }, 0)
  }

  handleInterruptionValue(val) {
    if (!val.syncGuid) {
      this.props.GameStore.syncRequest({
        processName: 'CREATE_INTERRUPTION',
        syncGuid: guid(),
        args: val,
      })
    }

    this.props.GameStore.resetSyncCreatePlay()

    if (val.name) {
      this.announceValues = [
        { area: 'header', value: val.header },
        {
          area: 'middle',
          value: val.middle,
        },
        {
          area: 'bottom',
          value: val.bottom,
        },
      ]
    } else {
      this.announceValues = [
        { area: 'header', value: '' },
        { area: 'middle', value: '' },
        { area: 'bottom', value: '' },
      ]
    }

    this.props.PrePlayStore.setAddToStackItem(null)
    this.setActivePlayTab('Announce')
    setTimeout(() => {
      let item = {
        index: 0,
        type: 'Announce',
        playTitle: '',
        choices: [],
        stars: 0,
        announcements: [],
      }

      item.announcements.push(this.announceValues[0])
      item.announcements.push(this.announceValues[1])
      item.announcements.push(this.announceValues[2])

      this.props.PrePlayStore.setAddToStackItem(item)
    }, 0)
  }

  handleSelectedSponsor(val) {
    this.props.PrePlayStore.setSelectedSponsor(val)
  }

  resetSessionButtons() {
    this.props.PrePlayStore.sessionButtons['start'] = {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'start session',
      locked: true,
    }
  }

  handleSelectTeamClick(params, automationTeamId) {
    if (!params.syncGuid) {
      this.props.GameStore.syncRequest({
        processName: 'HEADER_TEAM_CHANGE',
        syncGuid: guid(),
        operator: this.props.GameStore.operator,
        args: { comp: 'header_team', index: params.index, automationTeamId },
      })
    }

    if (automationTeamId) {
      this.props.AutomationStore.addEvent({
        evt: 'click',
        refId: automationTeamId,
        wait: 0.5,
        isIncrementHeaderPlaySequence: true,
      })
    }

    for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
      const teamButton = this[`team-button-${i}`]
      if (i === params.index) {
        this.props.PrePlayStore.setSelectedTeam(
          this.props.PrePlayStore.teams[i]
        )
        TweenMax.set(teamButton, {
          backgroundColor: '#18c5ff',
          color: '#ffffff',
        })
        this.forceUpdate()
      } else {
        TweenMax.set(teamButton, {
          backgroundColor: '#ffffff',
          color: '#000000',
        })
      }
    }
  }

  handleResetDBClick() {
    this.props.resetDatabase()
  }

  handleResetDBClickX1() {
    if (window.confirm('RESET DATABASE?')) {
      if (this.ResetDBPromptPanel) {
        TweenMax.to(this.ResetDBPromptPanel, 0.1, {
          visibility: 'visible',
          opacity: 1,
        })

        this.props.PlayStore.resetDatabase(next => {
          if (next) {
            TweenMax.to(this.ResetDBPromptPanel, 0.1, {
              opacity: 0,
              onComplete: () => {
                TweenMax.set(this.ResetDBPromptPanel, { visibility: 'hidden' })
              },
            })

            window.open('', '_self', '').close()
            setTimeout(() => {
              window.location.reload(true)
            }, 0)
          } else {
            TweenMax.to(this.ResetDBPromptPanel, 0.1, {
              opacity: 0,
              onComplete: () => {
                TweenMax.set(this.ResetDBPromptPanel, { visibility: 'hidden' })
                if (this.ErrorPromptPanel) {
                  TweenMax.to(this.ErrorPromptPanel, 0.1, {
                    visibility: 'visible',
                    opacity: 1,
                  })
                }
              },
            })
          }
          window.location.reload(true)
        })
      }

      this.resetSessionButtons()
    }
  }

  handleControlClick(automationAction) {
    this.props.control(automationAction)
  }

  handleRecordingResetClick() {
    this.props.resetRecording()
  }

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    this._isMounted = false
    this.destroyAddToStackItem()
    this.destroyReusePlay()
    this.destroyIsSyncCreatePlay()
    this.destroySyncCreateSession()
    this.destroySyncCreateInterruption()
    this.destroySyncHeaderTeamChange()
  }

  componentDidMount() {
    this._isMounted = true
  }

  render() {
    // let isGameEnded =
    //   this.props.PlayStore.game && this.props.PlayStore.game.progress === 4
    //     ? true
    //     : false

    //let isGameEnded = this.props.GameStore.progress === 'postgame' || this.props.GameStore.progress === 'end'
    /*
    let isGameEnded = this.props.GameStore.dateEndSession ||
                      this.props.GameStore.progress === 'postgame' ||
                      this.props.GameStore.progress === 'end' ||
                      (this.props.GameStore.recordedPlays.length > 2 && 'recording' === this.props.GameStore.executionType) ||
                      this.props.GameStore.isGamePause
*/

    let isGameEnded = this.props.GameStore.disableHeader
    let isImportLocked =
      this.props.GameStore.executionType === 'automation' ||
      this.props.GameStore.progress === 'postgame' ||
      this.props.GameStore.progress === 'ended'

    let isNotYetReadyToStart = this.props.GameStore.isLeap
      ? false
      : 'active, public, pregame'.match(
          new RegExp(this.props.GameStore.progress, 'gi')
        )

    this.automationHeaderButtonStart = `header-button-start-${this.props.AutomationStore.headerPlaySequence}`
    //const automationHeaderButtonEnd = `header-button-end-${this.props.AutomationStore.headerPlaySequence}`
    const automationHeaderButtonEnd = 'header-button-end'
    const automationPreviewButton = `header-preview-button-${this.props.AutomationStore.headerPlaySequence}`
    const automationPlaySequence = this.props.AutomationStore.playSequence

    return (
      <Header>
        <BaseWidth>
          <RowTeamsWrapper>{this.RenderTeams(isGameEnded)}</RowTeamsWrapper>
          <ImportButton
            isGameEnded={isImportLocked}
            onClick={isImportLocked ? null : this.handleImportClick.bind(this)}
            title="IMPORT"
          />
          <TypeButtonsWrapper>
            {this.props.PrePlayStore.TypeButtons.map((button, index) => {
              const refIdButton = `${button.id}-${automationPlaySequence}`
              return (
                <RowButton
                  id={refIdButton}
                  innerRef={ref => (this[`type-button-${index}`] = ref)}
                  key={index}
                  isGameEnded={isGameEnded}
                  text={button.text}
                  width={button.width}
                  color={button.color}
                  backgroundColor={'#f1f2f2'}
                  onClick={
                    isGameEnded
                      ? null
                      : this.handleAddAssemblyClick.bind(
                          this,
                          button,
                          refIdButton
                        )
                  }
                />
              )
            })}
          </TypeButtonsWrapper>
          <PreviewButton
            id={automationPreviewButton}
            backgroundColor={
              this.isShownDraggablePreview ? '#008000' : '#c61818'
            }
            onClick={
              isGameEnded
                ? null
                : this.handleShowPreviewClick.bind(
                    this,
                    automationPreviewButton
                  )
            }
          />
          {'automation' === this.props.GameStore.executionType &&
          this.props.GameStore.headless ? (
            <ControlAutomationWrap width="5">
              <DDAutomationController
                baseWidth="5"
                control={this.handleControlClick.bind(this)}
              />
            </ControlAutomationWrap>
          ) : 'recording' === this.props.GameStore.executionType ? (
            <ControlAutomationWrap width="5">
              <RecordingResetButton
                title="RESET"
                onClick={this.handleRecordingResetClick.bind(this)}
              />
            </ControlAutomationWrap>
          ) : null}
          <StartSessionButton
            id={this.automationHeaderButtonStart}
            text={this.props.PrePlayStore.sessionButtons['start'].text}
            color={this.props.PrePlayStore.sessionButtons['start'].color}
            backgroundColor={
              isNotYetReadyToStart
                ? '#b0b0b0'
                : this.props.PrePlayStore.sessionButtons['start']
                    .backgroundColor
            }
            locked={
              this.props.GameStore.isRecordEnded
                ? true
                : 'recording' === this.props.GameStore.executionType
                ? false
                : isNotYetReadyToStart
                ? true
                : this.props.PrePlayStore.sessionButtons['start'].locked
            }
            inSession={
              this.props.PrePlayStore.sessionButtons['start'].text ===
              'in session'
                ? true
                : false
            }
            onClick={
              this.props.GameStore.isRecordEnded
                ? null
                : 'recording' === this.props.GameStore.executionType
                ? this.handleSessionButtonClick.bind(
                    this,
                    'start',
                    this.automationHeaderButtonStart
                  )
                : this.props.PrePlayStore.sessionButtons['start'].locked
                ? null
                : isNotYetReadyToStart
                ? null
                : this.handleSessionButtonClick.bind(
                    this,
                    'start',
                    this.automationHeaderButtonStart
                  )
            }
          />
          <DDSessionWrap>
            <DDSession
              //locked={this.props.PrePlayStore.sessionButtons['session'].locked}
              locked={isGameEnded}
              index={0}
              readonlyValue={
                this.props.PrePlayStore.sessionButtons['session'].text
              }
              value={this.handleSessionValue.bind(this)}
              automationAddEvent={this.handleAutomationAddEvent.bind(this)}
            />
          </DDSessionWrap>
          <DDSessionWrap>
            <DDInterruption
              //locked={this.props.PrePlayStore.sessionButtons['interruption'].locked}
              locked={isGameEnded}
              index={0}
              readonlyValue={
                this.props.PrePlayStore.sessionButtons['interruption'].value
              }
              value={this.handleInterruptionValue.bind(this)}
              automationAddEvent={this.handleAutomationAddEvent.bind(this)}
            />
          </DDSessionWrap>
          <SponsorBrandWrapper>
            <DDSponsorBrand
              item={null}
              locked={isGameEnded}
              height={h}
              index={'header-0'}
              value={this.handleSelectedSponsor.bind(this)}
              automationAddEvent={this.handleAutomationAddEvent.bind(this)}
              isHeader={true}
            />
          </SponsorBrandWrapper>
          <EndSessionButton
            id={automationHeaderButtonEnd}
            text={this.props.PrePlayStore.sessionButtons['end'].text}
            color={this.props.PrePlayStore.sessionButtons['end'].color}
            backgroundColor={
              this.props.PrePlayStore.sessionButtons['end'].backgroundColor
            }
            locked={this.props.PrePlayStore.sessionButtons['end'].locked}
            onClick={
              this.props.PrePlayStore.sessionButtons['end'].locked
                ? null
                : this.handleSessionButtonClick.bind(
                    this,
                    'end',
                    automationHeaderButtonEnd
                  )
            }
          />
          <GameType>{this.props.GameStore.gameId}</GameType>
          {/*<GameType>{this.props.AutomationStore.currentTime}</GameType>*/}
          {/*<GameType>{this.props.AutomationStore.headerPlaySequence} {this.props.AutomationStore.currentTime}</GameType>*/}
          {/*<GameType>{'NAV ' + navigator.webdriver + ' - ' + this.props.GameStore.executionType}</GameType>*/}

          {/*TO BE DELETED <ResetButton onClick={this.handleResetDBClick.bind(this)}>*/}
          {/*  RESET DB*/}
          {/*</ResetButton>*/}
        </BaseWidth>

        {(!this.props.GameStore.dateEndSession ||
          !this.props.GameStore.isRecordEnded) &&
        this.props.GameStore.sessionMode &&
        (!this.props.PrePlayStore.preplayItems ||
          (this.props.PrePlayStore.preplayItems &&
            this.props.PrePlayStore.preplayItems.length < 1)) &&
        !this.props.PrePlayStore.nextPlayItem ? (
          <Tooltip>
            <span>PRESS END SESSION TO END THE GAME COMPLETELY.</span>
            <Arrow></Arrow>
          </Tooltip>
        ) : null}
      </Header>
    )
  }
}

const h = 5
let FONT_SIZE = '1.8vh'

const Header = styled.div`
  width: 100%;
  height: ${props => h}vh;
  //background-color: #f1f2f2;
  //display: flex;
  //flex-direction: row;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  background-color: #ffffff;
`

const BaseWidth = styled.div`
  //width: 93vw;
  width: ${props => 100}vw;
  background-color: ${props => props.backgroundColor};
  display: flex;
  //justify-content: space-between;
  flex-direction: row;
`

const RowTeamsWrapper = styled.div`
  width: 14%;
  height: inherit;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const TypeButtonsWrapper = styled.div`
  width: 30%;
  display: flex;
  flex-direction: row;
`

const PreviewButton = styled.div`
  width: 2.5%;
  min-width: 2.5%;
  height: ${props => 5}vh;
  background-image: url(${PreviewIcon});
  background-repeat: no-repeat;
  background-size: 70%;
  background-position: center;
  background-color: ${props => props.backgroundColor};
  cursor: pointer;
/*
  background-color: #f1f2f2;
  &:after {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: #008000;
    -webkit-mask-image: url(${PreviewIcon});
    -webkit-mask-size: 50%;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-image: url(${PreviewIcon});
    mask-size: 60%
    mask-repeat: no-repeat;
    mask-position: center;
  }
*/
`

const SessionRowInfo = styled.div`
  width: 35%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const StartSessionButton = styled.div`
  width: 8%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: ${props => props.color || '#969696'};
  background-color: ${props => props.backgroundColor};
  text-transform: uppercase;
  line-height: 1;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: '${props => props.text}';
  }
  -webkit-filter: ${props =>
    props.locked && !props.inSession ? 'grayscale(1)' : 'grayscale(0)'};
`

const ImportButton = styled.div`
  width: 3%;
  height: ${props => h}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #414042;
  cursor: ${props => (props.isGameEnded ? 'default' : 'pointer')};
  &:after {
    width: ${props => 35}vh;
    height: ${props => h}vh;
    content: '';
    display: inline-block;
    background-image: url(${PlayTypeIcon});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
  &:hover:after {
    ${props => (props.isGameEnded ? `` : `background-size: 80%;`)};
  }
`

const RowButton = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: ${props => props.color || '#969696'};
  background-color: ${props => props.backgroundColor};
  text-transform: uppercase;
  line-height: 1;
  cursor: ${props => (props.isGameEnded ? 'default' : 'pointer')};
  &:after {
    content: '${props => props.text}';
  }

  border-bottom: ${props => 0.5}vh solid ${props => props.color};
`

const SponsorBrandWrapper = styled.div`
  width: 13%;
  height: ${props => h}vh;
  position: relative;
`

const EndSessionButton = styled.div`
  width: 8%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: ${props => props.color || '#969696'};
  background-color: ${props => props.backgroundColor};
  text-transform: uppercase;
  line-height: 1;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: '${props => props.text}';
  }
  -webkit-filter: ${props =>
    props.locked && !props.inSession ? 'grayscale(1)' : 'grayscale(0)'};
`

const GameType = styled.div`
  width: 15.5%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
`

const ResetButton = styled.div`
  width: 15%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ff0000;
  color: #ffffff;
  font-family: pamainextrabold;
  font-size: ${props => FONT_SIZE};
  cursor: pointer;
`

const TeamWrapper = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: #ffffff;
  display: flex;
  //justify-content: space-between;
  flex-direction: row;
  justify-content: center;
  cursor: pointer;
  ${props =>
    props.borderRight ? `border-right: ${vwToPx(0.1)} solid #c0c0c0;` : ``};
`

const TeamLabel = styled.div`
  //width: 100%;
  height: inherit;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  //padding-left: 10%;
  margin-right: ${props => vwToPx(0.2)};
`
const TeamCircleWrapper = styled.div`
  //width: 100%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  //padding-right: 10%;
`

const DDSessionWrap = styled.div`
  width: 3%;
  height: 100%;
  position: relative;
`

const ControlAutomationWrap = styled.div`
  width: ${props => props.width}vh;
  height: inherit;
  display: flex;
`

const RecordingResetButton = styled.div`
  width: 100%;
  height: inherit;
  background-color: #d3d3d3;
  cursor: pointer;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${props => evalImage('record-reset-icon.svg')});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
  &:hover:after {
    animation: ${props => imgRotate} 5s linear infinite;
  }
`

const imgRotate = keyframes`
  to {
    transform: rotate(-360deg);
  }
`

const Tooltip = styled.div`
  top: 7vh;
  left: 63vw;
  padding: 2vh 3vh;
  // color:#444444;
  // background-color:#EEEEEE;
  color: #fff;
  background-color: #ff0000;
  font-family: pamainregular;
  font-weight: normal;
  font-size: 2.2vh;
  border-radius: 1vh;
  position: absolute;
  z-index: 10;

  box-sizing: border-box;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;
`

const Arrow = styled.div`
  position: absolute;
  bottom: 100%;
  left: 70%;
  width: 4vh;
  height: 2vh;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    width: 2vh;
    height: 2vh;
    left: 50%;
    transform: translate(-50%, 50%) rotate(45deg);
    background-color: #ff0000;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
  }
`
