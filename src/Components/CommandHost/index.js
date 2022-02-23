import React, { Component, Fragment, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import {
  vhToPx,
  vwToPx,
  vhToPxNum,
  evalImage,
  timestampToDate,
  guid,
} from '@/utils'
import { PACircle } from '@/Components/PACircle'
import ArrowDownIcon from '@/assets/images/host-command-arrow-down.svg'
import PlayTypeIcon from '@/assets/images/preplay-type.png'
import StartEndModal from '@/Components/CommandHost/Common/StartEndModal'
import ErrorPrompt from '@/Components/CommandHost/ErrorPrompt'
import ResetDBPrompt from '@/Components/CommandHost/ResetDBPrompt'
import ResolvedPanel from '@/Components/CommandHost/ResolvedPanel'
import StackPanel from '@/Components/CommandHost/StackPanel'
import NextPanel from '@/Components/CommandHost/NextPanel'
import CurrentPanel from '@/Components/CommandHost/CurrentPanel'
import UnresolvedPanel from '@/Components/CommandHost/UnresolvedPanel'
import AssemblyPanel from '@/Components/CommandHost/AssemblyPanel'
import HeaderPanel from '@/Components/CommandHost/HeaderPanel'
import Preview from '@/Components/Preview'
import MessageModal from '@/Components/CommandHost/Common/MessageModal'
import PrePicksPanel from '@/Components/CommandHost/PrePicksPanel'
import VideoPreview from '@/Components/CommandHost/VideoPreview'
import AutomationBlocker, {
  HeadlessMode,
} from '@/Components/CommandHost/Common/AutomationBlocker'
import ImportPlaystack from '@/Components/ImportPlaystack'
import ResetRecordingModal from '@/Components/CommandHost/Common/ResetRecordingModal'

@inject(
  'PrePlayStore',
  'CommandHostStore',
  'PlayStore',
  'GameStore',
  'AutomationStore'
)
@observer
export default class CommandHost extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    this.state = { gameId: null }
    extendObservable(this, {
      addToStackItem: null,
      preloadItem: null,
      loadItem: null,
      isGameEnded: false,
      selectedTeam: null,
      selectedSponsor: null,
      killPlayRemoved: false,
      isStackScrolling: false,
      announceValues: {},
      renderedResolvedPanel: false,
      gameSelectionComp: null,
      isShownDraggablePreview: false,
      draggablePreviewValue: null,
      videoPlaying: false,
      modal: null,
    })

    //this.props.PrePickStore.pullTeams()

    this.destroyError = intercept(this.props.GameStore, 'isError', change => {
      if (change.newValue) {
        // if (this.ErrorPromptPanel) {
        //   TweenMax.to(this.ErrorPromptPanel, 0.1, {
        //     visibility: 'visible',
        //     opacity: 1,
        //   })
        // }
        window.location.reload(true)
      }
      return change
    })

    /*
    this.destroyResetLoader = intercept(this.props.PlayStore, 'showDatabaseResetLoader', change => {
      if (change.newValue) {
        this.resetDatabaseLoader()
      }
      return change
    })
*/

    this.destroyHasReset = intercept(
      this.props.GameStore,
      'hasReset',
      change => {
        if (change.newValue) {
          TweenMax.to(this.ResetDBPromptPanel, 0.1, {
            opacity: 0,
            onComplete: () => {
              TweenMax.set(this.ResetDBPromptPanel, { visibility: 'hidden' })
            },
          })
        }
        return change
      }
    )

    /*
    this.destroyIsSyncSessionStartInit = intercept(this.props.GameStore, 'syncSessionStartInitResponded', change => {
      if (change.newValue) {
        this.sessionStart(change.newValue)
      }
      return change;
    })

    this.destroyIsSyncSessionStartCancel = intercept(this.props.GameStore, 'syncSessionStartCancelResponded', change => {
      if (change.newValue) {
        this.handleConfirmSessionStart(change.newValue.isConfirmed, 'START', change.newValue.syncGuid)
      }
      return change;
    })
*/

    this.destroyIsSyncSessionStartFinal = intercept(
      this.props.GameStore,
      'syncSessionStartFinalResponded',
      change => {
        if (change.newValue) {
          this.handleConfirmSessionStart(
            change.newValue.isConfirmed,
            'START',
            change.newValue.syncGuid
          )
        }
        return change
      }
    )
  }

  prefetchFile(url, fetchedCallback, progressCallback, errorCallback) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'

    xhr.addEventListener(
      'load',
      function() {
        if (xhr.status === 200) {
          const URL = window.URL || window.webkitURL
          const blob_url = URL.createObjectURL(xhr.response)
          fetchedCallback(blob_url)
        } else {
          errorCallback()
        }
      },
      false
    )

    let prev_pc = 0
    xhr.addEventListener('progress', function(event) {
      if (event.lengthComputable) {
        let pc = Math.round((event.loaded / event.total) * 100)
        if (pc != prev_pc) {
          prev_pc = pc
          progressCallback(pc)
        }
      }
    })

    xhr.send()
  }

  handleSelectTeamClick(index) {
    for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
      const teamButton = this[`team-button-${i}`]
      if (i === index) {
        this.selectedTeam = this.props.PrePlayStore.teams[i]
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

  handleSessionButtonClick(sessionType) {
    if ('start' === sessionType) {
      this.sessionStart()
    } else if ('end' === sessionType) {
      this.sessionEnd()
    } else if ('resume' === sessionType) {
      this.sessionResume()
    } else if ('pause' === sessionType) {
      this.sessionPause()
    }
  }

  handleResetDBClick() {
    if (window.confirm('RESET THIS GAME SESSION?')) {
      TweenMax.to(this.ResetDBPromptPanel, 0.1, {
        visibility: 'visible',
        opacity: 1,
      })

      this.props.GameStore.resetDatabase()
    }
  }

  handleShowPreview(isShow) {
    this.isShownDraggablePreview = isShow
    if (isShow) {
      //this.draggablePreviewValue =
    } else {
      //this.draggablePreviewValue = null
    }
  }

  handleImportPlaystack() {
    const args = {
      gameId: this.props.GameStore.gameId,
      sportType: this.props.GameStore.sportType.code,
      subSportGenre: this.props.GameStore.subSportGenre.code,
    }
    const comp = (
      <ModalWrapper>
        <ImportPlaystack
          //item={this.props.ImportPlaystackStore.values}
          item={args}
          canceled={this.handleCanceled.bind(this)}
        />
      </ModalWrapper>
    )
    this.modal = comp
  }

  handleCanceled() {
    this.modal = null
  }

  handlePreviewValue(val) {
    this.draggablePreviewValue = val
    this.forceUpdate()
  }

  handleControlAutomationClick(args) {
    switch (args) {
      case 'start':
        this.props.AutomationStore.setHasStartedAutomation(true)
        break
      case 'restart':
        /*
        if (this.SessionStartPromptPanel) {
          ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
          let comp = (
            <RestartAutomationModal
              restart={this.handleRestartAutomation.bind(this)}
              cancel={this.handleCancelModal.bind(this)}
            />
          )
          ReactDOM.render(comp, this.SessionStartPromptPanel)

          TweenMax.to(this.SessionStartPromptPanel, 0.1, {
            visibility: 'visible',
          })
        }
*/
        this.props.AutomationStore.setHasRestartedAutomation(true)
        break
      case 'pause':
        this.props.AutomationStore.setHasPausedAutomation(true)
        break
      case 'resume':
        this.props.AutomationStore.setHasResumeAutomation(true)
        break
    }
  }

  handleResetRecording() {
    if (this.SessionStartPromptPanel) {
      ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
      let comp = (
        <ResetRecordingModal
          confirmed={this.handleConfirmedResetRecording.bind(this)}
          cancel={this.handleCancelModal.bind(this)}
        />
      )
      ReactDOM.render(comp, this.SessionStartPromptPanel)

      TweenMax.to(this.SessionStartPromptPanel, 0.1, {
        visibility: 'visible',
      })
    }
  }

  handleRestartAutomation() {
    this.props.AutomationStore.setHasRestartedAutomation(true)
    if (this.SessionStartPromptPanel) {
      this.SessionStartPromptPanel.style.visibility = 'hidden'
      ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
    }
  }

  handleConfirmedResetRecording() {
    this.props.AutomationStore.resetRecording()
    if (this.SessionStartPromptPanel) {
      this.SessionStartPromptPanel.style.visibility = 'hidden'
      ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
    }
  }

  handleCancelModal() {
    if (this.SessionStartPromptPanel) {
      this.SessionStartPromptPanel.style.visibility = 'hidden'
      ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
    }
  }

  handleResetDBClickOLD() {
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

  resetDatabaseLoader() {
    if (this.ResetDBPromptPanel) {
      TweenMax.to(this.ResetDBPromptPanel, 0.1, {
        visibility: 'visible',
        opacity: 1,
      })

      setTimeout(() => {
        window.location.reload(true)
      }, 3000)
    }
  }

  sessionStart(params) {
    if (params) {
      if (!params.syncGuid) {
        this.props.GameStore.syncRequest({
          processName: 'START_INIT',
          syncGuid: guid(),
        })
      }
    } else {
      this.props.GameStore.syncRequest({
        processName: 'START_INIT',
        syncGuid: guid(),
      })
    }

    if (this.SessionStartPromptPanel) {
      ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
      let comp = (
        <StartEndModal
          sessionMode={'START'}
          item={{
            gameId: this.props.GameStore.gameId,
            participants: this.props.GameStore.participants,
            venue: this.props.GameStore.venue,
          }}
          confirm={this.handleConfirmSessionStart.bind(this)}
          automationAddEvent={this.handleAutomationAddEvent.bind(this)}
          headerPlaySequence={this.props.AutomationStore.headerPlaySequence}
        />
      )
      ReactDOM.render(comp, this.SessionStartPromptPanel)

      TweenMax.to(this.SessionStartPromptPanel, 0.1, {
        visibility: 'visible',
      })
    }
  }

  sessionButtonsEnded() {
    this.addToStackItem = null
    this.props.PrePlayStore.sessionButtons['start'] = {
      locked: true,
      backgroundColor: '#000000',
      color: '#c61818',
      text: 'session ended',
    }
    this.props.PrePlayStore.sessionButtons['end'].locked = true
  }

  sessionEnd() {
    //this.props.GameStore.gameEnd()
    //this.sessionButtonsEnded()
    if (this.SessionStartPromptPanel) {
      ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
      /*
      // UNCOMMENT THIS IF YOU WANT TO PREVENT THE GAME TO END THE SESSION
      // WHILE THERE ARE STILL PLAYS IN THE PLAYSTACK...
      let comp = null
      if (
        this.props.PrePlayStore.nextPlayItem &&
        Object.keys(this.props.PrePlayStore.nextPlayItem).length > 0
      ) {
        comp = (
          <MessageModal
            headerPlaySequence={this.props.AutomationStore.headerPlaySequence}
            close={this.handleMessageClose.bind(this)}
            automationAddEvent={this.handleAutomationAddEvent.bind(this)}
          />
        )
      } else {
        comp = (
          <StartEndModal
            sessionMode={'END'}
            item={{
              gameId: this.props.GameStore.gameId,
              participants: this.props.GameStore.participants,
              venue: this.props.GameStore.venue,
            }}
            confirm={this.handleConfirmSessionStart.bind(this)}
            automationAddEvent={this.handleAutomationAddEvent.bind(this)}
            headerPlaySequence={this.props.AutomationStore.headerPlaySequence}
          />
        )
      }
*/
      const comp = (
        <StartEndModal
          sessionMode={'END'}
          item={{
            gameId: this.props.GameStore.gameId,
            participants: this.props.GameStore.participants,
            venue: this.props.GameStore.venue,
          }}
          confirm={this.handleConfirmSessionStart.bind(this)}
          automationAddEvent={this.handleAutomationAddEvent.bind(this)}
          headerPlaySequence={this.props.AutomationStore.headerPlaySequence}
        />
      )
      ReactDOM.render(comp, this.SessionStartPromptPanel)

      TweenMax.to(this.SessionStartPromptPanel, 0.1, {
        visibility: 'visible',
      })
    }
  }

  handleReconnectGameServer() {
    if (this.ErrorPromptPanel) {
      TweenMax.to(this.ErrorPromptPanel, 0.1, {
        opacity: 0,
        delay: 3,
        onComplete: () => {
          TweenMax.set(this.ErrorPromptPanel, { visibility: 'hidden' })
        },
      })
    }
  }

  handleMessageClose() {
    if (this.SessionStartPromptPanel) {
      TweenMax.to(this.SessionStartPromptPanel, 0.1, {
        visibility: 'hidden',
        onComplete: () => {
          ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
        },
      })
    }
  }

  handleAutomationAddEvent(params) {
    this.props.AutomationStore.addEvent(params)
  }

  handleConfirmSessionStart(isConfirmed, sessionMode, syncGuid) {
    if (isConfirmed) {
      if ('START' === sessionMode) {
        this.props.GameStore.gameStart()

        this.props.PrePlayStore.sessionButtons['start'] = {
          locked:
            this.props.GameStore.executionType === 'recording' ? false : true,
          backgroundColor: '#000000',
          color: '#c61818',
          text:
            'recording' === this.props.GameStore.executionType
              ? 'pause'
              : 'in session',
        }

        this.props.PrePlayStore.sessionButtons['end'].locked = false
        this.SessionStartPromptPanel.style.visibility = 'hidden'

        this.props.AutomationStore.startSession()
        this.videoPlaying = true

        if (!syncGuid) {
          this.props.GameStore.syncRequest({
            processName: 'START_FINAL',
            isConfirmed: true,
            syncGuid: guid(),
          })
        }
      } else if ('END' === sessionMode) {
        this.props.AutomationStore.endSession()
        this.props.GameStore.gameEnd()
        this.props.GameStore.setRecordEnded(true)
        this.videoPlaying = false

        this.props.PrePlayStore.sessionButtons['start'] = {
          backgroundColor: '#18c5ff',
          color: '#000000',
          text: 'start session',
          locked: true,
        }

        this.props.PrePlayStore.sessionButtons['end'].locked = true

        if (this.SessionStartPromptPanel) {
          TweenMax.to(this.SessionStartPromptPanel, 0.1, {
            visibility: 'hidden',
            onComplete: () => {
              ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
            },
          })
        }
      }
    } else {
      this.SessionStartPromptPanel.style.visibility = 'hidden'

      if (!syncGuid) {
        this.props.GameStore.syncRequest({
          processName: 'START_CANCEL',
          isConfirmed: false,
          syncGuid: guid(),
        })
      }
    }
    ///////////////////////////////////////////////////////////
    /*
    if ('START' === sessionMode) {
      if (isConfirmed) {

        this.props.GameStore.gameStart()

        this.props.PrePlayStore.sessionButtons['start'] = {
          locked: true,
          backgroundColor: '#000000',
          color: '#c61818',
          text: 'in session',
        }
      }

      this.props.PrePlayStore.sessionButtons['end'].locked = false
      this.SessionStartPromptPanel.style.visibility = 'hidden';

    } else if ('END' === sessionMode) {
      if (isConfirmed) {
       this.props.GameStore.gameEnd()

        this.props.PrePlayStore.sessionButtons['start'] = {
          backgroundColor: '#18c5ff',
          color: '#000000',
          text: 'start session',
          locked: true,
        }

        this.props.PrePlayStore.sessionButtons['end'].locked = true

        if (this.SessionStartPromptPanel) {
          ReactDOM.unmountComponentAtNode(this.SessionStartPromptPanel)
        }
      } else {
        this.props.PrePlayStore.sessionButtons['end'].locked = false
        this.SessionStartPromptPanel.style.visibility = 'hidden';
      }
    }
*/
  }

  sessionResume() {
    this.props.GameStore.gameResume()
    this.props.AutomationStore.startSession()
    this.props.GameStore.setSessionMode(1)
    this.videoPlaying = true
  }

  sessionPause() {
    this.props.GameStore.gamePause()
    this.props.GameStore.setSessionMode(0)
  }

  resetSessionButtons() {
    this.props.PrePlayStore.sessionButtons['start'] = {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'start session',
      locked: true,
    }

    /*
    this.props.PrePlayStore.sessionButtons['session'] = {
      text: '',
      locked: true,
    }

    this.props.PrePlayStore.sessionButtons['interruption'] = {
      text: '',
      locked: true,
    }
*/
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

  handleUnload(e) {
    e.preventDefault()
    this.props.AutomationStore.lastSessionTime()
  }

  componentWillUnmount() {
    this.destroyError()
    this.destroyHasReset()
    window.removeEventListener('beforeunload', this.handleUnload, true)
    this.destroyIsSyncSessionStartFinal()
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.PrePlayStore.nextPlayItem !==
      this.props.PrePlayStore.nextPlayItem
    ) {
      this.setSessionButtonValues({ type: 'start', locked: false })
    }
    if (this.props.GameStore.progress === 'postgame') {
      this.sessionButtonsEnded()
    }
  }

  componentWillMount() {
    //this.props.PlayStore.authenticate({email: 'host@mail.com', password: 'testcommand'})
    //this.props.PlayStore.resetDatabase()
    ////////////this.props.PlayStore.gamesInfo({})
  }

  handleValid(isValid) {
    if (isValid) {
      this.gameSelectionComp = null
    }
  }

  componentDidMount() {
    //this.props.CommandHostStore.getTypeList()
    //this.props.CommandHostStore.getActiveGame('nflfootball')

    // this.gameSelectionComp = (
    //   <ManualGameSelection valid={this.handleValid.bind(this)} />
    // )

    window.addEventListener('beforeunload', this.handleUnload.bind(this), true)
  }

  testConvertDate() {
    let x1 = 1555375446831
    let x2 = 1555375378257
    console.log('MY DATE 1', x1, timestampToDate(x1))
    console.log('MY DATE 2', x2, timestampToDate(x2))

    const diff1 = new Date(timestampToDate(x1))
    const diff2 = new Date(timestampToDate(x2))

    console.log(diff1 - diff2)
  }

  handleContainerClick() {
    //this.props.PlayStore.gamesInfo({})

    /*
      if (this.props.GameStore.currentGameEvent === 'fbnfl') {
        this.props.GameStore.subscribeToGame({operator: 'aurelio', event: 'bbnba'})
        this.props.GameStore.setCurrentGameEvent('bbnba')
      } else {
        this.props.GameStore.subscribeToGame({operator: 'aurelio', event: 'fbnfl'})
        this.props.GameStore.setCurrentGameEvent('fbnfl')
      }
*/
    this.props.GameStore.subscribeToGame({
      operator: 'aurelio',
      event: this.state.gameId,
    })
  }

  handleGameIdChange(e) {
    this.setState({ gameId: e.target.value })
  }

  render() {
    //this.toggleStackScrolling()

    // let isGameEnded =
    //   this.props.PlayStore.game && this.props.PlayStore.game.progress === 4
    //     ? true
    //     : false
    let isGameEnded =
      this.props.GameStore.progress === 'postgame' ||
      this.props.GameStore.progress === 'end'
        ? true
        : false

    if (this.gameSelectionComp) {
      return this.gameSelectionComp
    }

    return (
      <Container>
        {/*
        {'automation' === this.props.GameStore.executionType &&
        !this.props.GameStore.headless ? (
          <Blocker>
            <ActivityIndicator color={'#000000'} height="6" />
            <BlockerMessage text={'bot running in mirror mode...'} />
          </Blocker>
        ) : null}
*/}

        {'recording' === this.props.GameStore.executionType &&
        this.props.GameStore.isRecordEnded ? (
          <Blocker />
        ) : null}

        {'automation' === this.props.GameStore.executionType ? (
          this.props.GameStore.headless ? (
            <HeadlessMode />
          ) : (
            <AutomationBlocker />
          )
        ) : null}

        {'automation' === this.props.GameStore.executionType ? (
          this.props.GameStore.headless ? (
            <HeadlessMode />
          ) : (
            <AutomationBlocker />
          )
        ) : 'recording' === this.props.GameStore.executionType ? (
          <HeadlessMode recording />
        ) : null}

        {/*
        {
          'automation' === this.props.GameStore.executionType ?
            !this.props.GameStore.headless ? (<AutomationBlocker/>) :
              this.props.GameStore.progress === 'postgame' ? (<AutomationBlocker/>) :
                null :
            null
        }
*/}

        <Wrapper>
          <LoadingPanel
            loading={
              this.props.GameStore.isLoading || !this.props.GameStore.gameId
            }
          >
            <LoadingCircleWrapper>
              {/*
              {this.props.GameStore.isLoading &&
              !this.props.GameStore.gameId ? (
                <PACircle size={11} />
              ) : (
                <GameNotFoundMessage>
                  {'automation' === this.props.GameStore.executionType
                    ? 'preparing game event automation. please stand by.'
                    : 'game event not found!'}
                </GameNotFoundMessage>
              )}
*/}

              {this.props.GameStore.isLoading &&
              !this.props.GameStore.gameId ? (
                <PACircle size={11} />
              ) : !this.props.GameStore.gameId ? (
                <GameNotFoundMessage>
                  {'automation' === this.props.GameStore.executionType
                    ? 'preparing game event automation. please stand by.'
                    : 'game event not found!'}
                </GameNotFoundMessage>
              ) : null}
            </LoadingCircleWrapper>
          </LoadingPanel>

          <ResetDBPromptPanel innerRef={ref => (this.ResetDBPromptPanel = ref)}>
            <ResetDBPrompt />
          </ResetDBPromptPanel>
          <ErrorPromptPanel innerRef={ref => (this.ErrorPromptPanel = ref)}>
            <ErrorPrompt
              reconnect={this.handleReconnectGameServer.bind(this)}
            />
          </ErrorPromptPanel>
          <SessionStartPromptPanel
            innerRef={ref => (this.SessionStartPromptPanel = ref)}
          />

          <HeaderPanel
            sessionStartEnd={this.handleSessionButtonClick.bind(this)}
            resetDatabase={this.handleResetDBClick.bind(this)}
            showPreview={this.handleShowPreview.bind(this)}
            importPlaystack={this.handleImportPlaystack.bind(this)}
            control={this.handleControlAutomationClick.bind(this)}
            resetRecording={this.handleResetRecording.bind(this)}
          />

          {/*<div>*/}
          {/*<input value={this.state.gameId || ''} onChange={this.handleGameIdChange.bind(this)} />*/}
          {/*<div  onClick={this.handleContainerClick.bind(this)} >CLICK</div>*/}
          {/*</div>*/}
          <AssemblyPanel previewValue={this.handlePreviewValue.bind(this)} />

          <StackPanel />

          <NextPanel />

          <CurrentPanel />

          <UnresolvedPanel />

          <ResolvedPanel />

          {/*<PrePicksPanel />*/}

          {/*
          <div style={{position: 'relative', background:'#fff', width:'80vh', height:'45.5vh'}}>
            <ReactQuill
              modules={modules}
              formats={formats}
              style={{height:'40vh'}} />
          </div>
*/}

          {this.modal}
        </Wrapper>

        {/*
          FOR VIDEO FOOTAGE PLAYING.
        {
          this.videoPlaying && 'recording' === this.props.GameStore.executionType ? (
            <VideoPreview
              //gameId={this.props.GameStore.gameId}
              //videoPath={this.props.GameStore.videoPath}
              currentTime={this.props.AutomationStore.currentTime}
              lastSessionTime={this.props.GameStore.lastSessionTime}
              videoSource={`https://www.sportocotoday.com/image/${this.props.GameStore.videoPath}`}
            />
          ) : null
        }
*/}

        {this.isShownDraggablePreview ? (
          <Preview
            values={this.draggablePreviewValue}
            teams={this.props.PrePlayStore.teams}
          />
        ) : null}
      </Container>
    )
  }
}

const LazyLoad = lazy(() => {
  return new Promise(resolve => setTimeout(resolve, 5000)).then(() =>
    import('@/Components/CommandHost/UnresolvedPanel')
  )
})

const SuspenseAPI = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve('Panel'), 1000)
  })

