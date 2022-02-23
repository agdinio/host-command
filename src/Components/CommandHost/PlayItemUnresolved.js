import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax, TimelineMax } from 'gsap'
import { PACircle } from '@/Components/PACircle'
import UnresolvedIcon from '@/assets/images/preplay-unresolved.svg'
import DDSponsorBrand from '@/Components/CommandHost/Common/DDSponsorBrand'
import DDStar from '@/Components/CommandHost/Common/DDStar'
import TeamItem from '@/Components/CommandHost/Common/TeamItem'
import PendingIndicatorIcon from '@/assets/images/pending-indicator.svg'
import { vhToPx } from '@/utils'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject('PrePlayStore', 'CommandHostStore', 'AutomationStore', 'GameStore')
@observer
export default class PlayItemUnresolved extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      error: null,
      pushed: false,
      isStarted: false,
      isEnded: false,
      result: {
        id: 0,
        type: '',
        correctAnswer: '',
        correctAnswers: [],
        resultTitle: '',
        selectedTeam: {},
        withStar: false,
      },
      isResolving: false,
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
        this.forceUpdate()
        return change
      }
    )
  }

  handleStartPlayClick() {
    this.isStarted = true
    this.props.startPlay()
  }

  handleEndPlayClick() {
    this.isEnded = true
    this.props.endPlayResult()
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

          TweenMax.set(option, { backgroundColor: '#0fbc1c' })

          this.props.AutomationStore.addTempUnresolvedEvent({
            evt: 'click',
            refId: `${reference}-${i}`,
            wait: 0.5,
            playId: this.props.item.id,
            multiplierFlag: automationMultiplierFlag,
          })
        } else {
          TweenMax.set(option, { backgroundColor: '#808285' })
        }
      }
    }, 0)
  }

  async handleConfirmClick(itemId, refId) {
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
      ////////////////////////////////////////////////////////this.props.AutomationStore.resetCurrentTime()
    }

    this.isResolving = true

    this.result.correctAnswers.forEach(correctAnswer => {
      const option = document.getElementById(correctAnswer.highlightedOption)
      TweenMax.set(option, { backgroundColor: '#18c5ff' })
    })

    this.result.selectedTeam = this.props.item.team
    this.result.status = 'pending'

    this.props.item.result = this.result
    TweenMax.set(this[`pending-indicator-${itemId}`], { display: 'flex' })
    setTimeout(() => {
      this.props.resolvePending({
        id: this.props.item.id,
        result: this.result,
        executionType: this.props.GameStore.executionType,
        editorEvents:
          'recording' === this.props.GameStore.executionType
            ? _editorEvents
            : null,
      })
      this.props.AutomationStore.resetTempUnresolvedEvents()
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

  ResultOptions() {
    let comp = []
    let { item } = this.props

    if (item) {
      let multiplierChoice = item.multiplierChoices[0]

      if (
        'A-B (TEAMS)' === item.multiplierChoices[0].preset.trim().toUpperCase()
      ) {
        for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
          const resultOptionLoadId = `unresolvedplay-result-option-${this.props.item.type}-1-${this.props.item.id}`
          const automationMultiplierFlag = `unresolvedplay-result-option-${this.props.item.type}-1`
          const t = this.props.PrePlayStore.teams[i]
          item.multiplierChoices[0].choices[i] = { id: t.id, value: t.teamName }
          comp.push(
            <TeamItemWrapper
              locked={!this.sessionStarted}
              id={`${resultOptionLoadId}-${i}`}
              key={i}
              marginRight={i < this.props.PrePlayStore.teams.length - 1}
              onClick={
                !this.sessionStarted
                  ? null
                  : this.handleSelectAnswer.bind(
                      this,
                      multiplierChoice,
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
            const resultOptionLoadId = `unresolvedplay-result-option-${this.props.item.type}-1-${this.props.item.id}`
            const automationMultiplierFlag = `unresolvedplay-result-option-${this.props.item.type}-1`
            const mulChoice = choices[i]
            const propsItemChoice = this.props.item.choices.filter(
              o =>
                (o.value || '').toLowerCase() ===
                (mulChoice.value || '').toLowerCase()
            )[0]
            if (propsItemChoice) {
              comp.push(
                <ResultOption
                  //locked={item.multiplierChoices[0].locked}
                  locked={!this.sessionStarted}
                  id={`${resultOptionLoadId}-${i}`}
                  key={i}
                  color={'#ffffff'}
                  marginRight={i < this.MAIN_CHOICE.choices.length - 1}
                  onClick={
                    !this.sessionStarted
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

    for (let i = 0; i < item.multiplierItems.length; i++) {
      const multiplierChoice = item.multiplierItems[i]
      const choices = item.multiplierItems[i].choices
      const previousAnswer = item.multiplierItems[i].previousAnswer
      const multiplier = item.multiplierItems[i].multiplier

      const prevItemToLock = item.multiplierChoices[i]
      const currItemToLock = item.multiplierChoices[i + 1]
      const reference = 'result-option-multiplier-unresolved-' + item.index

      comp.push(
        <MultiplierResultOptionWrapperOuterRow key={i}>
          <PreviousAnswer>{previousAnswer}</PreviousAnswer>
          <MultiplierLabel>{multiplier}x</MultiplierLabel>
          <MultiplierResultOptionWrapperInner>
            {choices.map((choice, idx) => {
              const resultOptionLoadMultiplierId = `unresolvedplay-result-option-${this.props.item.type}-${multiplier}-${this.props.item.id}`
              const automationMultiplierFlag = `unresolvedplay-result-option-${this.props.item.type}-${multiplier}`
              return (
                <ResultOption
                  //locked={currItemToLock.locked}
                  locked={!this.sessionStarted}
                  id={`${resultOptionLoadMultiplierId}-${idx}`}
                  key={idx}
                  color={'#ffffff'}
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

    // if (item.multiplierItems.length > 0) {
    //   comp.push(<MultiplierResultOptionRemoveButton key={10} onClick={ () => {
    //     console.log('RESULT - CORRECT ANSWERS', this.result.correctAnswers)
    //   } } />)
    // }

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
    //--this.copyChoicesIntoMultiplierChoices()

    this.props.item.multiplierItems = []
    this.props.item.showNextPlayAd = this.props.item.length > 0 ? true : false
  }

  componentDidMount() {
    this.result.id = this.props.item.id
    this.result.type = this.props.item.type
    this.result.withStar = this.props.item.stars

    delete this.props.item.editorEvents
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  render() {
    let { item } = this.props
    let bg = PlayColors[this.props.item.type]

    //let isLocked = this.result.correctAnswer ? false : true
    let isLocked = !this.sessionStarted
      ? true
      : this.props.item.multiplierItems.length + 1 !==
        this.result.correctAnswers.length
      ? true
      : false

    const unresolvedButtonId = `unresolved-button-${item.type}-${item.id}`

    return (
      <Container>
        <StackWrapper>
          <Main>
            <PlayStatusWrapper />
            <PlayTypeDD>
              <PrePlayLocked backgroundColor={bg} text={item.type} />
            </PlayTypeDD>
            <SelectTypeLocked>{this.MAIN_CHOICE.preset}</SelectTypeLocked>
            <QuestionInputLocked>
              {this.MAIN_CHOICE.question}
            </QuestionInputLocked>
            <OptionInputsWrapper>{this.ResultOptions()}</OptionInputsWrapper>
            <StarWrapper>
              <DDStar
                locked
                item={item}
                height={h}
                index={'playitemunresolved-' + item.index}
                value={val => {
                  this.props.item.stars = val
                }}
              />
            </StarWrapper>
            <SponsorBrandWrapper>
              <DDSponsorBrand
                height={h}
                index={'playitemunresolved-' + item.index}
                selectedSponsor={item.sponsor}
                value={val => {
                  item.sponsor = val
                }}
                locked
              />
            </SponsorBrandWrapper>
            <ButtonGroup>
              <PlayAnalyticsButton color={PlayColors[this.props.item.type]} />
              <ConfirmButton
                id={unresolvedButtonId}
                locked={isLocked}
                resolving={this.isResolving}
                onClick={
                  isLocked || this.isResolving
                    ? null
                    : this.handleConfirmClick.bind(
                        this,
                        this.props.item.id,
                        unresolvedButtonId
                      )
                }
              >
                <PendingIndicator
                  src={PendingIndicatorIcon}
                  innerRef={ref =>
                    (this[`pending-indicator-${this.props.item.id}`] = ref)
                  }
                />
              </ConfirmButton>
            </ButtonGroup>
          </Main>

          <MultiplierWrapper>
            {this.MultiplierResultOptions()}
          </MultiplierWrapper>
        </StackWrapper>
      </Container>
    )
  }
}

const h = 5
let FONT_SIZE = '1.8vh'

const Container = styled.div`
  width: 100%;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
  height: auto;
  margin-bottom: ${props => 0.2}vh;
`
const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
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
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-image: url(${UnresolvedIcon});
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
  display: flex;
`

const TeamItemWrapper = styled.div`
  width: 100%;
  height: inherit;
  background-color: #808285;
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

const ResultOption = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: #808285;
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
  margin-left: 24.6%;
`

const MultiplierResultOptionWrapperInner = styled.div`
  width: 26.55%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const PreviousAnswer = styled.div`
  width: 10%;
  height: inherit;
  background-color: #0fbc1c;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  color: #ffffff;
`

const MultiplierLabel = styled.div`
  //width: ${props => 4}vh;
  width: 2.5%;
  height: inherit;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  color: #ffffff;
`

const ResultTitleInput = styled.input`
  width: ${props => 37}vh;
  height: inherit;
  background-color: #ffffff;
  text-indent: ${props => 1}vh;
  border: none;
  outline: none;
  text-transform: uppercase;
  color: #000000;
  border-right: ${props => 0.1}vh solid #414042;
`

const ButtonGroup = styled.div`
  width: 27%;
  height: 100%;
  display: flex;
  justify-content: space-between;
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

const PlayAnalyticsButton = styled.div`
  //width: ${props => 25}vh;
  width: 50%;
  height: inherit;
  color: ${props => props.color || '#c61818'};
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'PLAY ANALYTICS';
  }
`

const ConfirmButton = styled.div`
  //width: ${props => 25}vh;
  width: 50%;
  height: inherit;
  color: #ffffff;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked || props.resolving ? 'default' : 'pointer')};
  opacity: ${props => (props.locked ? 0.2 : 1)};
  &:before {
    content: 'RESOLVE';
    width: 100%;
    display: flex;
    justify-content: center;
  }
`

const EndPlayButton = styled.div`
  width: ${props => 25}vh;
  height: inherit;
  color: ${props =>
    props.isStarted && !props.isEnded ? '#ffffff' : '#cccccc'};
  background-color: ${props => props.backgroundColor || '#c61818'};
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '${props => props.text}';
  }
  position: relative;
  opacity: ${props => (props.isStarted && !props.isEnded ? 1 : 0.2)};
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
  //left: 50%;
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

const PendingIndicator = styled.div`
  width: auto;
  height: 100%;
  display: none;
  align-items: center;
  margin-right: 3%;
  &:after {
    content: '';
    display: block;
    width: ${props => h * 0.75}vh;
    height: ${props => h * 0.75}vh;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: contain;
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

const Section = styled.div`
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction: row;
`
