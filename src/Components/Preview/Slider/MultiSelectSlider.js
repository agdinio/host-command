import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { TweenMax, Linear, Ease } from 'gsap'
import BezierEasing from '@/bezier-easing'
import ChoiceIndicatorRing from './ChoiceIndicatorRing'
import icon_lock from '@/assets/images/preview/icon-lock.svg'
import StarIcon from '@/assets/images/preview/star-icon-gold.svg'
import * as util from '@/utils'

@observer
export default class MultiSelectSlider extends Component {
  constructor(props) {
    super(props)
    h = this.props.height

    extendObservable(this, {
      startPulse: true,
      timeout: null,
    })
  }

  componentWillUnmount() {
    this.reset()
  }

  reset() {
    TweenMax.set(this.refChoiceSlider, { display: 'none' })
    TweenMax.set(this.refBlankSlider, { backgroundColor: '#f0f2f2' })
  }

  onClickChoice(key) {
    if (this.props.handleLiveGameInterceptAnswer) {
      this.props.handleLiveGameInterceptAnswer(
        true,
        this.props.question.choices[key].nextId
      )
    }
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    TweenMax.fromTo(
      this.refChoiceSlider,
      0,
      {
        display: 'block',
        width:
          this.refBlankSlider.offsetWidth / this.props.question.choices.length,
      },
      {
        display: 'block',
        onComplete: this.slide.bind(this),
        onCompleteParams: [key],
      }
    )
    TweenMax.to(this.refBlankSlider, 0.1, { backgroundColor: '#bcbec0' })

    this.scale(key)
    if (this.props.groupComponent.toUpperCase() === 'PREPICK') {
      this.props.handleUpdateBackground(1)
    }
  }

  scale(key) {
    for (let i = 0; i < this.props.question.choices.length; i++) {
      if (key === i) {
        TweenMax.to(this[`refChoice${i}`], 0.5, {
          scale: 1.2,
          onStart: () => {
            this.props.LiveGameStore.setAnimCountPerQuestion(1)
          },
        })
      } else {
        TweenMax.to(this[`refChoice${i}`], 0.5, {
          scale: 0.7,
          onStart: () => {
            this.props.LiveGameStore.setAnimCountPerQuestion(1)
          },
        })
      }
    }
  }

  changeChoicesColor(key) {
    for (let i = 0; i < this.props.question.choices.length; i++) {
      if (key === i) {
        TweenMax.to(this[`refChoice${i}`], 0, {
          color: this.props.question.backgroundColor || '#FFFFFF',
        })
      } else {
        TweenMax.to(this[`refChoice${i}`], 0, { color: '#bcbec0' })
      }
    }
  }

  slide(key) {
    const bar = document.getElementById(`choiceBar`)
    if (!bar) {
      return
    }

    let leftChoiceSlider = this[`refChoice${key}`].offsetWidth * key
    TweenMax.to(this.refChoiceSlider, 0.5, {
      left: leftChoiceSlider,
      ease: new Ease(BezierEasing(0.77, 0, 0.175, 1)),
      onStart: () => {
        this.props.LiveGameStore.setAnimCountPerQuestion(1)
      },
    })

    let bal = 0
    switch (this.props.question.choices.length) {
      case 2:
        bal = 1
        break
      case 3:
        bal = 1
        break
      case 4:
        bal = 1
        break
      case 5:
        bal = 4
        break
      case 6:
        bal = 8
        break
    }
    let leftRing =
      this[`refChoice${key}`].offsetLeft +
      this[`refChoice${key}`].offsetWidth /
        (this.props.question.choices.length + bal)

    TweenMax.set(this.refChoiceIndicatorRing, { position: 'absolute' })
    TweenMax.to(this.refChoiceIndicatorRing, 0.5, {
      left: leftRing,
      ease: new Ease(BezierEasing(0.77, 0, 0.175, 1)),
      onStart: () => {
        this.props.LiveGameStore.setAnimCountPerQuestion(1)
      },
      onComplete: () => {
        this.timeout = setTimeout(() => {
          if (this.refChoiceIndicatorRing) {
            TweenMax.to(this.refChoiceIndicatorRing, 0.1, { display: 'none' })
          }
          if (this.refBlankSlider) {
            TweenMax.to(this.refBlankSlider, 0.1, {
              backgroundColor: '#58595b',
              onComplete: this.animSliderChoiceChangeColor.bind(this),
              onCompleteParams: [key],
            })
          }
        }, 1000) //orig 1500
      },
    })
  }

