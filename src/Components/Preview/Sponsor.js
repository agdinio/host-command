import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import { PACircle } from '@/Components/PACircle'
import AbSlider from './Slider/ABSlider'
import Multi from './Slider/MultiSelectSlider'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import TokenIcon from '@/assets/images/playalong-token.svg'
import { vhToPx, hex2rgb, evalImage } from '@/utils'
import SponsorIntro from './SponsorIntro'
let h = 0
@observer
export default class SponsorQuestion extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    extendObservable(this, {
      timer: this.props.question.length,
      isTimerExpired: false,
      isInsertedWhenTimeIsUp: false,
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

  render() {
    const { question, sponsorLogo, height } = this.props
    const Slider = question.choiceType === 'MULTI' ? Multi : AbSlider

    return (
      <Container color={question.backgroundColor}>
        <IntroWrapper innerRef={ref => (this.IntroWrapper = ref)}>
          <SponsorIntro question={question} sponsorLogo={sponsorLogo} height={height} />
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
                    height={4}
                    marginRight={1}
                  />
                ) : null}
                <QuestionText maxWidth={60}>{question.playTitle}</QuestionText>
              </QuestionSponsorWrapper>
              <PACircleWrapper>
                {this.timer ? (
                  <PACircle value={true}>{this.timer}s</PACircle>
                ) : null}
              </PACircleWrapper>
            </QuestionContainer>
            <SliderWrapper>
              <Slider
                currentPrePick={1}
                teams={this.props.teams}
                question={question}
                groupComponent="LIVEGAME"
                feeCounterValue={2}
                height={height}
              />
            </SliderWrapper>
            <LowerSection>
              <PointsPlayWrapper>
                <PointsPlayBackground backgroundColor={question.ringColor} />
                <PointsPlayValues>
                  <TokenText>{question.tokens || 0}</TokenText>
                  <TokenWrapper>
                    <Token src={TokenIcon} size={2.5} index={3} />
                    <Faded index={2} size={2.5} color={'#6d6c71'} left={-2.2} />
                    <Faded index={1} size={2.5} color={'#33342f'} left={-2.2} />
                  </TokenWrapper>
                  <PointsText>{question.points || 0}</PointsText>
                  <PointsLabel>pts</PointsLabel>
                  <PointsPlayDesc>this play</PointsPlayDesc>
                </PointsPlayValues>
              </PointsPlayWrapper>
            </LowerSection>
          </FadeIn>
        </QuestionWrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  background-color: ${props =>
    props.color ? hex2rgb(props.color, 0.8) : hex2rgb('#c61818', 0.8)};
  border-top: ${props => vhToPx(h * (0.5/100))} solid rgba(255, 255, 255, 0.2);
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

const Sponsor = styled.img`
  height: ${props => vhToPx(h * (props.height/100 || 5/100))};
  margin-right: ${props => vhToPx(h * (props.marginRight/100 || 0))};
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
  font-size: ${props => vhToPx(h * (4/100))};
  text-transform: uppercase;
  color: #ffffff;
  width: auto;
  max-width: ${props => props.maxWidth || 'auto'}%;
  line-height: 1;
`
const PACircleWrapper = styled.div``

const SliderWrapper = styled.div`
  width: inherit;
`

const LowerSection = styled.div`
  width: inherit;
  display: flex;
  justify-content: center;
`

const PointsPlayWrapper = styled.div`
  width: 70%;
  height: ${props => vhToPx(h * (7/100))};
  border-radius: ${props => vhToPx(h * (7/100))};
  position: relative;
  overflow: hidden;
`

const PointsPlayBackground = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  background-color: ${props => props.backgroundColor};
  opacity: 0.3;
`

const PointsPlayValues = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const PointsPlayValues_ = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`
const PointsText = styled.span`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainextrabold;
  color: #ffb600;
  color: ${props => props.color || '#ffffff'};
  font-size: ${props => vhToPx(h * (3.7/100))};
  text-transform: uppercase;
  margin-left: ${props => vhToPx(h * (1/100))};
`
const PointsLabel = styled.span`
  font-family: pamainregular;
  color: #16c5ff;
  font-size: ${props => vhToPx(h * (2.5/100))};
  text-transform: uppercase;
  padding-top: ${props => vhToPx(h * (0.8/100))};
`
const PointsPlayDesc = styled.span`
  //height: 100%;
  //display: flex;
  //justify-content: center;
  //align-items: center;
  font-family: pamainregular;
  color: #ffffff;
  font-size: ${props => vhToPx(h * (3.7/100))};
  text-transform: uppercase;
  margin-left: ${props => vhToPx(h * (2/100))};
  line-height: 0.9;
`

const FadeIn = styled.div`
  ${props =>
    props.fadeOut
      ? `animation: 0.4s ${fadeOutBottom} forwards;`
      : `animation: 0.4s ${fadeInTop} forwards;animation-delay: ${
          props.delay ? 0.4 : 0
        }s;`} padding: 5% 4.5% 5% 4.5%;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: inherit;
  height: inherit;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
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

const HiddenTimer = styled.div`
  position: absolute;
  left: 5%;
  bottom: 5%;
  display: none;
`

const TokenText = styled.span`
  height: 100%;
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(h * (3.7/100))};
  color: #ffb600;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => vhToPx(h * (0.5/100))};
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 1;
`

const TokenWrapper = styled.div`
  height: 100%;
  margin-right: ${props => vhToPx(h * (0.5/100))};
  margin-bottom: ${props => vhToPx(h * (0.4/100))};
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Token = styled.div`
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: contain;
  width: ${props =>
    props.adjustWidth ? vhToPx(h * ((props.size + 0.1)/100)) : vhToPx(h * (props.size/100))};
  height: ${props => vhToPx(h * (props.size/100))};
  z-index: ${props => props.index};
`

const Faded = styled.div`
  width: ${props => vhToPx(h * (props.size/100))};
  height: ${props => vhToPx(h * (props.size/100))};
  border-radius: ${props => vhToPx(h * (props.size/100))};
  background-color: ${props => props.color};
  margin-left: ${props => vhToPx(h * (props.left/100))};
  z-index: ${props => props.index};
`