const HeadingAPI = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve('Heading'), 5000)
  })

const ParagraphAPI = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve('Paragraph data'), 2000)
  })

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image'],
    ['clean'],
    [{ color: [] }, { background: [] }],
  ],
}

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
]

const h = 5
let FONT_SIZE = '1.8vh'
const stackScrollHeight = 31

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: ${props => 100}vh;
  position: relative;
  letter-spacing: ${props => 0.1}vh;
`

const Wrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: column;
`

const BaseWidth = styled.div`
  width: ${props => 100}vw;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: space-between;
`

const Header = styled.div`
  width: 100%;
  height: ${props => 5}vh;
  //background-color: #f1f2f2;
  //display: flex;
  //flex-direction: row;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  background-color: #ffffff;
`

const RowTeamsWrapper = styled.div`
  width: 40%;
  height: inherit;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const TeamWrapper = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`
const TeamLabel = styled.div`
  width: 100%;
  height: inherit;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10%;
`
const TeamCircleWrapper = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 10%;
`

const TypeButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`

const RowPlayTypes = styled.div`
  width: ${props => 7}vh;
  height: ${props => h}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #414042;
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
`

const RowPlayTypes_ = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #ffffff;
  text-transform: uppercase;
  line-height: 1;
  background-color: #414042;
  &:after {
    content: '${props => props.text}';
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

const SessionRowInfo = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const StartSessionButton = styled.div`
  width: 50%;
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

const EndSessionButton = styled.div`
  width: 50%;
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

const SessionRowButton = styled.div`
  width: ${props => props.width}%;
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
  ${props => (props.marginRight ? `margin-right: ${0.15}vh` : '')};
  &:after {
    content: '${props => props.text}';
  }

  -webkit-filter: ${props =>
    props.locked && !props.inSession ? 'grayscale(1)' : 'grayscale(0)'};
`

const SessionRowIcon = styled.img`
  height: ${props => `${0.5 * h}vh`};
`

const GameType = styled.div`
  width: 25%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 0.1vh solid black;
`

const ResetButton = styled.div`
  width: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ff0000;
  color: #ffffff;
  font-family: pamainextrabold;
  font-size: 2.2vh;
  cursor: pointer;
`

const AddStack_ = styled.div`
  width: 100%;
  height: auto;
  background-color: #000000;
  display: flex;
  padding-top: ${props => 1}vh;
  position: relative;
  z-index: 5;
`

const AddStack = styled.div`
  width: 100%;
  height: 20vh;
  display: flex;
  padding-top: 1vh;
  position: relative;
  z-index: 5;
  background-color: #eaeaea;
`

const SpaceArrow_ = styled.div`
  width: 100%;
  height: ${props => 20}vh;
  background-color: #eaeaea;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    width: ${props => 10}vh;
    height: ${props => 10}vh;
    content: '';
    display: inline-block;
    background-image: url(${ArrowDownIcon});
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
  }
  position: relative;
  z-index: 4;
`

const SpaceArrow = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    width: 8vh;
    height: 8vh;
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
  }
  &::-webkit-scrollbar {
    width: ${props => 1.5}vh;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 0, 0, 0.6);
    &:hover {
      background-color: rgba(255, 0, 0, 1);
    }
  }
