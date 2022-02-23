import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'
import { vhToPx, hex2rgb } from '@/utils'
import TeamIcon from './TeamIcon'
import FootballIcon from '@/assets/images/preview/icon-football-black.svg'
import { TweenMax } from 'gsap'

const Thresholds = [
  {
    name: 'sponsor papa',
    initial: 'p',
    baseColor: '#7c4724',
    baseColorInactive: '#bcbec0',
    minutesRequired: 15,
    initialColor: '#383644',
    backgroundColor: '#b2cbce',
    circleBorderColor: '#91a5c1',
    id: 1,
  },
  {
    name: 'sponsor bravo',
    initial: 'b',
    baseColor: '#f2a227',
    baseColorInactive: '#bcbec0',
    minutesRequired: 30,
    initialColor: '#3f2919',
    backgroundColor: '#e2a069',
    circleBorderColor: '#7c4724',
    id: 2,
  },
  {
    name: 'sponsor sierra',
    initial: 's',
    baseColor: '#37c385',
    baseColorInactive: '#bcbec0',
    minutesRequired: 60,
    initialColor: '#4c4c4c',
    backgroundColor: '#bababa',
    circleBorderColor: '#999999',
    id: 3,
  },
  {
    name: 'sponsor golf',
    initial: 'g',
    baseColor: '#2bc6fc',
    baseColorInactive: '#bcbec0',
    minutesRequired: 90,
    initialColor: '#754b00',
    backgroundColor: '#ffde9c',
    circleBorderColor: '#f4a300',
    id: 4,
  },
  {
    name: 'sponsor golf',
    initial: 'g',
    baseColor: '#ff00ff',
    baseColorInactive: '#bcbec0',
    minutesRequired: 120,
    initialColor: '#754b00',
    backgroundColor: '#ffde9c',
    circleBorderColor: '#f4a300',
    id: 5,
  },
  {
    name: 'sponsor golf',
    initial: 'g',
    baseColor: '#000000',
    baseColorInactive: '#000000',
    minutesRequired: 'END',
    initialColor: '#754b00',
    backgroundColor: '#ffde9c',
    circleBorderColor: '#f4a300',
    id: 6,
  },
]

@observer
export default class GameHeader extends Component {
  constructor(props) {
    super(props)

    h = this.props.height;

    this.refSportTypeBarToggle = null
    this.expanded = false
    this.expandedTO = null
    this.timeSpent = 100
  }

  handleExpandClick() {
    if (this.refSportTypeBar) {
      if (!this.expanded) {
        this.expanded = !this.expanded
        this.refSportTypeBarToggle = TweenMax.to(this.refSportTypeBar, 0.3, {
          x: '0%',
        })
        this.expandedTO = setTimeout(() => {
          this.expanded = !this.expanded
          this.refSportTypeBarToggle.reverse()
        }, 5000)
      } else {
        this.expanded = !this.expanded
        clearTimeout(this.expandedTO)
        this.refSportTypeBarToggle.reverse()
      }
    }
  }

  executeGauge() {
    let maxMins = 1
    for (let i = 0; i < Thresholds.length; i++) {
      const t = Thresholds[i]

      if (!isNaN(t.minutesRequired)) {
        if (this.timeSpent >= t.minutesRequired) {
          maxMins = t.minutesRequired > maxMins ? t.minutesRequired : maxMins
        }
      }
    }

    const item = Thresholds.filter(o => o.minutesRequired === maxMins)[0]
    if (item) {
      const elThreshold = this[`threshold-item-${item.id}`]
      if (elThreshold) {
        TweenMax.to(this.refThresholdGauge, 3, {
          width: elThreshold.offsetLeft + elThreshold.offsetWidth,
        })
      }
    }
  }

  componentDidMount() {
  }

