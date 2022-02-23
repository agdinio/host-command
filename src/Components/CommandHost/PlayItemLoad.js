import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax, TimelineMax } from 'gsap'
import { PACircle } from '@/Components/PACircle'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import StarIconDark from '@/assets/images/star-icon-dark.svg'
import LockIcon from '@/assets/images/icon-lock-black.svg'
import LockWhiteIcon from '@/assets/images/icon-lock-white.svg'
import ArrowPushIcon from '@/assets/images/host-command-icon-arrow-push.svg'
import PlusIcon from '@/assets/images/preplay-plus-blue.svg'
import DDSponsorBrand from '@/Components/CommandHost/Common/DDSponsorBrand'
import DDStar from '@/Components/CommandHost/Common/DDStar'
import DDTeam from '@/Components/CommandHost/Common/DDTeam'
import TeamItem from '@/Components/CommandHost/Common/TeamItem'
import { vhToPx, vwToPx } from '@/utils'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject('PrePlayStore', 'CommandHostStore', 'AutomationStore', 'GameStore')
@observer
export default class PlayItemLoad extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      timeLeft: 0,
      timeLeftCheck: null,
      timeLeftPauseAnim: false,
      adLeft: 0,
      adLeftCheck: null,
      adLeftPauseAnim: false,
      error: null,
      multiplier: 1,
      optionCount: 1,
      //presetItems: null,
      preItem: null,
      pushed: false,
      values: {
        index: 0,
        type: '',
        playTitle: '',
        choices: [],
        stars: 0,
        length: 0,
      },
      isPrepickLoaded: false,
      preStarted: false,
      isStarted: false,
      isEnded: false,
      activePlay: {
        id: 0,
        type: '',
        multiplier: 1,
        length: 0,
        withStar: false,
        playTitle: '',
        choices: [],
      },
      result: {
        id: 0,
        type: '',
        correctAnswer: '',
        correctAnswers: [],
        resultTitle: '',
        selectedTeam: {},
        withStar: false,
      },
      sessionStarted: this.props.GameStore.isSessionStarted,
    })

    this.MAIN_CHOICE = this.props.item.multiplierChoices.filter(
      o => o.id === this.props.item.id
    )[0]

    this.destroySessionMode = intercept(
      this.props.GameStore,
      'sessionMode',
      change => {
        this.sessionStarted = change.newValue === 1
        return change
      }
    )
  }

  handleStartPlayClick() {
    this.props.startPlay()
    this.preStarted = true
    setTimeout(() => {
      this.isStarted = true
    }, 1500)
  }

  async handleEndPlayClick(refId) {
    let { PrePlayStore } = this.props

    const _editorEvents = []
    if ('recording' === this.props.GameStore.executionType) {
      await _editorEvents.push({
        gameId: this.props.GameStore.gameId,
        playId: null,
        evt: 'delay',
        refId: refId,
        wait: 0,
        sequence: 0,
        isIncrementHeaderPlaySequence: false,
        isIncrementPlaySequence: false,
        isIncrementSequence: true,
        timestampWait: 0,
        isPreviousPlayEnded: true,
        isUseGlobalTimestampWait: true,
      })

      for (
        let i = 0;
        i < this.props.AutomationStore.tempUnresolvedEvents.length;
        i++
      ) {
        const event = this.props.AutomationStore.tempUnresolvedEvents[i]
        event.sequence = ++this.props.AutomationStore.sequence
        await _editorEvents.push(event)
      }

      await _editorEvents.push({
        gameId: this.props.GameStore.gameId,
        playId: this.props.item.id,
        evt: 'click',
        refId: refId,
        wait: 0,
        sequence: 0,
        isIncrementHeaderPlaySequence: false,
        isIncrementPlaySequence: false,
        isIncrementSequence: true,
        timestampWait: 0,
        isPreviousPlayEnded: false,
      })

      if (PrePlayStore.nextPlayItem && PrePlayStore.nextPlayItem.id) {
        await _editorEvents.push({
          gameId: this.props.GameStore.gameId,
          playId: PrePlayStore.nextPlayItem.id,
          evt: 'click',
          refId: `go-button-${PrePlayStore.nextPlayItem.type}-${PrePlayStore.nextPlayItem.id}`,
          wait: 0,
          sequence: 0,
          isIncrementHeaderPlaySequence: false,
          isIncrementPlaySequence: false,
          isIncrementSequence: true,
          timestampWait: 0,
          isPreviousPlayEnded: true,
        })
      }

      this.props.AutomationStore.resetCurrentTime()
    }

    this.isEnded = true
    setTimeout(() => {
      this.showResults(_editorEvents)
    }, 0)
  }

  showResults(_editorEvents) {
    this.result.correctAnswers.forEach(correctAnswer => {
      const option = document.getElementById(correctAnswer.highlightedOption)
      TweenMax.set(option, { backgroundColor: '#18c5ff' })
    })

    let multiItem = this.props.item.multiplierItems[
      this.props.item.multiplierItems.length - 1
    ]
    if (multiItem) {
      let multiChoice = this.props.item.multiplierChoices.filter(
        o => o.id === multiItem.id
      )[0]
      if (multiChoice) {
        multiChoice.locked = true
      }
    }

    TweenMax.set(this.ResultTitleInput, {
      backgroundColor: '#18c5ff',
      color: '#ffffff',
      readOnly: true,
    })
    TweenMax.set(this[`playitemload-${this.props.item.index}`], {
      backgroundColor: '#18c5ff',
      color: '#ffffff',
    })
    this.pushed = true

    this.result.hasNextPlay = this.props.PrePlayStore.nextPlayItem
      ? true
      : false
    this.props.item.result = this.result
    this.props.showResult({
      id: this.props.item.id,
      result: this.result,
      executionType: this.props.GameStore.executionType,
      editorEvents:
        'recording' === this.props.GameStore.executionType
          ? _editorEvents
          : null,
    })
    this.props.AutomationStore.resetTempUnresolvedEvents()
    // setTimeout(() => {
    //   this.props.resolve()
    // }, 3000)
  }

  handleShowResultClick() {
    this.error = null
    let required = []
    if (!this.result.correctAnswer) {
      required.push('Correct answer')
    }
    if (!this.result.resultTitle) {
      required.push('Results field')
    }
    if (!this.result.selectedTeam) {
      required.push('Team')
    }
    if (
      this.result.selectedTeam &&
      !this.result.selectedTeam.id &&
      !this.result.selectedTeam.teamName
    ) {
      required.push('Team')
    }

    if (required.length > 0) {
      this.error = required
      const promptRequired = document.getElementById('prompt-required')
      if (promptRequired) {
        setTimeout(() => {
          new TimelineMax({ repeat: 0 })
            .to(promptRequired, 0.1, { visibility: 'visible', opacity: 1 })
            .to(promptRequired, 0.1, {
              visibility: 'hidden',
              opacity: 0,
              delay: 3,
            })
        }, 0)
      }
    } else {
      this.result.correctAnswers.forEach(correctAnswer => {
        const option = document.getElementById(correctAnswer.highlightedOption)
        TweenMax.set(option, { backgroundColor: '#18c5ff' })
      })

      let multiItem = this.props.item.multiplierItems[
        this.props.item.multiplierItems.length - 1
      ]
      if (multiItem) {
        let multiChoice = this.props.item.multiplierChoices.filter(
          o => o.id === multiItem.id
        )[0]
        if (multiChoice) {
          multiChoice.locked = true
        }
      }

      TweenMax.set(this.ResultTitleInput, {
        backgroundColor: '#18c5ff',
        color: '#ffffff',
        readOnly: true,
      })
      TweenMax.set(this[`playitemload-${this.props.item.index}`], {
        backgroundColor: '#18c5ff',
        color: '#ffffff',
      })
      this.pushed = true

      this.props.item.result = this.result
      this.props.showResult(this.result)
      setTimeout(() => {
        this.props.resolve()
      }, 4000)
    }
  }

  handleSelectAnswer(
    multiplierChoice,
    index,
    reference,
    multiplierCountX,
    prevItemToLock,
    automationMultiplierFlag
  ) {
    setTimeout(() => {
      if (multiplierCountX === 2) {
        this.props.item.multiplierItems = []
      }

      if (multiplierCountX === 3) {
        if (this.props.item.multiplierItems.length > 1) {
          for (let i = this.props.item.multiplierItems.length - 1; i > 0; i--) {
            this.props.item.multiplierItems.splice(i, 1)
          }
        }
      }
      // const down = this.props.item.multiplierItems.length - multiplierCountX
      // for (let x=this.props.item.multiplierItems.length - 1; x>=down; x--) {
      //   this.props.item.multiplierItems.splice(x, 1)
      // }

      for (let i = 0; i < multiplierChoice.choices.length; i++) {
        const option = document.getElementById(`${reference}-${i}`)

        if (index === i) {
          const ans = multiplierChoice.choices[i]
          this.result.correctAnswer = ans.value

          this.pushCorrectAnswer(
            multiplierChoice.id,
            multiplierChoice.choices[i],
            multiplierCountX,
            `${reference}-${i}`
          )
          this.pushMultiplierItem(ans.nextId, ans.value, multiplierCountX)

          /**
           * Lock previous multiplier choice after selecting on the current choice
           */
          if (prevItemToLock) {
            prevItemToLock.locked = true
          }

          if (option) {
            TweenMax.set(option, { backgroundColor: '#0fbc1c' })
          }

          //this.props.AutomationStore.addEvent({evt:'click', refId: `${reference}-${i}`, wait: 0.5, playId: this.props.item.id})
          this.props.AutomationStore.addTempUnresolvedEvent({
            evt: 'click',
            refId: `${reference}-${i}`,
            wait: 0.5,
            playId: this.props.item.id,
            multiplierFlag: automationMultiplierFlag,
          })
        } else {
          if (option) {
            TweenMax.set(option, { backgroundColor: '#808285' })
          }
        }
      }
    }, 0)
  }

  pushCorrectAnswer(id, correctAnswer, multiplierCountX, option) {
    /**
     * Remove existing answer
     */
    const answerMultipliers = [...this.result.correctAnswers]
    for (let i = answerMultipliers.length - 1; i >= 0; i--) {
      const mulX = answerMultipliers[i].multiplier
      if (mulX >= multiplierCountX) {
        const toRemove = this.result.correctAnswers.filter(
          o => o.multiplier === mulX
        )[0]
        if (toRemove) {
          const idxToRemove = this.result.correctAnswers.indexOf(toRemove)
          if (idxToRemove > -1) {
            this.result.correctAnswers.splice(idxToRemove, 1)
          }
        }
      }
    }

    // const toRemove = this.result.correctAnswers.filter(
    //   o => o.multiplier === multiplierCountX
    // )[0]
    // if (toRemove) {
    //   const idxToRemove = this.result.correctAnswers.indexOf(toRemove)
    //   if (idxToRemove > -1) {
    //     this.result.correctAnswers.splice(idxToRemove, 1)
    //   }
    // }

    /**
     * Push new answer
     */
    let ans = {
      id: id,
      multiplier: multiplierCountX,
      correctAnswer: correctAnswer,
      highlightedOption: option,
    }
    this.result.correctAnswers.push(ans)

    let preResult = ''
    for (let x = 0; x < this.result.correctAnswers.length; x++) {
      const ca = this.result.correctAnswers[x]
      preResult += ca.correctAnswer.value + ', '
    }

    this.result.resultTitle = preResult.slice(0, -2)
  }

  pushMultiplierItem(nextId, answer, multiplierCountX) {
    /**
     * Remove existing item
     */
    /*
    const mulItems = [...this.props.item.multiplierItems]
    for (let i=mulItems.length - 1; i>=0; i--) {
      debugger
      const mulX = mulItems[i].multiplier
      if (mulX >= multiplierCountX) {
        const toRemove = this.props.item.multiplierItems.filter(o => o.multiplier === mulX)[0]
        if (toRemove) {
          const idxToRemove = this.props.item.multiplierItems.indexOf(toRemove)
          if (idxToRemove > -1) {
            this.props.item.multiplierItems.splice(idxToRemove, 1)
          }
        }
      }
    }
*/

    const multiItemToRemove = this.props.item.multiplierItems.filter(
      o => o.multiplier === multiplierCountX
    )[0]
    if (multiItemToRemove) {
      const multiItemIndex = this.props.item.multiplierItems.indexOf(
        multiItemToRemove
      )
      if (multiItemIndex > -1) {
        this.props.item.multiplierItems.splice(multiItemIndex, 1)
      }
    }

    /**
     * Push new item
     */
    let multiItem = this.props.item.multiplierChoices.filter(
      o => o.id === nextId
    )[0]
    if (multiItem) {
      multiItem.multiplier = multiplierCountX
      multiItem.previousAnswer = answer
      this.props.item.multiplierItems.push(multiItem)
    }

    this.forceUpdate()
  }

  handleResultTitleChange(e) {
    this.result.resultTitle = e.target.value
  }

  ResultOptions() {
    let comp = []
    let { item } = this.props

    if (item) {
      let hasTimer = item.length > 0 ? true : false

      if (
        'A-B (TEAMS)' === item.multiplierChoices[0].preset.trim().toUpperCase()
      ) {
        for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
          const resultOptionLoadId = `currentplay-result-option-${this.props.item.type}-1-${this.props.item.id}`
          const automationMultiplierFlag = `currentplay-result-option-${this.props.item.type}-1`
          const t = this.props.PrePlayStore.teams[i]
          item.multiplierChoices[0].choices[i] = { id: t.id, value: t.teamName }
          comp.push(
            <TeamItemWrapper
              locked={!this.sessionStarted || hasTimer}
              id={`${resultOptionLoadId}-${i}`}
              key={`result-option-load${i}`}
              backgroundColor={hasTimer ? PlayColors[item.type] : '#808285'}
              marginRight={i < this.props.PrePlayStore.teams.length - 1}
              onClick={
                !this.sessionStarted
                  ? null
                  : hasTimer
                  ? null
                  : this.handleSelectAnswer.bind(
                      this,
                      item.multiplierChoices[0],
                      i,
                      resultOptionLoadId,
                      2,
                      null,
                      automationMultiplierFlag
                    )
              }
            >
              <TeamItem team={t} />
            </TeamItemWrapper>
          )
        }
      } else {
        if (this.MAIN_CHOICE && this.MAIN_CHOICE.choices) {
          const choices = this.MAIN_CHOICE.choices.sort(
            (a, b) => a.sequence - b.sequence
          )
          for (let i = 0; i < choices.length; i++) {
            const resultOptionLoadId = `currentplay-result-option-${this.props.item.type}-1-${this.props.item.id}`
            const automationMultiplierFlag = `currentplay-result-option-${this.props.item.type}-1`
            const mulChoice = choices[i]
            const propsItemChoice = this.props.item.choices.filter(
              o =>
                (o.value || '').toLowerCase() ===
                (mulChoice.value || '').toLowerCase()
            )[0]
            if (propsItemChoice) {
              comp.push(
                <ResultOption
                  locked={!this.sessionStarted || hasTimer}
                  id={`${resultOptionLoadId}-${i}`}
                  key={`result-option-load${i}`}
                  color={'#ffffff'}
                  backgroundColor={hasTimer ? PlayColors[item.type] : '#808285'}
                  marginRight={i < this.MAIN_CHOICE.choices.length - 1}
                  onClick={
                    !this.sessionStarted
                      ? null
                      : hasTimer
                      ? null
                      : this.handleSelectAnswer.bind(
                          this,
                          this.MAIN_CHOICE,
                          i,
                          resultOptionLoadId,
                          2,
                          null,
                          automationMultiplierFlag
                        )
                  }
                >
                  {propsItemChoice.value}
                </ResultOption>
              )
            }
          }
        }
      }

      return comp
    }

    return null
  }

  MultiplierResultOptions() {
    let comp = []
    let { item } = this.props
    let hasTimer = item.length > 0 ? true : false

    for (let i = 0; i < item.multiplierItems.length; i++) {
      const multiplierChoice = item.multiplierItems[i]
      const choices = item.multiplierItems[i].choices
      const previousAnswer = item.multiplierItems[i].previousAnswer
      const multiplier = item.multiplierItems[i].multiplier

      const prevItemToLock = item.multiplierChoices[i]

      comp.push(
        <MultiplierResultOptionWrapperOuterRow key={i}>
          <PreviousAnswer>{previousAnswer}</PreviousAnswer>
          <MultiplierLabel>{multiplier}x</MultiplierLabel>
          <MultiplierResultOptionWrapperInner>
            {choices.map((choice, idx) => {
              const resultOptionLoadMultiplierId = `currentplay-result-option-${this.props.item.type}-${multiplier}-${this.props.item.id}`
              const automationMultiplierFlag = `currentplay-result-option-${this.props.item.type}-${multiplier}`
              return (
                <ResultOption
                  locked={!this.sessionStarted}
                  id={`${resultOptionLoadMultiplierId}-${idx}`}
                  key={idx}
                  color={'#ffffff'}
                  backgroundColor={hasTimer ? PlayColors[item.type] : '#808285'}
                  marginRight={idx < choices.length - 1}
                  onClick={
                    !this.sessionStarted
                      ? null
                      : this.handleSelectAnswer.bind(
                          this,
                          multiplierChoice,
                          idx,
                          resultOptionLoadMultiplierId,
                          i + 3,
                          prevItemToLock,
                          automationMultiplierFlag
                        )
                  }
                >
                  {choice.value}
                </ResultOption>
              )
            })}
          </MultiplierResultOptionWrapperInner>
        </MultiplierResultOptionWrapperOuterRow>
      )
    }

    return comp
  }

  copyChoicesIntoMultiplierChoices() {
    const multiChoice = this.props.item.multiplierChoices[0]
    if (multiChoice) {
      if (!multiChoice.question || multiChoice.question.trim().length < 1) {
        multiChoice.question = this.props.item.playTitle.value
      }
      multiChoice.choices = this.props.item.choices
    }
  }

  componentWillUnmount() {
    this.destroySessionMode()
  }

  componentWillMount() {
    //---this.copyChoicesIntoMultiplierChoices()

    this.props.killPlayRemoved(false)

    if (!this.props.item.sponsor) {
      this.props.item.sponsor = this.props.PrePlayStore.sponsors[0]
    }

    this.props.item.multiplierItems = []
    this.props.item.showNextPlayAd = this.props.item.length > 0 ? true : false
    this.values = this.props.item
    this.timeLeft = this.props.item.length
    this.adLeft = this.props.item.sponsor.length

    if (this.props.item.lockedOut) {
      this.preStarted = true
      this.isStarted = true
    }
  }

  componentDidMount() {
    this.activePlay = this.props.item

    this.result.id = this.props.item.id
    this.result.type = this.props.item.type
    this.result.withStar = this.props.item.stars
    this.result.selectedTeam = this.props.item.team

    setTimeout(() => {
      //this.props.loadPlay(this.activePlay)
      this.timeLeftCountdown()
    }, 0)

    delete this.props.item.editorEvents
  }

  timeLeftCountdown() {
    this.timeLeftPauseAnim = true
    this.adLeftPauseAnim = true

    if (this.timeLeft) {
      if (!this['playitemload-timeleft-' + this.props.item.index]) {
        return
      }

      let startTimer = () => {
        this.timeLeftPauseAnim = false
        TweenMax.set(this['playitemload-timeleft-' + this.props.item.index], {
          opacity: 1,
        })
        this.timeLeftCheck = setInterval(() => {
          this.timeLeft = this.timeLeft - 1
          if (!this.timeLeft) {
            clearInterval(this.timeLeftCheck)
            TweenMax.set(
              this['playitemload-timeleft-' + this.props.item.index],
              { opacity: 0.1 }
            )
            this.timeLeftPauseAnim = true
            this.adLeftCountdown()
          }
        }, 1000)
      }

      setTimeout(() => {
        startTimer()
      }, 2000)
    }
  }

  adLeftCountdown() {
    if (this.adLeft) {
      if (!this['playitemload-adleft-' + this.props.item.index]) {
        return
      }

      let startTimer = () => {
        this.adLeftPauseAnim = false
        TweenMax.set(this['playitemload-adleft-' + this.props.item.index], {
          opacity: 1,
        })
        this.props.killPlayRemoved(true)
        this.adLeftCheck = setInterval(() => {
          this.adLeft = this.adLeft - 1
          if (!this.adLeft) {
            clearInterval(this.adLeftCheck)
            TweenMax.set(this['playitemload-adleft-' + this.props.item.index], {
              opacity: 0.1,
            })
            this.adLeftPauseAnim = true
            this.result.resultTitle = ''
            this.result.selectedTeam = this.props.PrePlayStore.teams[0]
            this.props.showResult(this.result)
            setTimeout(() => {
              this.props.resolve()
            }, 0)
          }
        }, 1000)
      }

      setTimeout(() => {
        startTimer()
      }, 2000)
    }
  }

  render() {
    let { item } = this.props
    let bg = PlayColors[this.props.item.type]
    // let isLocked =
    //   !this.isEnded ||
    //   this.pushed ||
    //   (!this.result.correctAnswer ||
    //     !this.result.selectedTeam ||
    //     !this.result.resultTitle)

    let isLocked =
      !this.isStarted ||
      !this.result.correctAnswer ||
      !this.result.selectedTeam ||
      !this.result.resultTitle

    let isEndPlayButtonHidden =
      this.props.item.multiplierItems.length + 1 !==
      this.result.correctAnswers.length
        ? true
        : false

    const endButtonId = `end-button-${item.type}-${item.id}`

    return (
      <Container>
        <RowWrapper>
          <Wrapper>
            <StackWrapper>
              <Main>
                <PlayStatusWrapper />
                <PlayTypeDD>
                  <PrePlayLocked backgroundColor={bg} text={item.type} />
                </PlayTypeDD>
                <SelectTypeLocked>{item.preset.preset}</SelectTypeLocked>
                <QuestionInputLocked>
                  {item.playTitle.value}
                </QuestionInputLocked>
                <OptionInputsWrapper>
                  {this.ResultOptions()}
                </OptionInputsWrapper>
                <StarWrapper>
                  <DDStar
                    locked
                    item={item}
                    height={h}
                    index={'playitemload-' + item.index}
                    //value={val => {this.props.item.stars = val}}
                  />
                </StarWrapper>
                <SponsorBrandWrapper>
                  <DDSponsorBrand
                    height={h}
                    index={'playitemload-' + item.index}
                    selectedSponsor={item.sponsor}
                    value={val => {
                      item.sponsor = val
                    }}
                    locked
                  />
                </SponsorBrandWrapper>
                {item.length > 0 ? (
                  <TimerGroup>
                    <TimeLeft
                      innerRef={ref =>
                        (this['playitemload-timeleft-' + item.index] = ref)
                      }
                    >
                      <TimeLeftLabel>TIME LEFT</TimeLeftLabel>
                      <TimeLeftTimer>
                        <PACircle
                          size={9}
                          value={true}
                          pauseAnim={this.timeLeftPauseAnim}
                        >
                          <Bold>{this.timeLeft}s</Bold>
                        </PACircle>
                      </TimeLeftTimer>
                    </TimeLeft>
                    <AdLeft
                      innerRef={ref =>
                        (this['playitemload-adleft-' + item.index] = ref)
                      }
                    >
                      <TimeLeftLabel>AD LEFT</TimeLeftLabel>
                      <TimeLeftTimer>
                        <PACircle
                          size={9}
                          value={true}
                          pauseAnim={this.adLeftPauseAnim}
                        >
                          <Bold>{this.adLeft}s</Bold>
                        </PACircle>
                      </TimeLeftTimer>
                    </AdLeft>
                  </TimerGroup>
                ) : (
                  <PIPAutoLockIn color={PlayColors[this.props.item.type]}>
                    <PIPAutoLockInTimer
                      backgroundColor={PlayColors[this.props.item.type]}
                    >
                      {'0s'}
                    </PIPAutoLockInTimer>
                  </PIPAutoLockIn>
                )}
              </Main>

              <Sub id={`sub-container-${item.index}`} />
              <MultiplierWrapper>
                {this.MultiplierResultOptions()}
              </MultiplierWrapper>
            </StackWrapper>

            {item.length > 0 ? null : (
              <ResultWrapper>
                <BlankCell />
                <ResultLabel>RESULTS</ResultLabel>
                <ResultTitleInput
                  innerRef={ref => (this.ResultTitleInput = ref)}
                  type="text"
                  placeholder="results field"
                  value={this.result.resultTitle}
                  onChange={this.handleResultTitleChange.bind(this)}
                />
                {this.props.PrePlayStore.teams ? (
                  <TeamWrapper>
                    <DDTeam
                      locked={this.pushed}
                      item={item}
                      height={h}
                      index={'playitemload-' + item.index}
                      teams={this.props.PrePlayStore.teams}
                      reference={ref =>
                        (this[`playitemload-${item.index}`] = ref)
                      }
                      value={val => {
                        this.result.selectedTeam = val
                      }}
                    />
                  </TeamWrapper>
                ) : (
                  <DDTeamLoading />
                )}
                {/*TO BE DELETED
            <ResultButton
              locked={isLocked}
              onClick={isLocked ? null : this.handleShowResultClick.bind(this)}
            >
              <Prompt id={'prompt-required'}>
                {this.error ? (
                  <div>
                    <div>Required:</div>
                    {this.error.map((err, idx) => {
                      return <div key={idx}>{err}</div>
                    })}
                  </div>
                ) : null}
              </Prompt>
            </ResultButton>
*/}
              </ResultWrapper>
            )}
          </Wrapper>

          <EndPlayButtonBig
            id={endButtonId}
            locked={!this.sessionStarted || isEndPlayButtonHidden}
            onClick={
              !this.sessionStarted
                ? null
                : this.handleEndPlayClick.bind(this, endButtonId)
            }
          />
        </RowWrapper>
      </Container>
    )
  }
}