`

const StackContainer = styled.div`
  width: 100%;
  background-color: #eaeaea;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 4;
`

const PrePlayStackWrapper = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
`

const PreloadPlayContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eaeaea;
  position: relative;
  padding-top: 0.2vh;
  z-index: 2;
`

const LoadPlayContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #414042;
  position: relative;
  z-index: 1;
`

const LoadPlayContainerInner = styled.div`
  width: 100%;
/*
  padding: ${props => (props.exists ? '5vh' : 0)} 0
    ${props => (props.exists ? '5vh' : 0)} 0;
*/
`

const StartPlayWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #414042;
  padding: ${props => 2}vh 0 ${props => 2}vh 0;
`

const PrePlayStackWrapperEmpty = styled.div`
  width: 100%;
  height: ${props => `${h}vh`};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainlight;
  letter-spacing: 0.2vh;
  font-size: 3vh;
  color: #808285;
  &:after {
    content: 'DRAGGABLE STACK';
  }
`

const AssemblyWrapper = styled.div`
  width: 93vw;
  display: flex;
  flex-direction: column;
`

const LoadPlayCardWrapper = styled.div`
  width: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

const LoadPlayCardButton = styled.div`
  color: #117ecb;
  display: flex;
  font-family: pamainregular;
  font-size: ${props => 3}vh;
  line-height: 1.2;
  letter-spacing: ${props => 0.1}vh;
`