  render() {
    let { teams } = this.props

    if (!teams || (teams && teams.length < 1)) {
      return null
    }

    return (
      <Container>
        <SportTypeBar innerRef={ref => (this.refSportTypeBar = ref)}>
          <SportTypeInfo>
            <StadiumNameRow>
              <Text
                font={'pamainextrabold'}
                size={2.3}
                color={'rgba(0,0,0, 0.6)'}
                uppercase
              >
                NFL
              </Text>
              &nbsp;
              <Text
                font={'pamainregular'}
                size={2.3}
                color={'rgba(0,0,0, 0.6)'}
                uppercase
              >
                stadium name
              </Text>
            </StadiumNameRow>
            <StreakTimeRow>
              <Text
                font={'pamainlight'}
                size={2.4}
                color={'rgba(0,0,0, 1)'}
                lineHeight={0.9}
                uppercase
              >
                playalong
              </Text>
              &nbsp;
              <Text
                font={'pamainregular'}
                size={2.4}
                color={'rgba(0,0,0, 1)'}
                lineHeight={0.9}
                letterSpacing={0}
                uppercase
                italic
              >
                streak time
              </Text>
              &nbsp;&nbsp;
              <StreakTime>
                <Text
                  font={'pamainregular'}
                  size={2.6}
                  color={'#ffffff'}
                  uppercase
                >
                  1
                </Text>
                <Text
                  font={'pamainregular'}
                  size={1.8}
                  color={'#ffffff'}
                  uppercase
                >
                  H
                </Text>
                <Text
                  font={'pamainregular'}
                  size={2.8}
                  color={'#ffffff'}
                  uppercase
                >
                  :
                </Text>
                <Text
                  font={'pamainregular'}
                  size={2.6}
                  color={'#ffffff'}
                  uppercase
                >
                  20
                </Text>
                <Text
                  font={'pamainregular'}
                  size={1.8}
                  color={'#ffffff'}
                  uppercase
                >
                  M
                </Text>
              </StreakTime>
            </StreakTimeRow>
            <ThresholdRow>
              <ThresholdGaugeEmpty />
              <ThresholdGaugeFill
                innerRef={ref => (this.refThresholdGauge = ref)}
              />

              <ThresholdFirstLayer>
                <ThresholdSecondLayer>
                  {Thresholds.map((item, idx) => {
                    return (
                      <ThresholdItemsWrapper key={idx}>
                        <ThresholdItem
                          innerRef={ref =>
                            (this[`threshold-item-${item.id}`] = ref)
                          }
                          baseColor={
                            !isNaN(item.minutesRequired) &&
                            this.timeSpent >= item.minutesRequired
                              ? item.baseColor
                              : item.baseColorInactive
                          }
                        >
                          <MinutesText
                            baseColor={
                              !isNaN(item.minutesRequired) &&
                              this.timeSpent >= item.minutesRequired
                                ? item.baseColor
                                : item.baseColorInactive
                            }
                            fontSize={
                              (!isNaN(item.minutesRequired) &&
                              item.minutesRequired.toString().length <= 2
                                ? 0.8
                                : !isNaN(item.minutesRequired) &&
                                  item.minutesRequired.toString().length === 3
                                  ? 0.5
                                  : isNaN(item.minutesRequired)
                                    ? 0.6
                                    : 0.7) * gaugeHeight
                            }
                          >
                            {item.minutesRequired}
                          </MinutesText>
                          <MinutesText
                            baseColor={
                              !isNaN(item.minutesRequired)
                                ? 'rgba(0,0,0, 0.6)'
                                : '#ffffff'
                            }
                            fontSize={
                              (!isNaN(item.minutesRequired) &&
                              item.minutesRequired.toString().length <= 2
                                ? 0.8
                                : !isNaN(item.minutesRequired) &&
                                  item.minutesRequired.toString().length === 3
                                  ? 0.5
                                  : isNaN(item.minutesRequired)
                                    ? 0.6
                                    : 0.7) * gaugeHeight
                            }
                          >
                            {item.minutesRequired}
                          </MinutesText>
                        </ThresholdItem>
                      </ThresholdItemsWrapper>
                    )
                  })}
                </ThresholdSecondLayer>
              </ThresholdFirstLayer>
            </ThresholdRow>
          </SportTypeInfo>
          <SportTypeIconWrapper onClick={this.handleExpandClick.bind(this)}>
            <CircleIcon />
          </SportTypeIconWrapper>
        </SportTypeBar>

        <Panels>
          <LeftPanel>
            <TeamAndPointWrapper>
              <TeamColor
                backgroundColor={teams[0].iconBottomColor}
              >
                <MutedColor>
                  <TeamContent>
                    <BlankCell />
                    <TeamName>{teams[0].teamName}</TeamName>
                    <TeamSymbolWrapper>
                      <TeamIcon
                        teamInfo={teams[0]}
                        size={h * 0.037}
                        abbrSize={h * 0.025}
                      />
                    </TeamSymbolWrapper>
                  </TeamContent>
                </MutedColor>
              </TeamColor>
              <TeamScore>0</TeamScore>
            </TeamAndPointWrapper>

            <TeamAndPointWrapper>
              <TeamColor
                backgroundColor={teams[1].iconBottomColor}
              >
                <MutedColor>
                  <TeamContent>
                    <BlankCell />
                    <TeamName>{teams[1].teamName}</TeamName>
                    <TeamSymbolWrapper>
                      <TeamIcon
                        teamInfo={teams[1]}
                        size={h * 0.037}
                        abbrSize={h * 0.025}
                      />
                    </TeamSymbolWrapper>
                  </TeamContent>
                </MutedColor>
              </TeamColor>
              <TeamScore>0</TeamScore>
            </TeamAndPointWrapper>
          </LeftPanel>

          <RightPanel>
            <PlayAlongStatesWrapper>
              <Row>
                <Text
                  font={'pamainbold'}
                  size={3}
                  color={'#c61818'}
                  letterSpacing={0.4}
                  uppercase
                >
                  live
                </Text>
                &nbsp;
                <Dot size={1.4} backgroundColor={'#c61818'} />
              </Row>
            </PlayAlongStatesWrapper>
            <SportStatesWrapper>
              <Row>
                <QuarterNum size={3.4} backgroundColor={'#ffffff'}>
                  1
                </QuarterNum>
                &nbsp;
                <Text
                  font={'pamainlight'}
                  size={4.7}
                  color={'#ffffff'}
                  letterSpacing={0.2}
                  uppercase
                >
                  qtr
                </Text>
              </Row>
            </SportStatesWrapper>
          </RightPanel>
        </Panels>
      </Container>
    )
  }
}