const h = 5
let FONT_SIZE = '1.8'

const Container = styled.div`
  width: 100%;
  height: auto;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
  display: flex;
`
const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const RowWrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  //justify-content: space-between;
`

const EndPlayButtonBig = styled.div`
  position: absolute;
  left: 92.8%;
  width: 7.2%;
  height: 100%;
  background-color: #c61818;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${props => 2.4}vh;
  color: white;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: 'END PLAY';
  }
  visibility: ${props => (props.locked ? 'hidden' : 'visible')};
`

const Wrapper = styled.div`
  width: inherit;
  height: inherit;
  margin-top: ${props => 0.1}vh;
  margin-bottom: ${props => 0.1}vh;
  padding: ${props => 5}vh 0 ${props => 5}vh 0;
`

const Main = styled.div`
  width: inherit;
  height: ${props => h}vh;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Sub = styled.div`
  width: 90%;
  background: yellow;
`

const PrePlayLocked = styled.div`
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
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-image: url(${LockWhiteIcon});
  background-repeat: no-repeat;
  background-size: 50%;
  background-position: center;
`

const QuestionInputLocked = styled.div`
  width: 16%;
  height: inherit;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  text-indent: ${props => 1}vh;
  background-color: #ffffff;
  display: flex;
  align-items: center;
`