const LoadPlayCardLine = styled.div`
  width: 100%;
  height: ${props => 0.3}vh;
  background-color: #117ecb;
  display: flex;
`

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
`

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
`

const ResolvedWrapper = styled.div`
  background-color: #eaeaea;
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

const AnnouncePanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`

const LoadingPanel = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: ${props => 100}vw;
  min-height: ${props => 100}vh;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 100;
  visibility: ${props => (props.loading ? 'visible' : 'hidden')};
  opacity: ${props => (props.loading ? 1 : 0)};
`
const ModalWrapper = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: ${props => 100}vw;
  min-height: ${props => 100}vh;
  z-index: 3001;
`

const LoadingCircleWrapper = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: ${props => 1}vh;
  top: ${props => 50}vh;
`

const ResetDBPromptPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: ${props => 100}vw;
  min-height: ${props => 100}vh;
  z-index: 100;
  visibility: hidden;
  opacity: 0;
`

const ErrorPromptPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: ${props => 100}vw;
  min-height: ${props => 100}vh;
  z-index: 100;
  visibility: hidden;
  opacity: 0;
`

const SessionStartPromptPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: ${props => 100}vw;
  min-height: ${props => 100}vh;
  z-index: 100;
  visibility: hidden;
  // opacity: 0;
`

const SessionStartPromptx = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: ${props => 100}vw;
  min-height: ${props => 100}vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 100;
  visibility: hidden;
`
const SessionStartPromptInner = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 4vh;

  color: white;
`

const SponsorBrandWrapper = styled.div`
  width: 24vh;
  height: ${props => `${h}vh`};
`

const EndPlayContainer = styled.div`
  width: ${props => 15}vh;
  height: 100%;
  min-height: 100%;
  position: absolute;
  display: flex;
  right: 0;
`

const EndPlayButton = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #c61818;
  font-size: ${props => 2.4}vh;
  color: white;
  cursor: pointer;
  &:after {
    content: 'END PLAY';
  }
  visibility: ${props => (props.locked ? 'hidden' : 'visible')};
`

const GameNotFoundMessage = styled.span`
  font-family: pamainbold;
  font-size: ${props => 4}vh;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: ${props => 0.3}vh;
`

const Blocker = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 99999;
`