  animSliderChoiceChangeColor(key) {
    if (this.props.groupComponent.toUpperCase() === 'PREPICK') {
      this.props.handleUpdateBackground(2)
    }

    setTimeout(() => {
      this.changeChoicesColor(key)

      if (this.refChoiceSlider) {
        TweenMax.to(this.refChoiceSlider, 0, {
          backgroundColor:
            this.props.groupComponent.toUpperCase() === 'PREPICK'
              ? '#2fc12f'
              : '#ffffff',
        })
      }
      if (this.refLockingContainer) {
        TweenMax.to(this.refLockingContainer, 0.1, { zIndex: 1 })
      }

      this.props.handlePicksPointsTokenNotification({ isNotify: true })
      this.animateLockIcon(key)
      this.pushPrePickAnswer(key)
    }, 400)
  }

  animateLockIcon(key) {
    setTimeout(() => {
      if (this[`lock-${key}`]) {
        TweenMax.set(this[`lock-${key}`], { display: 'flex' })
      }
      if (this[`icon-lock-${key}`]) {
        TweenMax.set(this[`icon-lock-${key}`], {
          x: this[`icon-lock-${key}`].offsetWidth,
        })
        TweenMax.to(this[`icon-lock-${key}`], 0.2, { x: 0 })
      }
    }, 300)
  }

  /**
   *
   * SAVE ANSWER
   *
   */
  pushPrePickAnswer(key) {
    //MULTISELECT SLIDER
    const answer = {
      gameId: this.props.question.gameId,
      isMultiplier: this.props.question.isMultiplier || false,
      isQuestion: this.props.question.isQuestion,
      type: this.props.question.type || 'PrePick',
      prepickSequence: this.props.question.prepickSequence || 0,
      questionId: this.props.question.id,
      shortHand: this.props.question.shortHand,
      answer: this.props.question.choices[key].value,
      nextId: this.props.question.choices[key].nextId,
      feeCounterValue: this.props.feeCounterValue,
      correctAnswer: this.props.question.correctAnswer,
      choicesLength: this.props.question.choices.length,
      isPresetTeamChoice: this.props.question.isPresetTeamChoice,
      points: this.props.question.points,
      tokens: this.props.question.tokens,
      stars: this.props.question.stars,
      length: this.props.question.length,
      parentId: this.props.question.parentId,
      started: this.props.question.started,
    }

    this.props.PrePickStore.pushAnswer(answer)
    if (this.props.answered) {
      if ('PrePick' === this.props.question.type) {
        this.props.answered({
          gameId: this.props.question.gameId,
          type: this.props.question.type,
          prepickSequence: this.props.question.prepickSequence,
          shortHand: this.props.question.shortHand,
          questionId: this.props.question.id,
          answer: this.props.question.choices[key].value,
          correctAnswer: this.props.question.correctAnswer,
          points: this.props.question.points,
          tokens: this.props.question.tokens
        })
      } else {
        this.props.answered(answer)
      }
    }
  }

