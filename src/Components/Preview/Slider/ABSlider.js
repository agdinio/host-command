import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import PropTypes from 'prop-types'
import { TweenMax, Ease } from 'gsap'
import BezierEasing from '@/bezier-easing'
import TeamIcon from './TeamIcon'
import ChoiceIndicatorRing from './ChoiceIndicatorRing'
import * as util from '@/utils'

@observer
export default class ABSlider extends Component {
  constructor(props) {
    super(props)

    h = this.props.height

    extendObservable(this, {
      circleSpeed: 0.2,
      questionId: 0,
      direction: -1,
      slideX: 0,
      slideXChoiceIndicatorRing: 0,
      teamNameScaleLeft: 0,
      teamNameScaleRight: 0,
      teamNameColorLeft: '',
      teamNameColorRight: '',
      selectedTeamTemp: '',
      selectedTeamId: 0,
      selectedTeam: '',
      changeToLock: false,
      changeToBlank: false,
    })
  }

  reset() {
    this.circleSpeed = 0.2
    this.questionId = 0
    this.direction = -1
    this.slideXChoiceIndicatorRing = 0
    this.teamNameScaleLeft = 0
    this.teamNameScaleRight = 0
    this.teamNameColorLeft = ''
    this.teamNameColorRight = ''
    this.selectedTeamTemp = ''
    this.selectedTeamId = 0
    this.selectedTeam = ''
    this.changeToLock = false
    this.changeToBlank = false
  }

  componentWillUnmount() {
    this.reset()
    clearTimeout(this.to)
  }

  render() {
    let { currentPrePick, teams, groupComponent, question } = this.props

    return (
      <Container>
        <Wrapper>
          <BlankSlider innerRef={c => (this.sliderContainer = c)}>
            <SliderChoice innerRef={c => (this.sliderChoice = c)} />
          </BlankSlider>

          <TeamWrapper>
            <TeamLeft>
              <TeamName
                flexStart={'flex-end'}
                paddingRight={27}
                innerRef={c => (this.teamNameLeft = c)}
              >
                {teams && teams.length > 0 ? teams[0].name : ''}
              </TeamName>
              <TeamIconWrapper style={{ left: 0 }}>
                <TeamIcon
                  key={`left-${currentPrePick}`}
                  team={teams && teams.length > 0 ? teams[0] : null}
                  selectedTeam={this.selectedTeam}
                  changeToBlank={this.changeToBlank}
                  changeToLock={this.changeToLock}
                  height={this.props.height}
                />
              </TeamIconWrapper>
            </TeamLeft>
            <TeamRight>
              <TeamName
                flexEnd={'flex-start'}
                paddingLeft={27}
                innerRef={c => (this.teamNameRight = c)}
              >
                {teams && teams.length > 1 ? teams[1].name : ''}
              </TeamName>
              <TeamIconWrapper style={{ right: 0 }}>
                <TeamIcon
                  key={`right-${currentPrePick}`}
                  team={teams && teams.length > 1 ? teams[1] : null}
                  selectedTeam={this.selectedTeam}
                  changeToBlank={this.changeToBlank}
                  changeToLock={this.changeToLock}
                  height={this.props.height}
                />
              </TeamIconWrapper>
            </TeamRight>
          </TeamWrapper>

          <ChoiceIndicatorRingWrapper
            innerRef={c => (this.refChoiceIndicatorRing = c)}
          >
            <ChoiceIndicatorRing
              teams={teams && teams.length > 1 ? teams : []}
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
  display: flex;
  align-items: center;
  justify-content: center;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${props => util.vhToPx(h * 0.076)};
  background-color: #f0f2f2;
  position: relative;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  overflow: visible;
  justify-content: center;
  align-items: center;
  display: flex;
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

const SliderChoice = styled.div`
  position: absolute;
  background-color: #fff200;
  width: 60%;
  height: inherit;
  border-radius: ${props => util.vhToPx(h * 0.076)};
  opacity: 0;
`

const TeamWrapper = styled.div`
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
  div {
    flex-basis: 100%;
  }
`

const TeamLeft = styled.div`
  position: relative;
  text-transform: uppercase;
`

const TeamRight = styled.div`
  position: relative;
  text-transform: uppercase;
  margin-right: 0.05vh;
`

const TeamName = styled.div`
  position: absolute;
  font-family: pamainbold;
  font-size: ${props => util.vhToPx(h * 0.026)};
  color: #333333;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  ${props => `justify-content: ${props.flexStart}` || ''};
  ${props => `justify-content: ${props.flexEnd}` || ''};
  ${props => `padding-left: ${props.paddingLeft}%` || ''};
  ${props => `padding-right: ${props.paddingRight}%` || ''};
`

const TeamIconWrapper = styled.div`
  width: ${props => util.vhToPx(h * 0.076)};
  height: 100%;
  border-radius: ${props => util.vhToPx(h * 0.076)};
  position: absolute;
  background-color: #ffffff;
  align-items: center;
  justify-content: center;
  display: flex;
  border: ${props => util.vhToPx(h * 0.001)} solid #cccccc;
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

const LockingContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  background-color: transparent;
`

// ABSlider.propTypes = {
//   question: PropTypes.object.isRequired,
//   handlePicksPointsTokenNotification: PropTypes.func,
//   handleUpdateBackground: PropTypes.func,
//   onComplete: PropTypes.func,
// }
