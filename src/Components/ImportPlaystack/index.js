import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx, evalImage } from '@/utils'
import { extendObservable, intercept } from 'mobx'
import { inject, observer } from 'mobx-react'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
import GameEventItem from './GameEventItem'
import TeamIcon from './ImportTeamIcon'
import ImportExportArrowsIcon from '@/assets/images/import-export-arrows.svg'
import FilterComp from './FilterComp'
import dateFormat from 'dateformat'

@inject('ImportStore', 'GameStore')
@observer
export default class ImportPlaystack extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      events: null,
      isFindingEvents: false,
      isFinding: false,
      selectedGameEvent: null,
      activityIndicator: null,
      started: false,
      playstack: [],
      selectedPlaysCount: 0,
      confirmMessage: null,
      error: null,
    })

    this.sportTypes = []
  }

  handleCancelClick() {
    this.props.canceled()
  }

  handlePlaystackCheckChange(e) {
    if (e.target.checked) {
      this.playstack.forEach((play, idx) => {
        play.checked = 1
        this[`play-checkbox${idx}`].checked = 1
      })
      this.selectedPlaysCount = this.playstack.length
    } else {
      this.playstack.forEach((play, idx) => {
        play.checked = 0
        this[`play-checkbox${idx}`].checked = 0
      })
      this.selectedPlaysCount = 0
    }
  }

  handlePlayCheckChange(idx, e) {
    this.playstack[idx].checked = e.target.checked ? 1 : 0
    this.selectedPlaysCount = e.target.checked
      ? this.selectedPlaysCount + 1
      : this.selectedPlaysCount - 1
    if (this.playstack.length === this.selectedPlaysCount) {
      if (this.playCheckboxHeader) {
        this.playCheckboxHeader.checked = 1
      }
    } else if (this.playstack.length > this.selectedPlaysCount) {
      if (this.playCheckboxHeader) {
        this.playCheckboxHeader.checked = 0
      }
    }
  }

  handleConfirm(mode) {
    if (mode) {
      this.confirmMessage = null
      this.executeImport()
    } else {
      this.confirmMessage = null
    }
  }

  handleImportClick() {
    this.confirmMessage = (
      <ConfirmMessage
        confirm={this.handleConfirm.bind(this, 1)}
        cancel={this.handleConfirm.bind(this, 0)}
      />
    )
  }

  executeImport() {
    if (this.refImportButton) {
      this.refImportButton.style.pointerEvents = 'none'
      document.styleSheets[0].addRule(
        '#ref-import-button:before',
        'content: "import started";'
      )
    }
    if (this.refCancelButton) {
      this.refCancelButton.style.pointerEvents = 'none'
      this.refCancelButton.style.opacity = 0.2
    }
    if (this.refContinueLabel) {
      this.refContinueLabel.innerHTML = 'started importing. please wait...'
    }

    this.activityIndicator = <ActivityIndicator height={5} color={'#ffffff'} />
    this.started = true

    this.props.ImportStore.importPlaystack({
      source: this.selectedGameEvent.gameId,
      destination: this.props.item.gameId,
      playsToImport: this.playstack,
    }).then(res => {
      if (res && res.playCount > 0) {
        this.selectedGameEvent = null
        this.playstack = null
      }

      this.started = false

      if (this.refImportButton) {
        this.refImportButton.style.pointerEvents = 'none'
        this.refImportButton.style.display = 'none'
        document.styleSheets[0].addRule(
          '#ref-import-button:before',
          'content: "import playstack";'
        )
      }
      if (this.refCancelButton) {
        this.refCancelButton.style.pointerEvents = 'auto'
        this.refCancelButton.style.opacity = 1
      }
      this.activityIndicator = null
    })
  }

  refHandleSelectedGameEvent(gameEvent) {
    this.isFinding = true
    this.selectedGameEvent = null

    this.props.ImportStore.getGamePlaysByGameId({ gameId: gameEvent.gameId })
      .then(async response => {
        if (response && response.length > 0) {
          this.props.ImportStore.setSelectedGameId(gameEvent.gameId)
          this.selectedGameEvent = gameEvent

          for (let i = 0; i < response[0].length; i++) {
            response[0][i].choices = []
            if (response[1] && Array.isArray(response[1])) {
              const qs = await response[1].filter(
                o =>
                  o.game_play_id === response[0][i].game_play_id &&
                  o.preset !== 'multiplier'
              )[0]
              if (qs) {
                if (response[2] && Array.isArray(response[2])) {
                  const arr_sqs = await response[2].filter(
                    o => o.question_id === qs.question_id
                  )
                  if (arr_sqs && Array.isArray(arr_sqs)) {
                    arr_sqs.forEach(c => {
                      response[0][i].choices.push(c)
                    })
                  }
                }
              }
            }
          }

          this.playstack = await response[0]
        }
      })
      .finally(_ => {
        this.isFinding = false
      })
  }

  handleDoFilter(args) {
    /*
    this.isFindingEvents = true
    this.selectedGameEvent = null
    this.props.ImportStore.getEventsBySportType({
      sportType: this.props.item.sportType,
      subSportGenre: this.props.item.subSportGenre,
      excludedGameId: this.props.item.gameId,
    })
      .then(data => {
        this.isFindingEvents = false
        this.events = data
      })
      .catch(err => {
        this.isFindingEvents = false
        this.showErrorPage = true
      })
*/

    this.error = null
    this.events = []

    const requiredArgs = []
    const argsFilter = JSON.parse(JSON.stringify(args))
    if (!argsFilter.subSportGenre) {
      requiredArgs.push('SPORT TYPE')
    }

    let tmpErr = ''
    if (requiredArgs.length > 0) {
      tmpErr =
        '<span style="font-family: pamainbold;font-size: 2.5vh">REQUIRED FIELDS:</span>'
      tmpErr =
        tmpErr + '<ul style="font-family: pamainregular;font-size: 2.5vh">'
      requiredArgs.forEach(r => {
        tmpErr = tmpErr + `<li>${r}</li>`
      })
      tmpErr = tmpErr + '</ul>'

      this.error = tmpErr

      return
    }

    argsFilter.startDate = argsFilter.startDate
      ? dateFormat(argsFilter.startDate, 'yyyy-mm-dd')
      : ''
    argsFilter.endDate = argsFilter.endDate
      ? dateFormat(argsFilter.endDate, 'yyyy-mm-dd')
      : ''

    this.isFindingEvents = true
    this.selectedGameEvent = null
    this.props.ImportStore.getEventsBySportType(argsFilter)
      .then(data => {
        this.isFindingEvents = false
        this.events = data
      })
      .catch(err => {
        this.isFindingEvents = false
        this.showErrorPage = true
      })
  }

  render() {
    let { item } = this.props

    return (
      <Container>
        <Wrapper>
          {this.confirmMessage}
          <Section justifyContent="space-between" style={{ height: '95%' }}>
            <Section
              className="left-panel"
              direction="column"
              widthInPct="40"
              style={{ position: 'relative' }}
            >
              {this.isFindingEvents ? (
                <Blocker backgroundColor="transparent" />
              ) : null}
              <FilterSection>
                <FilterComp
                  args={{
                    sportType: this.props.item.sportType,
                    subSportGenre: this.props.item.subSportGenre,
                  }}
                  doFilter={this.handleDoFilter.bind(this)}
                />
              </FilterSection>

              {this.error ? (
                <Section>
                  <div
                    style={{
                      color: '#C61818',
                      marginLeft: '4vh',
                      marginTop: '2vh',
                    }}
                    dangerouslySetInnerHTML={{ __html: this.error }}
                  ></div>
                </Section>
              ) : this.isFindingEvents ? (
                <Section
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  style={{ width: '100%', height: '100%' }}
                >
                  <ActivityIndicator color={'#d3d3d3'} height={5} />
                  <Label size="2.5" color={'#d3d3d3'} uppercase>
                    fetching game events. please wait...
                  </Label>
                </Section>
              ) : this.events && this.events.length > 0 ? (
                <Section direction="row" justifyContent="center" marginTop="3">
                  {(this.events || []).map((item, idx) => {
                    return (
                      <GameEventItemWrap
                        key={`importplaystack-${item.keyEventType}-${item.keySportType.code}`}
                        marginRight={idx === 0 ? 1 : 0}
                        width={65 * 0.9 + 'vh'}
                      >
                        {this.started ? <Blocker key={`blocker-idx`} /> : null}
                        <GameEventItem
                          eventItem={item}
                          selectedGameEvent={this.refHandleSelectedGameEvent.bind(
                            this
                          )}
                          scaleSize={0.9}
                          forImport
                        />
                      </GameEventItemWrap>
                    )
                  })}
                </Section>
              ) : !this.events ? null : (
                <Section
                  justifyContent="center"
                  alignItems="center"
                  style={{ height: '100%' }}
                >
                  <Label
                    font="pamainregular"
                    size="3"
                    color={'#d3d3d3'}
                    uppercase
                  >
                    GAME EVENT(S) NOT FOUND.
                  </Label>
                </Section>
              )}
            </Section>

            <Section
              className="middle-panel"
              widthInPct="0.1"
              style={{ backgroundColor: '#d3d3d3', height: '95%' }}
            />

            <Section
              className="right-panel"
              widthInPct="60"
              style={{ position: 'relative' }}
            >
              {this.selectedGameEvent ? (
                <Section direction="column">
                  <Section justifyContent="center">
                    <Label
                      font="pamainregular"
                      size="3"
                      color={'#d3d3d3'}
                      uppercase
                    >
                      you are attempting to import playstack from:
                    </Label>
                  </Section>
                  <Section justifyContent="center" marginTop="2">
                    <Label
                      font={'pamainregular'}
                      size={3}
                      color={'#d3d3d3'}
                      uppercase
                      nowrap
                    >
                      {this.selectedGameEvent.gameId}
                    </Label>
                  </Section>
                  <Section
                    justifyContent={'center'}
                    flexDirection={'row'}
                    marginTop={1.5}
                  >
                    <TeamSection>
                      <TeamIconWrap>
                        <TeamIcon
                          teamInfo={this.selectedGameEvent.participants[0]}
                          size={3}
                          outsideBorderColor={'#ffffff'}
                          outsideBorderWidth={0.2}
                        />
                        &nbsp;
                        <Label
                          font={'pamainlight'}
                          size={3}
                          marginBottom={3}
                          color={'#d3d3d3'}
                          uppercase
                          nospacing
                        >
                          {this.selectedGameEvent.participants[0].name}
                        </Label>
                      </TeamIconWrap>
                      <TeamVS>
                        <Label font={'pamainextrabold'} size={2} uppercase>
                          &nbsp;&nbsp;vs&nbsp;&nbsp;
                        </Label>
                      </TeamVS>
                      <TeamIconWrap>
                        <TeamIcon
                          teamInfo={this.selectedGameEvent.participants[1]}
                          size={3}
                          outsideBorderColor={'#ffffff'}
                          outsideBorderWidth={0.2}
                        />
                        &nbsp;
                        <Label
                          font={'pamainlight'}
                          size={3}
                          marginBottom={3}
                          color={'#d3d3d3'}
                          uppercase
                          nospacing
                        >
                          {this.selectedGameEvent.participants[1].name}
                        </Label>
                      </TeamIconWrap>
                    </TeamSection>
                  </Section>
                  <Section justifyContent="center" marginTop="1.5">
                    <Label
                      font="pamainlight"
                      size="2"
                      color={'#d3d3d3'}
                      uppercase
                    >{`total number of play(s): ${this.selectedGameEvent.playCount}`}</Label>
                  </Section>

                  <Section direction="column" alignItems="center" marginTop={1}>
                    <PlayHeader>
                      <PlayCheckBox widthInPct="4.5" backgroundColor={'#000'}>
                        <input
                          type="checkbox"
                          onChange={this.handlePlaystackCheckChange.bind(this)}
                          ref={ref => (this.playCheckboxHeader = ref)}
                        />
                      </PlayCheckBox>
                      <div style={{ width: '100%' }} />
                    </PlayHeader>
                    <ScrollingPlayWrap>
                      <ContentPlayWrap>
                        {(this.playstack || []).map((play, idx) => {
                          return (
                            <PlayCompWrap
                              key={`play-comp-${play.game_play_id}`}
                            >
                              <PlayCheckBox widthInPct="5">
                                <input
                                  type="checkbox"
                                  value={play.checked}
                                  ref={ref =>
                                    (this[`play-checkbox${idx}`] = ref)
                                  }
                                  onChange={this.handlePlayCheckChange.bind(
                                    this,
                                    idx
                                  )}
                                />
                              </PlayCheckBox>
                              <PlayComp item={play} />
                            </PlayCompWrap>
                          )
                        })}
                      </ContentPlayWrap>
                    </ScrollingPlayWrap>
                  </Section>
                  <Section justifyContent="center" marginTop="1.5">
                    <Label
                      font="pamainlight"
                      size="2"
                      color={'#d3d3d3'}
                      uppercase
                    >{`selected play(s): ${this.selectedPlaysCount}`}</Label>
                  </Section>
                  {/*
                    <Section justifyContent="center" marginTop="6">
                      <Label
                        font="pamainregular"
                        size="2.5"
                        color={'#d3d3d3'}
                        uppercase
                        innerRef={ref => (this.refContinueLabel = ref)}
                      >
                        do you want to continue?
                      </Label>
                    </Section>
*/}
                  <Section justifyContent="center" marginTop="6">
                    <ImportButton
                      id={'ref-import-button'}
                      locked={this.selectedPlaysCount < 1}
                      innerRef={ref => (this.refImportButton = ref)}
                      onClick={
                        this.selectedPlaysCount > 0
                          ? this.handleImportClick.bind(this)
                          : null
                      }
                    >
                      {this.activityIndicator}
                    </ImportButton>
                  </Section>
                </Section>
              ) : this.isFinding ? (
                <Section
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <ActivityIndicator color={'#d3d3d3'} height={5} />
                  <Label size="2.5" color={'#d3d3d3'} uppercase>
                    fetching playstack. please wait...
                  </Label>
                </Section>
              ) : (
                <IconImport />
              )}
            </Section>
          </Section>

          <Section
            justifyContent={'center'}
            marginTop={6}
            style={{
              position: 'absolute',
              bottom: 0,
              padding: '4vh 0',
              zIndex: '201',
            }}
          >
            {/*
            <Label
              font={'pamainregular'}
              size={2}
              color={'#ff0000'}
              uppercase
              nowrap
              cursor={'pointer'}
              innerRef={ref => (this.refCancelButton = ref)}
              onClick={this.handleCancelClick.bind(this)}
            >
              close and return back to game event
            </Label>
*/}
            <CloseButton
              innerRef={ref => (this.refCancelButton = ref)}
              onClick={this.handleCancelClick.bind(this)}
            />
          </Section>
        </Wrapper>
      </Container>
    )

    /*
    return (
      <Container>
        <Wrapper>
          {this.confirmMessage}
          {this.events && this.events.length > 0 ? (
            <Section justifyContent="space-between" style={{ height: '80%' }}>
              <Section
                className="left-panel"
                direction="column"
                alignItems="center"
              >
                <Label
                  font="pamainregular"
                  size="3"
                  color={'#d3d3d3'}
                  uppercase
                >
                  select a game event to import playstack
                </Label>
                <Section direction="row" justifyContent="center" marginTop="3">
                  {this.events.map((item, idx) => {
                    return (
                      <GameEventItemWrap
                        key={`importplaystack-${item.keyEventType}-${item.keySportType.code}`}
                        marginRight={idx === 0 ? 1 : 0}
                        width={ (65 * 0.9) + 'vh' }
                      >
                        {this.started ? <Blocker key={`blocker-idx`} /> : null}
                        <GameEventItem
                          eventItem={item}
                          selectedGameEvent={this.refHandleSelectedGameEvent.bind(
                            this
                          )}
                          scaleSize={0.9}
                          forImport
                        />
                      </GameEventItemWrap>
                    )
                  })}
                </Section>
              </Section>

              <Section
                className="middle-panel"
                widthInPct="0.1"
                style={{ backgroundColor: '#d3d3d3' }}
              />

              <Section className="right-panel" style={{ position: 'relative' }}>
                {this.selectedGameEvent ? (
                  <Section direction="column">
                    <Section justifyContent="center">
                      <Label
                        font="pamainregular"
                        size="3"
                        color={'#d3d3d3'}
                        uppercase
                      >
                        you are attempting to import playstack from:
                      </Label>
                    </Section>
                    <Section justifyContent="center" marginTop="2">
                      <Label
                        font={'pamainregular'}
                        size={3}
                        color={'#d3d3d3'}
                        uppercase
                        nowrap
                      >
                        {this.selectedGameEvent.gameId}
                      </Label>
                    </Section>
                    <Section
                      justifyContent={'center'}
                      flexDirection={'row'}
                      marginTop={1.5}
                    >
                      <TeamSection>
                        <TeamIconWrap>
                          <TeamIcon
                            teamInfo={this.selectedGameEvent.participants[0]}
                            size={3}
                            outsideBorderColor={'#ffffff'}
                            outsideBorderWidth={0.2}
                          />
                          &nbsp;
                          <Label
                            font={'pamainlight'}
                            size={3}
                            marginBottom={3}
                            color={'#d3d3d3'}
                            uppercase
                            nospacing
                          >
                            {this.selectedGameEvent.participants[0].name}
                          </Label>
                        </TeamIconWrap>
                        <TeamVS>
                          <Label font={'pamainextrabold'} size={2} uppercase>
                            &nbsp;&nbsp;vs&nbsp;&nbsp;
                          </Label>
                        </TeamVS>
                        <TeamIconWrap>
                          <TeamIcon
                            teamInfo={this.selectedGameEvent.participants[1]}
                            size={3}
                            outsideBorderColor={'#ffffff'}
                            outsideBorderWidth={0.2}
                          />
                          &nbsp;
                          <Label
                            font={'pamainlight'}
                            size={3}
                            marginBottom={3}
                            color={'#d3d3d3'}
                            uppercase
                            nospacing
                          >
                            {this.selectedGameEvent.participants[1].name}
                          </Label>
                        </TeamIconWrap>
                      </TeamSection>
                    </Section>
                    <Section justifyContent="center" marginTop="1.5">
                      <Label
                        font="pamainlight"
                        size="2"
                        color={'#d3d3d3'}
                        uppercase
                      >{`total number of play(s): ${this.selectedGameEvent.playCount}`}</Label>
                    </Section>

                    <Section
                      direction="column"
                      alignItems="center"
                      marginTop={1}
                    >
                      <PlayHeader>
                        <PlayCheckBox widthInPct="4.5" backgroundColor={'#000'}>
                          <input
                            type="checkbox"
                            onChange={this.handlePlaystackCheckChange.bind(
                              this
                            )}
                            ref={ref => (this.playCheckboxHeader = ref)}
                          />
                        </PlayCheckBox>
                        <div style={{ width: '100%' }} />
                      </PlayHeader>
                      <ScrollingPlayWrap>
                        <ContentPlayWrap>
                          {(this.playstack || []).map((play, idx) => {
                            return (
                              <PlayCompWrap
                                key={`play-comp-${play.game_play_id}`}
                              >
                                <PlayCheckBox widthInPct="5">
                                  <input
                                    type="checkbox"
                                    value={play.checked}
                                    ref={ref =>
                                      (this[`play-checkbox${idx}`] = ref)
                                    }
                                    onChange={this.handlePlayCheckChange.bind(
                                      this,
                                      idx
                                    )}
                                  />
                                </PlayCheckBox>
                                <PlayComp item={play} />
                              </PlayCompWrap>
                            )
                          })}
                        </ContentPlayWrap>
                      </ScrollingPlayWrap>
                    </Section>
                    <Section justifyContent="center" marginTop="1.5">
                      <Label
                        font="pamainlight"
                        size="2"
                        color={'#d3d3d3'}
                        uppercase
                      >{`selected play(s): ${this.selectedPlaysCount}`}</Label>
                    </Section>
                    {/!*
                    <Section justifyContent="center" marginTop="6">
                      <Label
                        font="pamainregular"
                        size="2.5"
                        color={'#d3d3d3'}
                        uppercase
                        innerRef={ref => (this.refContinueLabel = ref)}
                      >
                        do you want to continue?
                      </Label>
                    </Section>
*!/}
                    <Section justifyContent="center" marginTop="6">
                      <ImportButton
                        id={'ref-import-button'}
                        locked={this.selectedPlaysCount < 1}
                        innerRef={ref => (this.refImportButton = ref)}
                        onClick={
                          this.selectedPlaysCount > 0
                            ? this.handleImportClick.bind(this)
                            : null
                        }
                      >
                        {this.activityIndicator}
                      </ImportButton>
                    </Section>
                  </Section>
                ) : this.isFinding ? (
                  <Section
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ActivityIndicator color={'#d3d3d3'} height={5} />
                    <Label size="2.5" color={'#d3d3d3'} uppercase>
                      fetching playstack. please wait...
                    </Label>
                  </Section>
                ) : (
                  <IconImport />
                )}
              </Section>
            </Section>
          ) : this.isFinding ? (
            <Section
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <ActivityIndicator color={'#d3d3d3'} height={5} />
              <Label size="2.5" color={'#d3d3d3'} uppercase>
                fetching game events to import
              </Label>
            </Section>
          ) : !this.events ? null : (
            <Section justifyContent="center">
              <Label font="pamainregular" size="3" color={'#d3d3d3'} uppercase>
                NO AVAILABLE GAME EVENT(S) PLAYSTACK FOR IMPORT
              </Label>
            </Section>
          )}

          <Section justifyContent={'center'} marginTop={6} style={{position:'absolute', bottom:0, padding: '4vh 0'}}>
            <Label
              font={'pamainregular'}
              size={2}
              color={'#ff0000'}
              uppercase
              nowrap
              cursor={'pointer'}
              innerRef={ref => (this.refCancelButton = ref)}
              onClick={this.handleCancelClick.bind(this)}
            >
              close and return back to game event
            </Label>
          </Section>
        </Wrapper>
      </Container>
    )
*/
  }
}

