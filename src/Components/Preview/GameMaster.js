import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import { PACircle } from '@/Components/PACircle'
import AbSlider from './Slider/ABSlider'
import Multi from './Slider/MultiSelectSlider'
import FeeCounter from './FeeCounter'
import styled, { keyframes } from 'styled-components'
import { TweenMax, TimelineMax } from 'gsap'
import { vhToPx, hex2rgb, evalImage } from '@/utils'
import GameMasterIntro from './GameMasterIntro'
let h = 0

@observer
export default class GameMasterQuestion extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    extendObservable(this, {
      timer: this.props.question.length,
      fadeInFeeCounter: false,
      isTimerExpired: false,
      isInsertedWhenTimeIsUp: false,
      check: undefined,
      showTextCard: false,
      localLockout: false,
    })
  }


  componentDidMount() {
    let questionwrapper = document.getElementById('questionwrapper')
    TweenMax.to(this.IntroWrapper, 0.5, {
      opacity: 0,
      delay: 2,
      onStart: () => {
        TweenMax.to(questionwrapper, 0.5, {
          opacity: 1,
        })
      },
    })
  }

  handleFeeCounterValue(response) {

  }

  render() {
    const { question, sponsorLogo, height } = this.props
    const Slider = question.choiceType === 'MULTI' ? Multi : AbSlider

    return (
      <Container>
        <MasterContainer
          color={question.backgroundColor}
          innerRef={ref => (this.MasterContainer = ref)}
        >
          <IntroWrapper innerRef={ref => (this.IntroWrapper = ref)}>
            <GameMasterIntro sponsorLogo={sponsorLogo} height={height} />
          </IntroWrapper>

          <QuestionWrapper
            innerRef={ref => (this.QuestionWrapper = ref)}
            id="questionwrapper"
          >
            <FadeIn>
              <QuestionContainer>
                <HiddenTimer>
                  ID:
                  {question.id}
                  &nbsp;&nbsp;&nbsp;
                </HiddenTimer>
                <QuestionSponsorWrapper>
                  {sponsorLogo && sponsorLogo.image ? (
                    <Sponsor
                      src={evalImage(sponsorLogo.image)}
                      height={2}
                      marginRight={1}
                    />
                  ) : null}
                  <QuestionText maxWidth={50}>
                    {question.playTitle}
                  </QuestionText>
                </QuestionSponsorWrapper>
                <PACircleWrapper>
                  {this.timer ? (
                    <PACircle value={true}>{this.timer}s</PACircle>
                  ) : null}
                </PACircleWrapper>
              </QuestionContainer>
              <div style={{ width: 'inherit' }}>
                <Slider
                  currentPrePick={1}
                  teams={this.props.teams}
                  question={question}
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
                    height={height}
                  />
                </LowerRight>
              </LowerSection>
            </FadeIn>
          </QuestionWrapper>
        </MasterContainer>
      </Container>
    )
  }
}

const LowerSection = styled.div`
  flex-direction: row;
  justify-content: space-between;
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
  width: inherit;
  height: inherit;
`

const MasterContainer = styled.div`
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  background-color: ${props =>
    props.color ? hex2rgb(props.color, 0.8) : hex2rgb('#c61818', 0.8)};
  border-top: ${props => vhToPx(h * 0.005)} solid rgba(255, 255, 255, 0.2);

  position: absolute;
`

const IntroWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
`

const QuestionWrapper = styled.div`
  width: 100%;
  height: 100%;
  opacity: 0;
`

const QuestionContainer = styled.div`
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: inherit;
`
const QuestionSponsorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const QuestionText = styled.span`
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.04)};
  text-transform: uppercase;
  color: #ffffff;
  width: auto;
  //max-width: ${props => props.maxWidth || 'auto'}%;
  line-height: 1;
`
const PACircleWrapper = styled.div``

const FadeIn = styled.div`
  padding: 5% 4.5% 5% 4.5%;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: inherit;
  height: inherit;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
`

const Sponsor = styled.img`
  height: ${props => vhToPx(h * (props.height/100 || 5/100))};
  margin-right: ${props => vhToPx(h * (props.marginRight/100 || 0))};
`

const fadeInTop = keyframes`
  0% {opacity:0;position: relative; top: -500px;}
  100% {opacity:1;position: relative; top: 0px; height:inherit;}
`

const fadeOutBottom = keyframes`
  0% {opacity:1; }
  99% {opacity: 0; height: inherit;}
  100% {opacity:0;height: 0px;}
`

const TCContainer = styled.div`
  width: inherit;
  height: inherit;
`

const HiddenTimer = styled.div`
  position: absolute;
  left: 5%;
  bottom: 5%;
  display: none;
`