let h = 0
const pct = 0

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Panels = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const LeftPanel = styled.div`
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const RightPanel = styled.div`
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const TeamAndPointWrapper = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 0.045)};
  border-top-right-radius: ${props => vhToPx(h * 0.045)};
  border-bottom-right-radius: ${props => vhToPx(h * 0.045)};
  background-color: #cfd2d0;
  display: flex;
  justify-content: space-between;
`

const TeamColor = styled.div`
  width: 80%;
  height: ${props => vhToPx(h * 0.045)};
  background-color: ${props => props.backgroundColor};
  border-top-right-radius: ${props => vhToPx(h * 0.045)};
  border-bottom-right-radius: ${props => vhToPx(h * 0.045)};
  overflow: hidden;
`

const MutedColor = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  //justify-content: flex-end;
`

const TeamContent = styled.div`
  //width: 70%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
`

const TeamName = styled.div`
  width: 100%;
  height: 100%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.03)};
  line-height: 1;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.01)};
  display: flex;
  align-items: center;
  justify-content: center;
`

const TeamSymbolWrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 1.5%;
`

const TeamScore = styled.div`
  width: 20%;
  height: ${props => vhToPx(h * 0.045)};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainlight;
  font-size: ${props => vhToPx(h * 0.04)};
  line-height: 1;
  padding-top: 1%;
`

const SportTypeBar = styled.div`
  position: absolute;
  width: 80%;
  height: ${props => vhToPx(h * 0.09)};
  border-top-right-radius: ${props => vhToPx(h * 0.09)};
  border-bottom-right-radius: ${props => vhToPx(h * 0.09)};
  background-color: #afafaf;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  transform: translateX(-82%);