const Container = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.95);
  overflow: hidden;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Section = styled.div`
  width: ${props => props.widthInPct || 100}%;
  margin-top: ${props => props.marginTop || 0}vh;
  margin-bottom: ${props => props.marginBottom || 0}vh;
  display: flex;
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
`

const Label = styled.span`
  height: ${props => props.size * 0.8 || 3}vh;
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => props.size || 3}vh;
  color: ${props => props.color || '#ffffff'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => (props.nospacing ? 0 : 0.1)}vh;
  cursor: ${props => props.cursor || 'default'};
  margin-bottom: ${props => props.marginBottom || 0}%;
`

const GameEventItemWrap = styled.div`
  // width: 30%;
  width: ${props => props.width};
  margin-right: ${props => props.marginRight || 0}%;
  position: relative;
`

const TeamSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamIconWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamVS = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 2%;
`

const ImportButton = styled.div`
  height: ${props => 5}vh;
  background-color: #18c5ff;
  display: flex;
  align-items: center;
  cursor: ${props => (props.locked ? 'not-allowed' : 'pointer')};
  padding: 0 ${props => 1.5}vh 0 ${props => 1.5}vh;
  &:before {
    content: 'import playstack';
    font-family: pamainbold;
    fonts-size: ${props => 3}vh;
    color: #ffffff;
    line-height: 1;
    letter-spacing: ${props => 0.1}vh;
    text-transform: uppercase;
  }