const SelectTypeLocked = styled.div`
  width: 7%;
  height: ${props => h}vh;
  background-color: #e5e5e5;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #000000;
  line-height: 1;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
`

const OptionInputsWrapper = styled.div`
  width: 20%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const StarWrapper = styled.div`
  width: 2.6%;
  height: ${props => h}vh;
`
const SponsorBrandWrapper = styled.div`
  width: 13%;
  height: ${props => h}vh;
`

const TeamItemWrapper = styled.div`
  width: 100%;
  height: inherit;
  background-color: ${props => props.backgroundColor || '#808285'};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  ${props => (props.marginRight ? `margin-right:${0.2}vh` : ``)};
`

const StackWrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: column;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
`

const MultiplierWrapper = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  flex-direction: column;
`

const ResultWrapper = styled.div`
  width: 100%;
  height: ${props => h}vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  margin-top: ${props => 0.2}vh;
`

const BlankCell = styled.div`
  width: 54%;
  height: ${props => h}vh;
`

const ResultLabel = styled.div`
  width: 5%;
  height: ${props => h}vh;
  background-color: #18c5ff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ResultOption = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: ${props => props.backgroundColor || '#808285'};
  text-align: center;
  text-transform: uppercase;
  color: ${props => props.color};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  ${props => (props.marginRight ? `margin-right:${0.2}vh` : ``)};
