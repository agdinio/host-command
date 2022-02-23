import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax, TimelineMax } from 'gsap'
import TeamIcon from '@/Components/Common/TeamIcon'
import LockIcon from '@/assets/images/icon-lock-gray.svg'
import XIcon from '@/assets/images/icon-x.svg'
import { vhToPx } from '@/utils'

@inject('CommandHostStore', 'GameStore')
export default class PrePickItem extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    this.selectedChoice = null
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  handleResolve() {
    if (this.selectedChoice && Object.keys(this.selectedChoice).length > 0) {
      this.props.GameStore.resolvePrePick(this.selectedChoice)

      this.props.item.correctChoice = JSON.parse(
        JSON.parse(
          JSON.stringify(this.selectedChoice.correctChoice.replace(/'/g, '"'))
        )
      )
      if (this.refResolveButton) {
        this.refResolveButton.style.opacity = 1
        this.refResolveButton.style.pointerEvents = 'none'
      }
      this.forceUpdate()
    }
  }

  handleSelectAnswer(prePickId, choices, idx) {
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i]
      const el = this[`prepick-choice-${prePickId}-${choice.id}-${i}`]
      if (el) {
        if (i === idx) {
          el.style.backgroundColor = '#0fbc1c'
          const correctChoice = JSON.stringify({
            id: choice.id,
            value: choice.teamName || choice.value,
          }).replace(/"/g, "'")
          this.selectedChoice = {
            gameId: this.props.item.gameId,
            prePickId: prePickId,
            correctChoice: correctChoice,
          }
        } else {
          el.style.backgroundColor = '#808285'
        }
      }
    }

    if (
      this.refResolveButton &&
      this.selectedChoice && Object.keys(this.selectedChoice).length > 0
    ) {
      this.refResolveButton.style.opacity = 1
      this.refResolveButton.style.pointerEvents = 'auto'
    }
  }

  componentWillUnmount() {
    this.selectedChoice = null
  }

  componentDidMount() {
    const isResolved =
      this.props.item.correctChoice &&
      Object.keys(this.props.item.correctChoice).length > 0

    if (isResolved) {
      if (this.refResolveButton) {
        this.refResolveButton.style.opacity = 1
        this.refResolveButton.style.pointerEvents = 'none'
      }
    } else {
      if (!this.selectedChoice || Object.keys(this.selectedChoice).length < 1) {
        this.refResolveButton.style.opacity = 0.2
        this.refResolveButton.style.pointerEvents = 'none'
      }
    }
  }

  render() {
    let { item } = this.props

    const onParticipant =
      item.forParticipant && Object.keys(item.forParticipant).length > 0

    const isResolved =
      item.correctChoice && Object.keys(item.correctChoice).length > 0

    let correctChoiceValue = null
    if (isResolved) {
      const correctChoice = item.choices.filter(
        o => o.id === item.correctChoice.id
      )[0]
      if (correctChoice) {
        if (item.choiceType === 'ab') {
          correctChoiceValue = (
            <CorrectChoiceAB>
              <ChoiceItemTeamName>{correctChoice.teamName}</ChoiceItemTeamName>
              <TeamIcon
                teamInfo={correctChoice}
                size={3.5}
                outsideBorderColor={'#000000'}
                outsideBorderWidth={0.15}
                font={'pamainextrabold'}
              />
            </CorrectChoiceAB>
          )
        } else {
          correctChoiceValue = (
            <Text font={'pamainbold'} color={'#ffffff'} size={FONT_SIZE}>
              {correctChoice.value}
            </Text>
          )
        }
      }
    }

    return (
      <Container>
        <Sequence>{item.sequence}</Sequence>
        <Question
          color={isResolved ? '#ffffff' : '#000000'}
          backgroundColor={isResolved ? '#18c5ff' : '#ffffff'}
        >
          {item.question.substring(0, 54) +
            (item.question.length > 54 ? '...' : '')}
        </Question>

        <Choices>
          {isResolved ? (
            <ChoicesWrap backgroundColor={'#18c5ff'}>
              {correctChoiceValue}
            </ChoicesWrap>
          ) : (
            <ChoicesWrap backgroundColor={'#ffffff'}>
              {item.choiceType === 'ab'
                ? (item.choices || []).map((team, idx) => {
                    const isMargined =
                      idx < item.choices.length - 1 ? true : false
                    return (
                      <ChoiceItemAB
                        key={`${team.id}-${team.teamName}-${team.initial}-${team.iconTopColor}-${team.iconBottomColor}`}
                        margined={isMargined}
                        innerRef={ref =>
                          (this[
                            `prepick-choice-${item.prePickId}-${team.id}-${idx}`
                          ] = ref)
                        }
                        onClick={this.handleSelectAnswer.bind(
                          this,
                          item.prePickId,
                          item.choices,
                          idx
                        )}
                      >
                        <ChoiceItemTeamName>{team.teamName}</ChoiceItemTeamName>
                        <TeamIcon
                          teamInfo={team}
                          size={3.5}
                          outsideBorderColor={'#000000'}
                          outsideBorderWidth={0.15}
                          font={'pamainextrabold'}
                        />
                      </ChoiceItemAB>
                    )
                  })
                : (item.choices || []).map((choice, idx) => {
                    const isMargined =
                      idx < item.choices.length - 1 ? true : false
                    return (
                      <ChoiceItemMulti
                        type="text"
                        key={`${choice.id}-${choice.value}`}
                        margined={isMargined}
                        innerRef={ref =>
                          (this[
                            `prepick-choice-${item.prePickId}-${choice.id}-${idx}`
                          ] = ref)
                        }
                        onClick={this.handleSelectAnswer.bind(
                          this,
                          item.prePickId,
                          item.choices,
                          idx
                        )}
                      >
                        {choice.value || ''}
                      </ChoiceItemMulti>
                    )
                  })}
            </ChoicesWrap>
          )}
        </Choices>

        <ForParticipant
          backgroundColor={
            isResolved ? '#18c5ff' : onParticipant ? '#ffffff' : '#d3d3d3'
          }
        >
          {onParticipant ? (
            <TeamIcon
              teamInfo={item.forParticipant}
              size={2.5}
              outsideBorderColor={'#000000'}
            />
          ) : (
            <Locked src={LockIcon} />
          )}
        </ForParticipant>

        <Resolve
          innerRef={ref => (this.refResolveButton = ref)}
          onClick={this.handleResolve.bind(this)}
        >
          {isResolved ? 'RESOLVED' : 'RESOLVE'}
        </Resolve>

        <Cancel />
      </Container>
    )
  }
}