`
const Blocker = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: ${props => props.backgroundColor || 'rgba(0, 0, 0, 0.9)'};
  z-index: 200;
`

const IconImport = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${ImportExportArrowsIcon});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15%;
  }
`

const IconArrowDown = styled.img`
  height: ${props => 3}vh;
`

const ScrollingPlayWrap = styled.div`
  position: relative;
  width: 90%;
  height: ${props => 50}vh;
  max-height: ${props => 50}vh;
  overflow-y: scroll;
  background-color: #eaeaea;
`

const ContentPlayWrap = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const PlayCompWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`

const PlayHeader = styled.div`
  width: 90%;
  height: ${props => PCHeight}vh;
  border-top: ${props => 0.1}vh solid #ffffff;
  border-right: ${props => 0.1}vh solid #ffffff;
  border-left: ${props => 0.1}vh solid #ffffff;
  display: flex;
  flex-direction: row;
`

const PlayCheckBox = styled.div`
  width: ${props => props.widthInPct}%;
  height: ${props => PCHeight}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.backgroundColor || '#ffffff'};
`
const FilterSection = styled.div`
  width: 100%;
  padding-left: 4%;
`

const CloseButton = styled.div`
  width: 10vw;
  height: 5vh;
  background-color: #c61a19;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'CLOSE';
    font-family: pamainlight;
    font-size: 2.5vh;
    line-height: 1;
    color: #fff;
    height: ${props => 2.5 * 0.8}vh;
    letter-spacing: 0.2vh;
  }
  &:hover {
    background-color: transparent;
    border: 0.4vh solid #c61a19;
    &:after {
      color: #c61a19;
    }
  }
`

