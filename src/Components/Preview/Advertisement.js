import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import { PACircle } from '@/Components/PACircle'
import AbSlider from './Slider/ABSlider'
import Multi from './Slider/MultiSelectSlider'
import AdvertisementIntro from './AdvertisementIntro'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import { vhToPx, hex2rgb, evalImage } from '@/utils'
let h = 0

@observer
export default class AdvertisementQuestion extends Component {
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

  render() {
    const { question, sponsorLogo, height } = this.props
    const Slider = question.choiceType === 'MULTI' ? Multi : AbSlider

    return (
      <Container>
        <AdvContainer
          color={question.backgroundColor}
          innerRef={ref => (this.AdvContainer = ref)}
        >
          <IntroWrapper innerRef={ref => (this.IntroWrapper = ref)}>
            <AdvertisementIntro
              question={question}
              sponsorLogo={sponsorLogo}
              height={height}
            />
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
                      size={sponsorLogo.imageSize}
                      marginRight={1}
                    />
                  ) : null}
                  <QuestionText maxWidth={75}>
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
                  height={height}
                />
              </div>
              <LowerSection>
                <PlayWrapper>
                  <PlayContent>
                    <SponsorLogo
                      src={sponsorLogo ? evalImage(sponsorLogo.imageBig) : null}
                      size={sponsorLogo ? sponsorLogo.imageBigSize : null}
                    />
                    <DescWrapper>
                      <Descs>
                        <PlayPoints points={question.prizePoints}>
                          {question.prizePoints > 0 ? question.prizePoints : ''}
                        </PlayPoints>
                        <MainDesc points={question.prizePoints} />
                      </Descs>
                      <DetailDesc>{question.prizeDetailDesc}</DetailDesc>
                    </DescWrapper>
                  </PlayContent>
                </PlayWrapper>
              </LowerSection>
            </FadeIn>
          </QuestionWrapper>
        </AdvContainer>
      </Container>
    )
  }
}

const LowerSection = styled.div`
  //flex-direction: row;
  //justify-content: space-between;
  justify-content: center;
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
  letter-spacing: ${props => vhToPx(h * (0.8 / 100))};
  font-size: ${props => vhToPx(h * (3.1 / 100))};
`
const TokenFee = styled.span`
  text-transform: uppercase;
  font-size: ${props => vhToPx(h * (5.6 / 100))};
`

const Minimum = styled.span`
  text-transform: lowercase;
  font-size: ${props => vhToPx(h * (3.1 / 100))};
  letter-spacing: ${props => vhToPx(h * (0.5 / 100))};
`

const LowerRight = styled.div`
  width: 45%;
`

const Text = styled.div`
  font-size: ${props => vhToPx(h * (7 / 100))};
  line-height: 1;
`

const Container = styled.div`
  width: inherit;
  height: inherit;
`

const AdvContainer = styled.div`
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  background-color: ${props =>
    props.color ? hex2rgb(props.color, 0.8) : hex2rgb('#c61818', 0.8)};
  border-top: ${props => vhToPx(h * (0.5 / 100))} solid rgba(255, 255, 255, 0.2);

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

const PlayIcon = styled.div`
  color: white;
  background-color: #19d1bf;
  height: ${props => vhToPx(h * (8 / 100))};
  width: ${props => vhToPx(h * (8 / 100))};
  overflow: hidden;
  border-radius: 100%;
  margin-bottom: ${props => vhToPx(h * (2.5 / 100))};
  border: ${props => vhToPx(h * (0.5 / 100))} solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Icon = styled.img`
  width: inherit;
  height: inherit;
  transform: scale(0.8);
`

const Title = styled.div`
  color: white;
  font-family: 'pamainextrabold';
  font-weight: normal;
  text-transform: uppercase;
  text-align: center;
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
  font-size: ${props => vhToPx(h * (4 / 100))};
  text-transform: uppercase;
  color: #ffffff;
  width: auto;
  max-width: ${props => props.maxWidth || 'auto'}%;
  line-height: 1;
`
const PACircleWrapper = styled.div``

const FadeInIntro = styled.div`
  ${props =>
    props.fadeOut
      ? `animation: 0.5s ${fadeOutBottom} forwards`
      : `animation: 0.75s ${fadeInTop} forwards;animation-delay: ${
          props.delay ? 0.5 : 0
        }s`};
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: inherit;
  height: inherit;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
`

const FadeIn = styled.div`
/*
  ${props =>
    props.fadeOut
      ? `animation: 0.4s ${fadeOutBottom} forwards`
      : `animation: 0.4s ${fadeInTop} forwards;animation-delay: ${
          props.delay ? 0.4 : 0
        }s`};
*/
  padding: 5% 4.5% 5% 4.5%;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: inherit;
  height: inherit;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
`

const SponsorWrapper = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SponsorText = styled.span`
  font-family: pamainregular;
  text-transform: uppercase;
  font-size: ${props => vhToPx(h * (1.9 / 100))};
  color: #ffffff;
  line-height: 2;
`

const Sponsor = styled.img`
  height: ${props => vhToPx(h * ((props.size || 6) / 100))};
  margin-right: ${props => vhToPx(h * (props.marginRight / 100 || 0))};
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

const PlayWrapper = styled.div`
  width: 55%;
  height: ${props => vhToPx(h * (10 / 100))};
  border-radius: ${props => vhToPx(h * (10 / 100))};
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
`

const PlayContent = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const PrizeImage = styled.div`
  width: ${props => vhToPx(h * (10 / 100))};
  height: ${props => vhToPx(h * (10 / 100))};
  position: absolute;
  border-radius: ${props => vhToPx(h * (10 / 100))};
  background: #c0c0c0;
  border: ${props => vhToPx(h * (0.3 / 100))} solid #c0c0c0;

  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: center;
`
const SponsorLogo = styled.div`
  width: ${props => vhToPx(h * ((props.size || 13) / 100))};
  height: ${props => vhToPx(h * ((props.size || 13) / 100))};
  //position: absolute;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: center;
  margin-left: ${props => vhToPx(h * (1 / 100))};
  margin-right: ${props => vhToPx(h * (1 / 100))};
`

const DescWrapper = styled.div`
  //width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  //padding-left: 45%;
`

const Descs = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`

const PlayPoints = styled.span`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainextrabold;
  color: #ffb600;
  font-size: ${props => vhToPx(h * (3.7 / 100))};
  text-transform: uppercase;
  padding-right: ${props => (props.points > 0 ? vhToPx(h * (1 / 100)) : 0)};
`

const MainDesc = styled.span`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainlight;
  color: #ffffff;
  font-size: ${props => vhToPx(h * (3.9 / 100))};
  text-transform: uppercase;
  line-height: ${props => vhToPx(h * (3 / 100))};
`

const DetailDesc = styled.div`
  width: 100%;
  display: flex;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * (2.9 / 100))};
  color: #c0c0c0;
  text-transform: uppercase;
`

const HiddenTimer = styled.div`
  position: absolute;
  left: 5%;
  bottom: 5%;
  display: none;
`