  render() {
    let { groupComponent, teams, question } = this.props
    let showStar = question.stars > 0

    const choices = question && question.choices ? question.choices.sort((a, b) => a.sequence - b.sequence ) : []

    return (
      <Container>
        <Wrapper id="choiceBar">
          <BlankSlider innerRef={c => (this.refBlankSlider = c)}>
            <ChoiceSlider innerRef={c => (this.refChoiceSlider = c)} />
          </BlankSlider>
          <ChoiceWrapper innerRef={c => (this.choiceWrapper = c)}>
            {(choices || []).map((item, key) => {
              return (
                <Choice
                  key={key}
                  id={`choice-${key}`}
                  innerRef={c => (this[`refChoice${key}`] = c)}
                >
                  <ChoiceText>{item.value}</ChoiceText>
                </Choice>
              )
            })}
          </ChoiceWrapper>
          <ChoiceIndicatorRingWrapper
            stars={question.stars}
            innerRef={c => (this.refChoiceIndicatorRing = c)}
          >
            {showStar ? (
              <StarWrapper>
                <Star src={StarIcon} />
              </StarWrapper>
            ) : null}
            <ChoiceIndicatorRing
              teams={teams && teams.length > 1 ? teams : []}
              isShowStar={showStar}
              question={question && Object.keys(question).length > 0 ? question : null}
              groupComponent={groupComponent}
              height={this.props.height}
            />
          </ChoiceIndicatorRingWrapper>
          <LockingContainer innerRef={c => (this.refLockingContainer = c)} />
        </Wrapper>
      </Container>
    )
  }
}

let h = 0

const Container = styled.div`
  width: 100%;
  height: ${props => util.vhToPx(h * 0.076)};
  position: relative;
`
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${props => util.vhToPx(h * 0.076)};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f2;
  -moz-box-shadow: ${props => util.vhToPx(h * 0.003)} ${props => util.vhToPx(h * 0.003)}
    rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: ${props => util.vhToPx(h * 0.003)} ${props => util.vhToPx(h * 0.003)}
    rgba(0, 0, 0, 0.2);
  box-shadow: ${props => util.vhToPx(h * 0.003)} ${props => util.vhToPx(h * 0.003)}
    rgba(0, 0, 0, 0.2);
`
const BlankSlider = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${props => util.vhToPx(h * 0.076)};
  background-color: #f0f2f2;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  overflow: hidden;
  justify-content: center;
  text-align: center;
  align-items: center;
  display: flex;
`
const ChoiceSlider = styled.div`
  position: absolute;
  background-color: #fff200;
  width: ${props => util.vhToPx(h * 0.01)};
  height: inherit;
  border-radius: ${props => util.vhToPx(h * 0.076)};
  display: none;
`
const ChoiceWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 1;
`

const IconLockOuterWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: none;
  justify-content: flex-end;
  transform: scale(0.85);
`

const IconLockWrapper = styled.div`
  width: ${props => util.vhToPx(h * 0.076)};
  height: ${props => util.vhToPx(h * 0.076)};
  border-radius: ${props => util.vhToPx(h * 0.076)};
  border: ${props => util.vhToPx(h * 0.005)} solid white;
  background-color: #000000;
  overflow: hidden;
`
const IconLockInner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  display: flex;
`
const IconLock = styled.img`
  height: 70%;
  width: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: ${props => util.vhToPx(0.8)} auto;
`
const Choice = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  text-align: center;
  color: #333333;
`
const ChoiceText = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-family: pamainbold;
  font-size: ${props => util.vhToPx(h * 0.026)};
  text-transform: uppercase;
`
const ChoiceIndicatorRingWrapper = styled.div`
  position: relative;
  width: auto;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
`
const ChoiceIndicatorRingWrapperORIG = styled.div`
  position: relative;
  width: auto;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
`

const LockingContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  background-color: transparent;
`

const StarWrapper = styled.div`
  width: 100%
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  bottom: 100%;
`

const Star = styled.div`
  width: ${props => util.vhToPx(h * 0.03)};
  height: ${props => util.vhToPx(h * 0.03)};
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: center;
  z-index: 10;
`

// MultiSelectSlider.propTypes = {
//   question: PropTypes.object.isRequired,
//   handlePicksPointsTokenNotification: PropTypes.func,
//   handleUpdateBackground: PropTypes.func,
//   onComplete: PropTypes.func,
// }