const PCHeight = 4
const PCFontSize = PCHeight * 0.4
const PCContainer = styled.div`
  width: 100%;
  height: ${props => PCHeight}vh;
  margin-bottom: ${props => 0.3}vh;
  display: flex;
  justify-content: space-between;
`

const PCType = styled.div`
  width: 20%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  font-family: pamainregular;
  font-size: ${props => PCFontSize}vh;
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1%;
`

const PCPreset = styled.div`
  width: 15%;
  height: 100%;
  background-color: #ffffff;
  font-family: pamainregular;
  font-size: ${props => PCFontSize}vh;
  text-transform: uppercase;
  color: #000000;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1%;
`

const PCQuestion = styled.div`
  width: 35%;
  height: 100%;
  background-color: #ffffff;
  font-family: pamainregular;
  font-size: ${props => PCFontSize}vh;
  text-transform: uppercase;
  color: #000000;
  line-height: 1;
  display: flex;
  align-items: center;
  padding-left: 2%;
  margin-right: 1%;
`

const PCChoicesWrap = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
`

const PCChoice = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#c61818'};
  font-family: pamainregular;
  font-size: ${props => PCFontSize}vh;
  color: #ffffff;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => props.marginRight || 0};
`

const PCTypCondition = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`

const PCAnnounceHeader = styled.div`
  width: 40%;
  height: 100%;
  display: flex;
  background-color: #ffffff;
  margin-right: 1%;
  padding-left: 2%;
  text-align: center;
  text-transform: uppercase;
  padding-top: 1.5%;
  font-size: ${props => PCFontSize}vh;
  align-items: center;