`

const MultiplierResultOptionWrapperOuterRow = styled.div`
  height: inherit;
  display: flex
  flex-direction: row;
  margin-top: ${props => 0.2}vh;
  margin-left: 25.1%;
`

const MultiplierResultOptionWrapperInner = styled.div`
  //width: ${props => 19.8}vw;
  width: 26.59%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const PreviousAnswer = styled.div`
  width: ${props => 6.9}vw;
  height: inherit;
  background-color: #0fbc1c;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  color: #ffffff;
`

const MultiplierLabel = styled.div`
  width: ${props => 2}vw;
  height: inherit;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  color: #ffffff;
`

const ResultTitleInput = styled.input`
  width: 23%;
  height: inherit;
  background-color: #ffffff;
  text-indent: ${props => 1}vh;
  border: none;
  outline: none;
  text-transform: uppercase;
  color: #000000;
  border-right: ${props => 0.1}vh solid #414042;
`

const DDTeamLoading = styled.div`
  width: ${props => 15}vh;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  color: #000000;
  &:after {
    content: 'LOADING...';
  }
`

const TeamWrapper = styled.div`
  width: 10.4%;
  height: inherit;
  //border-left: ${props => 0.2}vh solid black;
  position: relative;
`

const PIPAutoLockIn = styled.div`
  width: 22.8%;
  height: inherit;
  color: ${props => props.color || '#c61818'};
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &:after {
    content: 'PIP - AUTO LOCK IN';
  }
  opacity: ${props => (props.isStarted ? 0.2 : 1)};
`

