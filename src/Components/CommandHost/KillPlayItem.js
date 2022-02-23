import React, { Component } from 'react'
import styled from 'styled-components'
import DDReason from '@/Components/CommandHost/Common/DDReason'
import ArrowStartKillIcon from '@/assets/images/host-command-icon-arrow-start-kill.svg'
import { vhToPx } from '@/utils'

export default class KillPlayItem extends Component {
  render() {
    return (
      <Container>
        <Wrapper>
          <CancelButton />
          <ReasonWrapper>
            <DDReason height={h} />
          </ReasonWrapper>
          <MessageInput type="text" placeholder="kill message" />
          <PointsInput type="text" placeholder="points" />
          <StartKillButton />
        </Wrapper>
      </Container>
    )
  }
}

const h = 5
const FONT_SIZE = '1.8vh'

const Container = styled.div`
  width: 100%;
  height: auto;
`

const Wrapper = styled.div`
  width: inherit;
  height: ${props => h}vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  letter-spacing: ${props => 0.1}vh;
`

const CancelButton = styled.div`
  width: ${props => 15.6}vh;
  height: inherit;
  background-color: #231f20;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'CANCEL';
    color: #808285;
  }
`

const ReasonWrapper = styled.div`
  width: ${props => 15}vh;
  height: inherit;
`

const MessageInput = styled.input`
  width: ${props => 50}vh;
  height: inherit;
  border: none;
  outline: none;
  text-transform: uppercase;
  text-indent: ${props => 1}vh;
  color: #000000;
`

const PointsInput = styled.input`
  width: ${props => 15}vh;
  height: inherit;
  border: none;
  outline: none;
  text-transform: uppercase;
  text-align: center;
  background-color: #e5e5e5;
  color: #000000;
`

const StartKillButton = styled.div`
  width: ${props => 109}vh;
  height: inherit;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: 'START KILL';
    margin-right: ${props => 2}vh;
    color: #000000;
    width: 100%;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  &:after {
    width: 100%;
    height: inherit;
    content: '';
    background-image: url(${ArrowStartKillIcon});
    background-repeat: no-repeat;
    background-size: 4%;
    background-position: left;
  }
`