`

const SportTypeInfo = styled.div`
  width: 82%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const SportTypeIconWrapper = styled.div`
  width: 18%;
  height: ${props => vhToPx(h * 0.09)};
  min-width: 18%;
  min-height: ${props => vhToPx(h * 0.09)};
  //border: ${props => vhToPx(0.8)} solid transparent;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SportTypeIcon = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #ffffff;
  &:after {
    content: '';
    width: 100%;
    height: 100%;
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 60%;
    background-position: center;
  }
`

const BlankCell = styled.div`
  width: 50%;
  height: 100%;
`

const PlayAlongStatesWrapper = styled.div`
  width: 100%;
  height: 40%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 3%;
  padding-right: 8%;
`

const SportStatesWrapper = styled.div`
  width: 100%;
  height: 60%;
  display: flex;
  justify-content: flex-end;
  padding-right: 6%;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const Text = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx( h * (props.size/100))};
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => vhToPx((h * (props.letterSpacing/100)) || (h * 0.001))};
`

const Dot = styled.div`
  width: 100%;
  height: 100%;
  &:after {
    content: '';
    display: inline-block;
    width: ${props => vhToPx(h * (props.size/100))};
    height: ${props => vhToPx(h * (props.size/100))};
    border-radius: 50%;
    background-color: ${props => props.backgroundColor};
  }
`

const QuarterNum = styled.div`
  width: ${props => vhToPx(h * (props.size/100))};
  height: ${props => vhToPx(h * (props.size/100))};
  border-radius: 50%;
  background-color: ${props => props.backgroundColor};
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(h * 0.03)};
  color: #000000;
  padding-top: 3%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2%;
`

const StadiumNameRow = styled.div`
  width: 100%;
  height: 30%;
  display: flex;
  align-items: center;
  padding-left: 10%;
  padding-top: 1%;
`

const StreakTimeRow = styled.div`
  width: 100%;
  height: 30%;
  display: flex;
  align-items: center;
  padding-left: 10%;
  overflow: hidden;
`

const StreakTime = styled.div`
  padding-bottom: 0.5%;
`

const ThresholdRow = styled.div`
  position: relative;
  width: 70%;
  height: 40%;
`

const gaugeHeight = 3
const ThresholdGaugeEmpty = styled.div`
  position: absolute;
  width: 100%;
  height: ${props => vhToPx(h * (gaugeHeight/100))};
  background: #d1d3d4;
  border-top-right-radius: ${props => vhToPx(h * (gaugeHeight/100))};
  border-bottom-right-radius: ${props => vhToPx(h * (gaugeHeight/100))};
`

const ThresholdGaugeFill = styled.div`
  position: absolute;
  height: ${props => vhToPx(h * (gaugeHeight/100))};
  border-top-right-radius: ${props => vhToPx(h * (gaugeHeight/100))};
  border-bottom-right-radius: ${props => vhToPx(h * (gaugeHeight/100))};
  background-color: #ffffff;
`

const ThresholdFirstLayer = styled.div`
  position: absolute;
  width: 100%;
  border-top-right-radius: ${props => vhToPx(h * (gaugeHeight/100))};
  border-bottom-right-radius: ${props => vhToPx(h * (gaugeHeight/100))};
  padding-left: 4%;
`

const ThresholdSecondLayer = styled.div`
  display: flex;
  justify-content: space-between;
`

const ThresholdItemsWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
`

const ThresholdItem = styled.div`
  position: relative;
  width: ${props => vhToPx(h * (gaugeHeight/100))};
  height: ${props => vhToPx(h * (gaugeHeight/100))};
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => `${vhToPx(h * 0.003)} solid ${props.baseColor}`};
    background-color: ${props => hex2rgb(props.baseColor, 0.5)};
  }
`

const MinutesText = styled.div`
  position: absolute;
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(h * (props.fontSize/100))};
  text-transform: uppercase;
  color: ${props => props.baseColor};
  top: 51%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const CircleIcon = styled.div`
  width: ${props => vhToPx(h * 0.08)};
  height: ${props => vhToPx(h * 0.08)};
  border-radius: 60%;
  background-color: #ffffff;
  background-image: url(${FootballIcon});
  background-repeat: no-repeat;
  background-position: center;
  background-size: 60%;
`