const PIPAutoLockInTimer = styled.div`
  width: ${props => 5}vh;
  height: ${props => 5}vh;
  border-top-left-radius: ${props => 5}vh;
  border-bottom-left-radius: ${props => 5}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0;
  font-family: pamainregular;
  font-size: ${props => 2.3}vh;
  color: #ffffff;
  background-color: ${props => props.backgroundColor || '#c61818'};
`

const ButtonGroup = styled.div`
  height: inherit;
  display: flex;
  flex-direction: row;
`

const StartPlayButton = styled.div`
  width: ${props => 25}vh;
  height: inherit;
  color: ${props => props.color || '#c61818'};
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '${props => props.text}';
  }
  opacity: ${props => (props.isStarted ? 0.2 : 1)};
`

const EndPlayButton = styled.div`
  width: ${props => 25}vh;
  height: inherit;
  color: #ffffff;
  background-color: ${props => props.backgroundColor || '#c61818'};
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '${props => props.text}';
  }
  position: relative;
  opacity: ${props => (props.locked ? 0.2 : 1)};
`

const Prompt = styled.span`
  visibility: hidden;
  width: auto;
  min-width: ${props => 16}vh;
  background-color: #17c5ff;
  text-align: center;
  border-radius: ${props => 0.5}vh;
  padding: ${props => 0.5}vh ${props => 0.5}vh;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  right: 0;
  margin-left: ${props => -8}vh;
  opacity: 0;
  transition: opacity 0.3s;
  font-family: pamainregular;
  font-size: ${props => 2}vh;
  color: #000000;

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: ${props => -0.8}vh;
    border-width: ${props => 0.8}vh;
    border-style: solid;
    border-color: #17c5ff transparent transparent transparent;
  }
`

