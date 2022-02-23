import React, { PureComponent } from 'react'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import * as util from '@/utils'
import _ from 'lodash'

const StarColor = '#eede16'

export default class ChoiceIndicatorRing extends PureComponent {
  constructor(props) {
    super(props);
    h = this.props.height
  }

  render() {
    let { teams, question, groupComponent, isShowStar } = this.props
    let team = null

    if (question && teams && 'LIVEPLAY' === question.type.toUpperCase()) {
      const tmp_team = teams.filter(o => question.forTeam && o.id === question.forTeam.id)[0]
      if (tmp_team) {
        team = JSON.parse(JSON.stringify(tmp_team))
        delete Object.assign(team, {['name']: team['teamName']})['teamName']
        delete Object.assign(team, {['topColor']: team['iconTopColor']})['iconTopColor']
        delete Object.assign(team, {['bottomColor']: team['iconBottomColor']})['iconBottomColor']
      }
    }

    return (
      <Thumb>
        <CircleWrapper>

{/*
          {team ? (
            <TeamCircle team={team} showStar={isShowStar} />
          ) : (
            <BlankCircle
              backgroundColor={question && question.ringColor || null}
              showStar={isShowStar}
            >
              {'PREPICK' === groupComponent.toUpperCase() ? (
                ''
              ) : (
                <ImageCircleWrapper backgroundColor={question.backgroundColor}>
                  <ImageCircle src={util.evalImage(question.ringImage)} />
                </ImageCircleWrapper>
              )}
            </BlankCircle>
          )}
*/}

          {
            question && question.isPresetTeamChoice ? (
              <BlankCircle
                backgroundColor={question.ringColor}
                showStar={isShowStar}
              >
                {'PREPICK' === groupComponent.toUpperCase() ? (
                  ''
                ) : (
                  <ImageCircleWrapper backgroundColor={question.backgroundColor}>
                    <ImageCircle src={util.evalImage(question.ringImage)} />
                  </ImageCircleWrapper>
                )}
              </BlankCircle>
            ) : team ? (
              <TeamCircle team={team} showStar={isShowStar} />
            ) : (
              <BlankCircle
                backgroundColor={question && question.ringColor ? question.ringColor : null}
                showStar={isShowStar}
              >
                {'PREPICK' === groupComponent.toUpperCase() ? (
                  ''
                ) : (
                  <ImageCircleWrapper backgroundColor={question && question.backgroundColor ? question.backgroundColor : null}>
                    <ImageCircle src={util.evalImage(question.ringImage)} />
                  </ImageCircleWrapper>
                )}
              </BlankCircle>
            )
          }
        </CircleWrapper>
        <RingWrapper
          showStar={isShowStar}
          backgroundColor={isShowStar ? StarColor : (question && question.ringColor ? question.ringColor : null) }
        >
          <Ring backgroundColor={isShowStar ? StarColor : (question && question.ringColor ? question.ringColor : null) } />
        </RingWrapper>
      </Thumb>
    )
  }
}

const TeamCircle = props => {
  return (
    <TContainer showStar={props.showStar}>
      <TWrapper>
        <TTop color={props.team && props.team.topColor ? props.team.topColor : '#000000'} />
        <TBottom color={props.team && props.team.bottomColor ? props.team.bottomColor : '#414042'} />
      </TWrapper>
      <TAbbrevWrapper>
        <TAbbrev>
          {props.team && props.team.name
            ? props.team.initial.toUpperCase()
            : null}
        </TAbbrev>
      </TAbbrevWrapper>
    </TContainer>
  )
}

let h = 0

const TContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  position: absolute;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border: ${props => util.vhToPx(h * 0.004)} solid
    ${props => (props.showStar ? StarColor : '#000000')};
  background-color: #000000;
  overflow: hidden;
`
const TWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: absolute;
  overflow: hidden;
`
const TTop = styled.div`
  width: 100%;
  height: 100%;
  border-top-left-radius: ${props => util.vhToPx(h * 0.054)};
  border-top-right-radius: ${props => util.vhToPx(h * 0.054)};
  background-color: ${props => props.color};
`

const TBottom = styled.div`
  width: 100%;
  height: 100%;
  border-bottom-left-radius: ${props => util.vhToPx(h * 0.054)};
  border-bottom-right-radius: ${props => util.vhToPx(h * 0.054)};
  background-color: ${props => props.color};
`

const TAbbrevWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`
const TAbbrev = styled.div`
  font-family: pamainbold;
  font-size: ${props => util.vhToPx(h * 0.037)};
  color: #ffffff;
`

const Thumb = styled.div`
  width: ${props => util.vhToPx(h * 0.1)};
  height: ${props => util.vhToPx(h * 0.1)};
  border-radius: ${props => util.vhToPx(h * 0.1)};
  z-index: 1;
  position: relative;
  overflow: hidden;
`
const BlankCircle = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background-color: ${props =>
    props.showStar ? StarColor : props.backgroundColor || '#2fc12f'}
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`
const RingWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  overflow: hidden;

  &:before {
    content: '';
    display: block;
    left: 2.5%;
    width: 95%;
    height: ${props => util.vhToPx(h * 0.031)};
    position: absolute;
    opacity: 0.5;
    bottom: ${props => (props.showStar ? 31 : 30)}%;
    background-color: ${props => props.backgroundColor || '#2fc12f'};
    transform: perspective(${props => util.vhToPx(h * 0.5)}) rotateX(-75deg);
  }

  &:after {
    content: '';
    display: block;
    width: 100%;
    height: 50%;
    position: absolute;
    opacity: 0.3;
    bottom: 0;
    background-color: ${props => props.backgroundColor || '#2fc12f'};
    z-index: 0;
  }

  position: absolute;
`
const Ring = styled.div`
  width: 100%;
  height: 50%;
  position: absolute;
  border-radius: 0 0 100% 100%;
  top: 50%;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;

  &:before {
    content: '';
    width: ${props => util.vhToPx(h * 0.03)};
    height: ${props => util.vhToPx(h * 0.03)};
    border: ${props => util.vhToPx(h * 0.003)} solid;
    border-color: ${props => props.backgroundColor || '#2fc12f'};
    position: absolute;
    border-radius: 100%;
    transform-origin: center;
    display: block;
    transform: scale(1);
    /*
    left: 34.5%;
    top: -30%;
*/
    left: 35%;
    top: -30%;
    animation: ${props => ringpulse} 1s infinite 1s linear;
  }
  &:after {
    content: '';
    width: ${props => util.vhToPx(h * 0.03)};
    height: ${props => util.vhToPx(h * 0.03)};
    border: ${props => util.vhToPx(h * 0.003)} solid;
    border-color: ${props => props.backgroundColor || '#2fc12f'};
    position: absolute;
    border-radius: 100%;
    transform-origin: center;
    display: block;
    transform: scale(1);
    /*
    left: 34.5%;
    top: -30%;
*/
    left: 35%;
    top: -30%;
    animation: ${props => ringpulse} 2s infinite linear;
  }
`
const ringpulse = keyframes`
  0% {}100% {transform:scale(4);}
`
const CircleWrapper = styled.div`
  width: ${props => util.vhToPx(h * 0.05)};
  height: ${props => util.vhToPx(h * 0.05)};
  border-radius: ${props => util.vhToPx(h * 0.05)};
  position: absolute;
  top: 25%;
  left: 25%;
  z-index: 1;
`
const ImageCircleWrapper = styled.div`
  width: 85%;
  height: 85%;
  border-radius: 85%;
  background-color: ${props => props.backgroundColor || '#2fc12f'};
`
const ImageCircle = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 85%;
  background-position: center;
`
