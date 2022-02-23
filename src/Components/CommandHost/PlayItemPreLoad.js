import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import LockIcon from '@/assets/images/icon-lock-black.svg'
import LockWhiteIcon from '@/assets/images/icon-lock-white.svg'
import PendingIndicatorIcon from '@/assets/images/pending-indicator.svg'
import NextIcon from '@/assets/images/play-next.svg'
import DDSponsorBrand from '@/Components/CommandHost/Common/DDSponsorBrand'
import DDStar from '@/Components/CommandHost/Common/DDStar'
import DDAward from '@/Components/CommandHost/Common/DDAward'
import DDTeam from '@/Components/CommandHost/Common/DDTeam'
import TeamItem from '@/Components/CommandHost/Common/TeamItem'
import { vhToPx, isEqual } from '@/utils'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject(
  'PrePlayStore',
  'PlayStore',
  'GameStore',
  'CommandHostStore',
  'AutomationStore'
)
@observer
export default class PlayItemPreLoad extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      promptRemove: false,
      multiplier: 1,
      optionCount: 1,
      presetItems: null,
      preItem: null,
      values: {
        index: 0,
        type: '',
        playTitle: '',
        choices: [],
        stars: 0,
        length: 0,
      },
      hasChanges: false,
    })

    this.sourceQuestionInput =
      this.props.item.playTitle && this.props.item.playTitle.value
        ? this.props.item.playTitle.value
        : ''
    this.questionInputId = `questioninput-${this.props.item.id}`

    this.MAIN_CHOICE = this.props.item.multiplierChoices.filter(
      o => o.id === this.props.item.id
    )[0]

    this._isMounted = false

    //AUTOMATION
    if (
      this.props.GameStore.executionType === 'recording' &&
      this.props.PrePlayStore.sessionButtons['start'] &&
      (
        this.props.PrePlayStore.sessionButtons['start'].text || ''
      ).toLowerCase() === 'resume session'
    ) {
      this.state = {
        sessionStarted: false,
      }
    } else {
      this.state = {
        sessionStarted: this.props.GameStore.isSessionStarted,
      }
    }

    this.destroyProgress = intercept(
      this.props.GameStore,
      'progress',
      change => {
        this.setState({ sessionStarted: change.newValue === 'live' })
        return change
      }
    )

    this.destroySessionMode = intercept(
      this.props.GameStore,
      'sessionMode',
      change => {
        this.setState({ sessionStarted: change.newValue === 1 })
        return change
      }
    )
  }

  handleDDOptionChange() {
    const ddoption = document.getElementById(
      `dd-option-playitempreload-${this.props.item.index}`
    )

    if (ddoption) {
      this.preItem = this.presetItems.filter(
        o => o.id === parseInt(ddoption.value)
      )[0]
      if (this.preItem) {
        this.props.item.preset = this.preItem
        this.props.item.isPresetTeamChoice = this.preItem.preset.match('TEAMS')
          ? true
          : false

        this.props.item.playTitle.id = this.preItem.id
        this.props.item.playTitle.value = this.preItem.question
        this.optionCount = this.preItem.choices.length

        this.props.PrePlayStore.pullMultiplierChoices(
          parseInt(ddoption.value)
        ).then(data => {
          this.props.item.multiplierChoices = data
        })

        this.resetChoiceInputs()
        this.forceUpdate()
        //this.props.gamesUpdatePreset({playId: this.props.item.id, predeterminedName: this.preItem.preset})
      }
    }
  }

  handleDDTimerModeChange(e) {
    this.props.item.length = parseInt(e.target.value)
    this.forceUpdate()
  }

  handleQuestionChange(refId, e) {
    const el = document.getElementById(refId)
    if (el) {
      if (
        e.target.value.toLowerCase() == this.sourceQuestionInput.toLowerCase()
      ) {
        el.style.border = `none`
        this.hasChanges = false
      } else {
        el.style.border = `0.2vh solid #ff0000`
        this.hasChanges = true
      }
    }

    this.props.item.playTitle.value = e.target.value
    if (this._isMounted) {
      this.forceUpdate()
    }
  }

  handleStarValue(val) {
    this.props.item.stars = val
    this.props.gamesUpdate(this.props.item)
  }

  handleAutomationAddEvent(params) {
    this.props.AutomationStore.addEvent(params)
  }

  handleSponsorBrandValue(val) {
    this.props.item.sponsor = val
    this.props.gamesUpdate(this.props.item)
  }

  handleTeamValue(val) {
    this.props.item.team = val
    this.props.gamesUpdate(this.props.item)
  }

  handleAwardValue(val) {
    this.props.item.award = val
    this.props.gamesUpdate(this.props.item)
  }

  handleChoiceChange(i, e) {
    this.props.item.choices[i].value = e.target.value
    this.forceUpdate()
  }

  handleRemoveClick(refId) {
    //this.props.AutomationStore.addEvent({evt:'click', refId: refId, wait: 2, playId: this.props.item.id})
    this.promptRemove = true
    this.forceUpdate()
    setTimeout(() => {
      this.promptRemove = false
      if (this._isMounted) {
        this.forceUpdate()
      }
    }, 3000)
  }

  handlePromptRemoveClick(refId) {
    //this.props.AutomationStore.addEvent({evt:'click', refId: refId, wait: 1, playId: this.props.item.id})

    this.props.item.executionType = (
      this.props.GameStore.executionType || ''
    ).toLowerCase()
    this.props.remove(this.props.item)
  }

  handleGoClick(itemId, refId) {
    this.props.AutomationStore.addEvent({
      evt: 'click',
      refId: refId,
      wait: this.props.AutomationStore.currentTime,
      playId: itemId,
    })

    if (this[`next-play-go-${itemId}`]) {
      TweenMax.set(this[`next-play-go-${itemId}`], { display: 'none' })
      TweenMax.set(this[`next-play-indicator-go-${itemId}`], {
        display: 'flex',
      })
    }

    this.props.go(this.props.item)
  }

  resetChoiceInputs() {
    this.props.item.choices = []
    for (let i = 0; i < this.preItem.choices.length; i++) {
      let inputVal = this.preItem.choices[i]
      this.props.item.choices.push(inputVal)
    }
  }

  OptionInputs() {
    let comp = []
    let reference = `playitempreload-choice-${this.props.item.index}-`

    if (this.preItem) {
      if ('A-B (TEAMS)' === this.preItem.preset.trim().toUpperCase()) {
        for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
          const t = this.props.PrePlayStore.teams[i]
          this.props.item.choices[i] = { id: t.id, value: t.teamName }
          comp.push(
            <TeamItemWrapper
              key={reference + i}
              marginRight={i < this.props.PrePlayStore.teams.length - 1}
            >
              <TeamItem
                team={t}
                backgroundColor={PlayColors[this.props.item.type]}
              />
            </TeamItemWrapper>
          )
        }
      } else {
        if (this.MAIN_CHOICE && this.MAIN_CHOICE.choices) {
          const choices = this.MAIN_CHOICE.choices.sort(
            (a, b) => a.sequence - b.sequence
          )
          for (let i = 0; i < choices.length; i++) {
            const mulChoice = choices[i]
            const propsItemChoice = this.props.item.choices.filter(
              o =>
                (o.value || '').toLowerCase() ===
                (mulChoice.value || '').toLowerCase()
            )[0]
            if (propsItemChoice) {
              comp.push(
                <OptionInputDiv
                  key={reference + i}
                  marginRight={i < this.MAIN_CHOICE.choices.length - 1}
                >
                  <OptionInput
                    disabled
                    readOnly={this.preItem.readOnly}
                    color={'#ffffff'}
                    backgroundColor={PlayColors[this.props.item.type]}
                    value={propsItemChoice.value}
                    onChange={this.handleChoiceChange.bind(this, i)}
                  />
                </OptionInputDiv>
              )
            }
          }
        }

        // for (let i = 0; i < this.preItem.choices.length; i++) {
        //   const preItemChoice = this.preItem.choices[i]
        //   const propsItemChoice = this.props.item.choices.filter(o =>  (o.value || '').toLowerCase() === (preItemChoice.value || '').toLowerCase())[0]
        //   if (propsItemChoice) {
        //     comp.push(
        //       <OptionInputDiv
        //         key={reference + i}
        //         marginRight={i < this.preItem.choices.length - 1}
        //       >
        //         <OptionInput
        //           disabled
        //           readOnly={this.preItem.readOnly}
        //           color={'#ffffff'}
        //           backgroundColor={PlayColors[this.props.item.type]}
        //           value={propsItemChoice.value}
        //           onChange={this.handleChoiceChange.bind(this, i)}
        //         />
        //       </OptionInputDiv>
        //     )
        //   }
        /*
          if ((preItemChoice.value || '').toLowerCase() === (this.props.item.choices[i].value || '').toLowerCase()) {
            comp.push(
              <OptionInputDiv
                key={reference + i}
                marginRight={i < this.preItem.choices.length - 1}
              >
                <OptionInput
                  disabled
                  readOnly={this.preItem.readOnly}
                  color={'#ffffff'}
                  backgroundColor={PlayColors[this.props.item.type]}
                  value={this.props.item.choices[i].value}
                  onChange={this.handleChoiceChange.bind(this, i)}
                />
              </OptionInputDiv>
            )
          }
*/
        //}
      }

      return comp
    }

    return null
  }

  updatePresetItemsToCustom(callback) {
    let presetToUpdate = this.presetItems.filter(
      o => o.id === this.props.item.playTitle.id
    )[0]
    if (presetToUpdate) {
      presetToUpdate.choices = []
      presetToUpdate.question = this.props.item.playTitle.value
      for (let i = 0; i < this.props.item.choices.length; i++) {
        presetToUpdate.choices.push(this.props.item.choices[i])
      }

      callback(presetToUpdate)
    }
  }

  async handleUpdateChanges() {
    if (
      this.props.item.multiplierChoices &&
      this.props.item.multiplierChoices.length > 0
    ) {
      this.props.item.multiplierChoices[0].question = await (this.props.item
        .playTitle && this.props.item.playTitle.value
        ? this.props.item.playTitle.value
        : ''
      ).toLowerCase()
      this.props.gamesUpdate(this.props.item)
    }

    const el = document.getElementById(this.questionInputId)
    if (el) {
      el.style.border = 'none'
    }
    this.hasChanges = false
    this.forceUpdate()
  }

  componentWillMount() {
    this.presetItems = JSON.parse(
      JSON.stringify(
        this.props.PrePlayStore.getPresetItemsByType(this.props.item.type)
      )
    )

    this.values = this.props.item
    this.preItem = JSON.parse(JSON.stringify(this.props.item.preset))
  }
  componentWillMount_() {
    this.presetItems = JSON.parse(
      JSON.stringify(
        this.props.PrePlayStore.getPresetItemsByType(this.props.item.type)
      )
    )

    // this.updatePresetItemsToCustom(defaultPreset => {
    //   if (defaultPreset) {
    //     this.props.item.preset = this.props.item.preset || defaultPreset
    //     this.values = this.props.item
    //     this.preItem = defaultPreset
    //   } else {
    //     this.props.item.preset = this.presetItems[0]
    //     this.values = this.props.item
    //     this.preItem = this.presetItems[0]
    //   }
    //   this.resetChoiceInputs()
    // })
    const multiChoices = this.props.PlayStore.multipliersFromStackByPlayId(
      this.props.item
    )
    if (multiChoices && multiChoices.length > 0) {
      const idxToUpdate = this.presetItems.findIndex(
        o => o.preset === multiChoices[0].preset
      )
      if (idxToUpdate > -1) {
        this.presetItems[idxToUpdate] = multiChoices[0]
        this.props.item.preset = this.presetItems[idxToUpdate]
        this.values = this.props.item
        this.preItem = this.presetItems[idxToUpdate]
      } else {
        this.props.item.preset = this.presetItems[0]
        this.values = this.props.item
        this.preItem = this.presetItems[0]
      }
    } else {
      this.props.item.preset = this.presetItems[0]
      this.values = this.props.item
      this.preItem = this.presetItems[0]
    }
    this.resetChoiceInputs()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.item.id !== this.props.item.id) {
      return true
    }
    if (nextState.sessionStarted !== this.state.sessionStarted) {
      return true
    }

    return false
  }

  componentWillUnmount() {
    this._isMounted = false
    this.destroyProgress()
    this.destroySessionMode()
  }

  componentDidMount() {
    this._isMounted = true
    delete this.props.item.editorEvents
    delete this.props.item.recordedAutomation
  }

  componentDidMountXXX() {
    const ddoption = document.getElementById(
      `dd-option-playitempreload-${this.props.item.index}`
    )
    if (ddoption) {
      const preset = this.presetItems.filter(o => o.id === ddoption.value)[0]
      if (preset) {
        this.props.item.predeterminedName =
          this.props.item.predeterminedName || preset.preset
      }
    }
  }

  render() {
    let { item, GameStore } = this.props
    let { sessionStarted } = this.state
    let bg = PlayColors[this.props.item.type]

    return (
      <Container>
        <StackWrapper>
          <Main>
            <PlayStatusWrapper />
            <PlayTypeDD>
              <PrePlaySingle backgroundColor={bg} text={item.type} />
            </PlayTypeDD>
            <DDSelectType
              disabled
              locked
              id={`dd-option-playitempreload-${item.index}`}
              onChange={this.handleDDOptionChange.bind(this)}
              value={this.preItem.id}
            >
              {this.presetItems.map((pItem, i) => {
                return (
                  <option key={i} value={pItem.id}>
                    {pItem.preset}
                  </option>
                )
              })}
            </DDSelectType>
            <QuestionInput
              id={this.questionInputId}
              type="text"
              value={item.playTitle.value}
              onChange={this.handleQuestionChange.bind(
                this,
                this.questionInputId
              )}
            />
            <OptionInputsWrapper>{this.OptionInputs()}</OptionInputsWrapper>
            <StarWrapper>
              <DDStar
                locked={GameStore.isLockedForAllExecutionType}
                item={item}
                height={h}
                index={'playitempreload-' + item.index}
                value={this.handleStarValue.bind(this)}
                automationAddEvent={this.handleAutomationAddEvent.bind(this)}
              />
            </StarWrapper>
            <SponsorBrandWrapper>
              <DDSponsorBrand
                locked={GameStore.isLockedForAllExecutionType}
                item={item}
                height={h}
                index={'playitempreload-' + item.index}
                selectedSponsor={item.sponsor}
                value={this.handleSponsorBrandValue.bind(this)}
                automationAddEvent={this.handleAutomationAddEvent.bind(this)}
              />
            </SponsorBrandWrapper>
            <AwardWrapper>
              <DDAward
                locked={GameStore.isLockedForAllExecutionType}
                item={item}
                height={h}
                index={'playitempreload-' + item.index}
                initValue={val => (item.award = val)}
                value={this.handleAwardValue.bind(this)}
              />
            </AwardWrapper>
            <PlayOrTimerWrapper>
              <PlayMode src={LockIcon} />
            </PlayOrTimerWrapper>
            {/*
            <PlayOrTimerWrapper>
              {'LIVEPLAY' === item.type.toUpperCase() ? (
                <PlayMode src={LockIcon} />
              ) : (
                <DDTimerMode
                  value={item.length}
                  onChange={this.handleDDTimerModeChange.bind(this)}
                >
                  <option value={0}>PLAY</option>
                  <option value={10}>10 s</option>
                  <option value={15}>15 s</option>
                </DDTimerMode>
              )}
            </PlayOrTimerWrapper>
*/}
            <TeamWrapper>
              <DDTeam
                //for future use: presetToNone={item.isPresetTeamChoice}
                //for future use: locked={item.isPresetTeamChoice}
                locked={GameStore.isLockedForAllExecutionType}
                item={item}
                height={h}
                index={'playitempreload-' + item.index}
                teams={this.props.PrePlayStore.teams}
                value={this.handleTeamValue.bind(this)}
                headerSelectedTeam={this.props.headerSelectedTeam}
                automationAddEvent={this.handleAutomationAddEvent.bind(this)}
              />
            </TeamWrapper>
            <LastButtonWrapper>
              {this.promptRemove ? (
                <PromptRemoveButton
                  // locked={GameStore.isLockedForAllExecutionType}
                  id={`final-remove-${item.type}-${item.id}`}
                  onClick={this.handlePromptRemoveClick.bind(
                    this,
                    `final-remove-${item.type}-${item.id}`
                  )}
                />
              ) : (
                <RemoveButton
                  // locked={GameStore.isLockedForAllExecutionType}
                  id={`prompt-remove-${item.type}-${item.id}`}
                  onClick={this.handleRemoveClick.bind(
                    this,
                    `prompt-remove-${item.type}-${item.id}`
                  )}
                />
              )}
              <GoButton
                locked={!sessionStarted}
                id={`go-button-${item.type}-${item.id}`}
                onClick={
                  !sessionStarted
                    ? null
                    : this.handleGoClick.bind(
                        this,
                        item.id,
                        `go-button-${item.type}-${item.id}`
                      )
                }
                innerRef={ref => (this[`next-play-go-${item.id}`] = ref)}
              />
              <PendingIndicator
                src={PendingIndicatorIcon}
                innerRef={ref =>
                  (this[`next-play-indicator-go-${item.id}`] = ref)
                }
              />

              {this.hasChanges ? (
                <UpdateChangesButton
                  onClick={this.handleUpdateChanges.bind(this)}
                />
              ) : null}
            </LastButtonWrapper>
          </Main>
        </StackWrapper>

        <Sub id={`sub-container-${item.index}`} />
      </Container>
    )
  }
}