const ResultButton = styled.div`
  width: ${props => 10}vh;
  height: inherit;
  color: #18c5ff;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:before {
    content: 'PUSH';
    margin-left: ${props => 2}vh;
  }
  &:after {
    width: ${props => h}vh;
    height: ${props => h}vh;
    content: '';
    background-image: url(${ArrowPushIcon});
    background-repeat: no-repeat;
    background-size: 50%;
    background-position: center;
  }

  -webkit-filter: ${props => (props.locked ? 'grayscale(1)' : 'grayscale(0)')};
  opacity: ${props => (props.locked ? 0.2 : 1)};
`

const TimerGroup = styled.div`
  height: auto;
  display: flex;
  flex-direction: row;
`

const TimeLeft = styled.div`
  width: ${props => 25}vh;
  height: inherit;
  display: flex;
  flex-direction: row;
  justify-content: center;
  opacity: 0.2;
`

const TimeLeftLabel = styled.div`
  height: inherit;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: white;
`

const TimeLeftTimer = styled.div`
  height: inherit;
  display: flex;
  align-items: center;
  color: white;
  padding: ${props => 1}vh;
`

const Bold = styled.span`
  font-family: pamainregular;
`

const AdLeft = styled.div`
  width: ${props => 25}vh;
  height: inherit;
  display: flex;
  flex-direction: row;
  justify-content: center;
  opacity: 0.1;
`
