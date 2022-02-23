import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import AbSlider from './Slider/ABSlider'
import Multi from './Slider/MultiSelectSlider'
import FeeCounter from './FeeCounter'
import styled, { keyframes } from 'styled-components'
import token from '@/assets/images/playalong-token.svg'
import { vhToPx, hex2rgb, toFootage, responsiveDimension } from '@/utils'
let h = 0

@observer
export default class MultiplierQuestion extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    extendObservable(this, {
      timer: 0,
      fadeInFeeCounter: false,
      isTimerExpired: false,
      isInsertedWhenTimeIsUp: false,
      check: null,
      localLockout: false,
    })

  }

  handleFeeCounterValue(response) {

  }

  componentDidMount() {

    setTimeout(() => {
      this.fadeInFeeCounter = true
    }, 2000)
  }

  render() {
    const { question, height } = this.props
    const Slider = question.choiceType === 'MULTI' ? Multi : AbSlider
    return (
      <Container color={question.backgroundColor}>
        <FadeIn>
          <QuestionContainer>
            <QuestionTitle>{question.playTitle}</QuestionTitle>
          </QuestionContainer>
          <div style={{ width: '100%' }}>
            <Slider
              currentPrePick={1}
              teams={this.props.teams}
              question={this.props.question}
              groupComponent="LIVEGAME"
              feeCounterValue={2}
              height={height}
            />
          </div>
          <LowerSection>
            <LowerLeft>
              <PlaceYour>Place your</PlaceYour>
              <TokenFee>Token Fee</TokenFee>
              <Minimum>Minimum 1-10</Minimum>
            </LowerLeft>
            <LowerRight>
              <FeeCounter
                min={1}
                max={10}
                currentValue={2}
                maxSlidingDistance={100}
                maxAnimationSpeed={0.3}
                fadeIn={this.fadeInFeeCounter}
                handleSetFeeCounterValue={this.handleFeeCounterValue.bind(
                  this
                )}
                height={this.props.height}
              />
            </LowerRight>
          </LowerSection>
        </FadeIn>
      </Container>
    )
  }
}

const LowerSection = styled.div`
  flex-direction: row;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
  width: 100%;
  display: flex;
  align-items: center;
`

const LowerLeft = styled.div`
  flex-direction: column;
  display: flex;
  color: white;
  font-family: pamainregular;
  width: 50%;
  line-height: 1;
`

const PlaceYour = styled.span`
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(h * 0.008)};
  font-size: ${props => vhToPx(h * 0.031)};
`
const TokenFee = styled.span`
  text-transform: uppercase;
  font-size: ${props => vhToPx(h * 0.056)};
`

const Minimum = styled.span`
  text-transform: lowercase;
  font-size: ${props => vhToPx(h * 0.031)};
  letter-spacing: ${props => vhToPx(h * 0.005)};
`

const LowerRight = styled.div`
  width: 45%;
`

const Container = styled.div`
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  background-color: ${props =>
    props.color ? hex2rgb(props.color, 0.8) : 'rgb(162, 23, 23)'};
  border-top: ${props => vhToPx(h * 0.005)} solid rgba(255, 255, 255, 0.2);
`

const QuestionContainer = styled.div`
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: inherit;
`
const QuestionTitle = styled.span`
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.043)};
  text-transform: uppercase;
`

const FadeIn = styled.div`
  ${props =>
    props.fadeOut
      ? `animation: 0.4s ${fadeOutBottom} forwards;`
      : `animation: 0.4s ${fadeInTop} forwards;
      animation-delay: ${props.delay ? 0.4 : 0}s;
      `} padding: 5% 4.5% 5% 4.5%;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: inherit;
  height: inherit;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
`

const fadeInTop = keyframes`
  0% {opacity:0;position: relative; top: ${vhToPx(-(h * 0.45))};}
  100% {opacity:1;position: relative; top: 0; height:inherit;}
`

const fadeOutBottom = keyframes`
  0% {opacity:1; }
  99% {opacity: 0; height: inherit;}
  100% {opacity:0;height: 0px;}
`