const h = 5
let FONT_SIZE = '1.8vh'

const Container = styled.div`
  width: 70%;
  height: ${props => h}vh;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
  margin-bottom: ${props => 0.2}vh;
  display: flex;
  flex-direction: row;
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const Sequence = styled.div`
  width: 4%;
  height: 100%;
  background-color: #0fbc1c;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #ffffff;
`

const Question = styled.div`
  width: 40%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: ${props => props.color};
  text-transform: uppercase;
  white-space: nowrap;
  padding-left: ${props => 2}vh;
`

const Choices = styled.div`
  width: 31%;
  height: 100%;
  background-color: #ffffff;
`

const ChoicesWrap = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #000000;
  text-transform: uppercase;
`

const ChoiceItemAB = styled.div`
  width: 100%;
  height: 100%;
  background-color: #808285;
  ${props => (props.margined ? `margin-right:${0.1}vh;` : ``)};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  cursor: pointer;
`

const ChoiceItemTeamName = styled.div`
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #ffffff;
  text-transform: uppercase;
  line-height: 1;
  height: ${props => h * 0.4 * 0.8}vh;
  margin-right: 5%;
`

const ChoiceItemMulti = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #ffffff;
  width: 100%;
  height: 100%;
  text-transform: uppercase;
  background-color: #808285;
  ${props => (props.margined ? `margin-right:${0.2}vh;` : ``)};
  cursor: pointer;
`

const ForParticipant = styled.div`
  width: 5%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
`

const Locked = styled.img`
  height: 50%;
`

const Resolve = styled.div`
  width: 16%;
  height: 100%;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0.2;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #ffffff;
/*
  &:before {
    content: '${props => (props.resolved ? `RESOLVED` : `RESOLVE`)}';
    font-family: pamainbold;
    font-size: ${props => FONT_SIZE};
    color: #ffffff;
  }
*/
`

const Cancel = styled.div`
  width: 4%;
  height: 100%;
  background-color: #bfbfbf;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    background-image: url(${XIcon});
    background-repeat: no-repeat;
    background-size: 50%;
    background-position: center;
  }
`

const Text = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => props.size || 3}vh;
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  ${props =>
    props.letterSpacing ? `letter-spacing:${props.letterSpacing}vh` : ''};
`

const CorrectChoiceAB = styled.div`
  width: 100%;
  height: 100%;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
`
