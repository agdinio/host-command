import React, { Component } from 'react'
import { inject } from 'mobx-react'
import styled, {keyframes} from 'styled-components'
import { vhToPx, isEqual } from '@/utils'
import dateFormat from 'dateformat'
import TeamIcon from './TeamIcon'
import { TweenMax } from 'gsap'

const gameStatus = {
  active: {bg: '#ffffff', text: 'active', color: '#000000', invertedColor: '#ffffff', prePicksEditable: true,
    slidingButton: {text:'details', color:'#000000', bg:'#E5E5E5'}},
  "public": {bg: '#e6e7e8', text: '', color: '#000000', invertedColor: '#ffffff', prePicksEditable: true,
    slidingButton: {text:'edit prepicks', color:'#ffffff', bg:'#22ba2c'}},
  pregame: {bg: '#22ba2c', text: 'PRE-GAME', color: '#ffffff', invertedColor: '#22ba2c', prePicksEditable: false,
    slidingButton: {text:'access h-comm', color:'#ffffff', bg:'#18c5ff'}},
  pending: {bg: '#efdf17', text: 'PENDING', color: '#000000', invertedColor: '#efdf17', prePicksEditable: false,
    slidingButton: {text:'access h-comm', color:'#ffffff', bg:'#18c5ff'}},
  live: {bg: '#c61818', text: 'LIVE', color: '#ffffff', invertedColor: '#c61818', prePicksEditable: false,
    slidingButton: {text:'join h-comm', color:'#ffffff', bg:'#c61818'}},
  postgame: {bg: '#4d92ad', text: 'POST-GAME', color: '#ffffff', invertedColor: '#ffffff', prePicksEditable: false,
    slidingButton: {text:'access stats', color:'#ffffff', bg:'#808285'}},
  end: {bg: '#3d3d3d', text: 'END', color: '#ffffff', invertedColor: '#ffffff', prePicksEditable: false,
    slidingButton: {text:'access stats', color:'#ffffff', bg:'#808285'}}
}


export default class GameItem extends Component {
  constructor(props) {
    super(props)
    this.animSlidRefToggle = null
    this.uniqueIdentifier = null
    this.check = null

  }

  shouldComponentUpdate(nextProps) {
    if (!isEqual(this.props.item, nextProps.item)) {
      return true
    }

    return false
  }

  render() {

    let {item, handleClick} = this.props
    let {participants} = item

    if (!item || (item && !item.stage) || !participants) {
      return null
    }

    const dateStart = dateFormat(item.dateStart, 'mm/dd/yyyy')
    const timeStart = dateFormat(item.timeStart, 'hh:MMTT')
    const dateTimeStart = dateStart + ' ' + timeStart


    return (
      <Container>
        <Wrapper backgroundColor={gameStatus[item.stage].bg} onClick={handleClick}>
          <TeamsWrapper>
            <TeamIconWrapper>
              <TeamIcon
                teamInfo={participants[0]}
                size={h * 0.3}
                outsideBorderColor={'#ffffff'}
                outsideBorderWidth={0.15}
              />
              <TeamName>{participants[0].name}</TeamName>
            </TeamIconWrapper>
            <TeamIconWrapper>
              <TeamIcon
                teamInfo={participants[1]}
                size={h * 0.3}
                outsideBorderColor={'#ffffff'}
                outsideBorderWidth={0.15}
              />
              <TeamName>{participants[1].name}</TeamName>
            </TeamIconWrapper>
          </TeamsWrapper>
          <InfoWrapper>
            {
              item.stage === 'active' ? (
                <StatusWrapper>
                  <Status
                    font={'pamainbold'}
                    color={gameStatus[item.stage].color}
                    size={(h * 0.45)}
                  >
                    {gameStatus[item.stage].text}
                  </Status>
                  <Venue>{item.city}&nbsp;{item.state},&nbsp;{item.stadium}</Venue>
                </StatusWrapper>
              ) : item.stage === 'public' ? (
                <StatusWrapper>
                  <TimeWrapper>
                    <MonthDay>{dateFormat(item.dateStart, 'mmmm dS, dddd')}&nbsp;</MonthDay>
                    <Time ap color={'#22ba2c'}>{timeStart}</Time>
                  </TimeWrapper>
                  <Venue>{item.city}&nbsp;{item.state},&nbsp;{item.stadium}</Venue>
                </StatusWrapper>
              ) : (
                <StatusWrapper>
                  <TimeWrapper>
                    <Time color={gameStatus[item.stage].color}>{dateTimeStart}</Time>
                  </TimeWrapper>
                  <Status
                    font={'pamainbold'}
                    color={gameStatus[item.stage].color}
                    size={(h * 0.45)}
                  >
                    {gameStatus[item.stage].text}
                  </Status>
                </StatusWrapper>
              )
            }
          </InfoWrapper>
        </Wrapper>
      </Container>
    )

  }

}

const h = 7
const Container = styled.div`
  position: relative;
  width: 100%;
  height: ${props => vhToPx(h)};
  display: flex;
`

const Wrapper = styled.div`
  animation: ${props => fadeIn} 0.4s forwards;
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#3d3d3d'};
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const TeamsWrapper = styled.div`
  width: 30%;
  height: 100%;
  border-top-right-radius: ${props => vhToPx(h/2)};
  border-bottom-right-radius: ${props => vhToPx(h/2)};
  background-color: #d1d3d3;
  display: flex;
  flex-direction: column;
  padding-left: 4%;
`

const TeamIconWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TeamName = styled.div`
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.25)};
  color: #000000;
  text-transform: uppercase;
  line-height: 1;
  margin-left: 10%;
`

const InfoWrapper = styled.div`
  height: 100%;
  display: flex;
  // flex-direction: column;
  // align-items: flex-end;
  // justify-content: center;
  padding-right: ${props => vhToPx(1)};
  
`

const StatusWrapper = styled.div`
  height: inherit;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
`

const TimeWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const MonthDay = styled.div`
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.25)};
  color: #808285;
  text-transform: uppercase;
  line-height: 1;  
  letter-spacing: ${props => vhToPx(0.1)};
`

const Time = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.25)};
  color: ${props => props.color || '#000000'};
  text-transform: uppercase;
  line-height: 1;
  //padding-top: ${props => props.ap ? 0 : '5%'};
  //padding-bottom: ${props => props.ap ? 0 : '5%'};
  letter-spacing: ${props => vhToPx(0.1)};
  height: ${props => vhToPx((h * 0.25) * 0.8)};
  margin-bottom: ${props => props.ap ? 0 : '5%'};
  white-space: nowrap;
`

const Status = styled.div`
  font-family: ${props => props.font};
  font-size: ${props => vhToPx(props.size)};
  color: ${props => props.color || '#000000'};
  text-transform: uppercase;
  line-height: 1;  
  letter-spacing: ${props => vhToPx(0.1)};
`

const Venue = styled.div`
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.25)};
  color: ${props => props.color || '#000000'};
  text-transform: uppercase;
  line-height: 1;  
  letter-spacing: ${props => vhToPx(0.1)};  
  white-space: nowrap;
`

const SlidingPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  padding-left: 3%;
  transform: translateX(-101%);
`

const SlidingStageWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
`

const ButtonWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Button = styled.div`
  width: ${props => vhToPx(props.width)};
  height: ${props => vhToPx(h * 0.65)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: ${props => vhToPx(props.marginLeft || 0)};
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.23)};
    color ${props => props.color};
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
  }
`