const h = 5
let FONT_SIZE = '1.8vh'

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
  height: auto;
  margin-top: ${props => 0.1}vh;
  margin-bottom: ${props => 0.5}vh;
`
const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const StackWrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: column;
`

const Main = styled.div`
  width: inherit;
  height: ${props => h}vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  -webkit-filter: grayscale(${props => (props.isDragging ? 1 : 0)});
`

const Sub = styled.div`
  width: 90%;
  background: yellow;
`

const PrePlaySingle = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: white;
  line-height: 1;
  text-transform: uppercase;
  &:after {
    content: '${props => props.text}';
  }
`

const PlayTypeDD = styled.div`
  width: 8%;
  height: ${props => h}vh;
  display: flex;
`
const PlayStatusWrapper = styled.div`
  width: 3%;
  height: ${props => h}vh;
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-image: url(${NextIcon});
  background-repeat: no-repeat;
  background-size: 50%;
  background-position: center;
`

const QuestionInput = styled.input`
  width: 16%;
  height: inherit;
  border: ${props => 0.05}vh;
  outline: none;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  text-indent: ${props => 1}vh;
  background-color: white;
`

const DDSelectType = styled.select`
  width: 7%;
  height: ${props => h}vh;
  background-color: #e5e5e5;
  outline: none;
  border: none;
  -webkit-appearance: none;

  background-image: url(${props => (props.locked ? null : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => 2}vh;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #000000;
  line-height: 1;
  text-transform: uppercase;
  text-align-last: center;
`

const OptionInputsWrapper = styled.div`
  width: 20%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const OptionInputDiv = styled.div`
  width: 100%;
  height: inherit;
  ${props => (props.marginRight ? `margin-right:${0.2}vh` : ``)};
`

const OptionInput = styled.input`
  width: 100%;
  height: inherit;
  background-color: ${props => props.backgroundColor};
  text-align: center;
  border: none;
  outline: none;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: ${props => props.color};
`

const StarWrapper = styled.div`
  width: 2.6%;
  height: ${props => h}vh;
  position: relative;
`
const SponsorBrandWrapper = styled.div`
  width: 13%;
  height: ${props => h}vh;
  position: relative;
`

const AwardWrapper = styled.div`
  width: 8%;
  height: ${props => h}vh;
  position: relative;
`

const PlayOrTimerWrapper = styled.div`
  width: 4.4%;
  height: inherit;
`

const TeamWrapper = styled.div`
  width: 8%;
  height: inherit;
  border-left: ${props => 0.1}vh solid black;
  position: relative;
`

const TeamItemWrapper = styled.div`
  width: 100%;
  height: inherit;
  ${props => (props.marginRight ? `margin-right:${0.2}vh` : ``)};
`

const PlayMode = styled.div`
  width: 100%;
  height: inherit;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: 'PLAY';
    margin-left: ${props => 2}vh;
  }
  &:after {
    width: inherit;
    height: inherit;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 45%;
    background-position: center;
  }
`

const DDTimerMode = styled.select`
  width: inherit;
  height: inherit;
  outline: none;
  border: none;
  -webkit-appearance: none;

  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => 2}vh;
  font-family: pamainbold;
  color: #000000;
  line-height: 1;
  text-align-last: center;
  font-weight: bold;
`

const RemoveButton = styled.div`
  width: 75%;
  height: inherit;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: grayscale(1);
  opacity: 0.3;
  &:after {
    content: 'REMOVE';
    color: black;
  }
`

const PromptRemoveButton = styled.div`
  width: 75%;
  height: inherit;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: 'REMOVE PLAY?';
    color: black;
  }
`

const GoButton = styled.div`
  width: 25%;
  height: ${props => h}vh;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: ${props => (props.locked ? 'grayscale(1)' : 'grayscale(0)')};
  opacity: ${props => (props.locked ? 0.4 : 1)};
  position: relative;
  &:after {
    content: 'GO';
    color: #18c5ff;
  }
`

const PendingIndicator = styled.div`
  width: ${props => h}vh;
  height: ${props => h}vh;
  background-color: #000000;
  display: none;
  align-items: center;
  &:after {
    content: '';
    display: block;
    width: ${props => h}vh;
    height: ${props => h}vh;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
    animation: ${props => pendingRotate} 5s linear infinite;
    transformorigin: center center;
  }
`

const pendingRotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const LastButtonWrapper = styled.div`
  width: 10%;
  display: flex;
  justify-content: space-between;
  position: relative; /*added for UpdateButton*/
`

const UpdateChangesButton = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #ff0000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'update changes';
    font-family: pamainbold;
    font-size: ${props => FONT_SIZE};
    color: #ffffff;
    line-height: 1;
    text-transform: uppercase;
  }
`