`

const PCAnnounceMiddle = styled.div`
  width: 40%;
  height: 100%;
  display: flex;
  background-color: #ffffff;
  margin-right: 1%;
  padding-left: 2%;
  text-align: center;
  text-transform: uppercase;
  padding-top: 1.5%;
  font-size: ${props => PCFontSize}vh;
  align-items: center;
`

const PCAnnounceBottom = styled.div`
  width: 20%;
  height: 100%;
  display: flex;
  background-color: #ffffff;
  padding-left: 2%;
  text-align: center;
  text-transform: uppercase;
  padding-top: 1.5%;
  font-size: ${props => PCFontSize}vh;
`

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
  Announce: '#000000',
}

const PlayComp = props => {
  let { item } = props

  return (
    <PCContainer>
      <PCType backgroundColor={PlayColors[item.type]}>{item.type}</PCType>
      {'announce' === item.type.toLowerCase() ? (
        <PCTypCondition>
          <PCAnnounceHeader
            dangerouslySetInnerHTML={{ __html: item.announce_header }}
          />
          <PCAnnounceMiddle
            dangerouslySetInnerHTML={{ __html: item.announce_middle }}
          />
          <PCAnnounceBottom dangerouslySetInnerHTML={{ __html: '...' }} />
        </PCTypCondition>
      ) : (
        <PCTypCondition>
          <PCPreset>{item.preset_id}</PCPreset>
          <PCQuestion>{item.parent_question}</PCQuestion>
          <PCChoicesWrap>
            {item.choices.map((c, idx) => {
              return (
                <PCChoice
                  key={`${idx}-${c.sequence}`}
                  backgroundColor={PlayColors[item.type]}
                  marginRight={idx + 1 < item.choices.length ? '0.2vh' : 0}
                >
                  {c.value}
                </PCChoice>
              )
            })}
          </PCChoicesWrap>
        </PCTypCondition>
      )}
    </PCContainer>
  )
}

const CMContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
`

const CMMessage = styled.div`
  position: relative;
  width: ${props => 40}vh;
  height: ${props => 25}vh;
  border-radius: ${props => 0.2}vh;
  background-color: #eaeaea;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CMContent = styled.div`
  width: 100%;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const CMFooter = styled.div`
  width: 100%;
  height: 30%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const CMText = styled.span`
  font-family: pamainregular;
  font-size: ${props => 3}vh;
  font-color: #000000;
  text-transform: uppercase;
  line-height: 1;
`

const CMButton = styled.div`
  width: ${props => 12}vh;
  height: 60%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => 1.5}vh;
    color: #ffffff;
    line-height: 1;
    text-transform: uppercase;
  }
`

const ConfirmMessage = props => {
  return (
    <CMContainer>
      <CMMessage>
        <CMContent>
          <CMText>do you want to continue?</CMText>
        </CMContent>
        <CMFooter>
          <CMButton
            width={10}
            backgroundColor={'#317ECE'}
            text="yes"
            onClick={props.confirm}
          />
          <div style={{ width: '1vh' }} />
          <CMButton
            width={10}
            backgroundColor={'#DA1533'}
            text="no"
            onClick={props.cancel}
          />
        </CMFooter>
      </CMMessage>
    </CMContainer>
  )
}
