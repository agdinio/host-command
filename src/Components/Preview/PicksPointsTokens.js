import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import PropTypes from 'prop-types'
import styled, { keyframes } from 'styled-components'
import token from '@/assets/images/playalong-token.svg'
import * as util from '@/utils'
import { TweenMax } from 'gsap'

@observer
export default class PicksPointsTokens extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    extendObservable(this, {
      animSpeed: 0.3,
    })
  }

  animFallingCoins() {
    ReactDOM.unmountComponentAtNode(this.CoinsContainer)
    let coins = []
    let density = Math.floor(Math.random() * (6 - 5) + 5)

    for (let i = 0; i < density; i++) {
      let delayThis = Math.floor(Math.random() * (600 - 200) + 200)
      let min = 42,
        max = 52
      let randomPos = Math.floor(Math.random() * (max - min) + min) + 35

      coins.push(
        <Coin
          src={token}
          key={`coin-${i}`}
          left={randomPos}
          delay={delayThis}
        />
      )
    }

    ReactDOM.render(coins, this.CoinsContainer)
  }

  animFallingPoints() {
    ReactDOM.unmountComponentAtNode(this.PointsContainer)
    let point = (
      <Points scale={1.4} top={20}>
        {this.props.question.points}
      </Points>
    )
    ReactDOM.render(point, this.PointsContainer)
  }

  animFallingTokens() {
    ReactDOM.unmountComponentAtNode(this.TokensContainer)
    let tokens = (
      <Tokens scale={1.4} top={20}>
        {this.props.question.tokens}
      </Tokens>
    )
    ReactDOM.render(tokens, this.TokensContainer)
  }


  animStart() {
    setTimeout(() => {
      this.animFallingPoints()
      this.animFallingCoins()
    }, 0.1)

    setTimeout(() => {
      this.animFallingTokens()
    }, 300)
  }

  calculateTotalTokens() {
    TweenMax.to(this.token1, 1, {
      display: 'none',
      onComplete: this.evaluateTotalTokens.bind(this),
    })
  }

  componentDidMount() {}

  render() {
    let { totalPrePicks, currentPrePick } = this.props

    let prepickLeft = 0
    if (currentPrePick) {
      prepickLeft = totalPrePicks - currentPrePick
    }

    return (
      <Container>
        <BottomWrapper>
          <ContentWrapper>
            <PicksLeftWrapper>{prepickLeft}</PicksLeftWrapper>
            <StaticPointsAndTokens
              totalPoints={0}
              totalTokens={0}
            />
          </ContentWrapper>
        </BottomWrapper>
      </Container>
    )
  }
}

export const StaticPointsAndTokens = props => {
  return (
    <TotalWrapper innerRef={props.reference}>
      <TotalPointsWrapper>
        <TotalPointsValue innerRef={props.refTotalPoints}>
          {Math.floor(props.totalPoints)}
        </TotalPointsValue>

        <TotalPointsLabel onClick={props.handleClick} />
      </TotalPointsWrapper>
      <TotalTokenWrapper>
        <TotalTokensValue>{Math.floor(props.totalTokens)}</TotalTokensValue>
        <TotalToken src={token} />
      </TotalTokenWrapper>
    </TotalWrapper>
  )
}

let h = 0

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
const BottomWrapper = styled.div`
  width: 100%;
  height: 100%;
`
const ContentWrapper = styled.div`
  bottom: 0;
  width: 100%;
  padding-bottom: ${props => util.vhToPx(h * 0.015)};
`
const PicksLeftWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-family: pamainextrabold;
  font-size: ${props => util.vhToPx(h * 0.034)};
  color: #2fc12f;
  margin-bottom: ${props => util.vhToPx(h * 0.07)};

  &:after {
    content: 'PICKS LEFT';
    font-family: pamainlight;
    font-size: ${props => util.vhToPx(h * 0.033)};
    padding-left: ${props => util.vhToPx(h * 0.006)};
  }
`
const TotalWrapper = styled.div`
  width: 100%;
`
const TotalPointsWrapper = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  line-height: ${props => util.vhToPx(h * 0.04)};
`
const TotalTokenWrapper = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`
const Token = styled.img`
  position: absolute;
  z-index: 1;
  display: none;
  width: ${props => util.vhToPx(h * 0.04)};
`
const TotalPointsValue = styled.span`
  font-family: pamainextrabold;
  color: #ffffff;
  font-size: ${props => util.vhToPx(h * 0.05)};
  margin-right: ${props => util.vhToPx(h * 0.01)};
  z-index: 1; //put, for History Pending on LiveGame
`
const TotalPointsLabel = styled.span`
  font-family: pamainlight;
  color: #18c5ff;
  font-size: ${props => util.vhToPx(h * 0.031)};
  z-index: 1; //put, for History Pending on LiveGame
  &:before {
    content: 'PTS';
  }
`

const TotalTokensValue = styled.span`
  font-family: pamainextrabold;
  font-size: ${props => util.vhToPx(h * 0.038)};
  color: #ffb600;
  padding-right: ${props => util.vhToPx(h * 0.015)};
  z-index: 1; //put, for History Pending on LiveGame
`
const TotalToken = styled.img`
  width: ${props => util.vhToPx(h * 0.029)};
  z-index: 1; //put, for History Pending on LiveGame
`

const CoinsContainer = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
`
const CoinsContainerEnd = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
`
const Coin = styled.div`
  width: 5%;
  height: 5%;
  position: relative;
  background: url(${props => props.src}) no-repeat center;
  background-size: contain;
  top: 10%;
  left: ${props => props.left}%;
  z-index: 100;
  transform: scale(1), rotate(0deg);
  animation: ${props => coinFall} forwards 0.9s
    cubic-bezier(0.6, -0.28, 0.735, 0.045);
  animation-delay: ${props => props.delay}ms;
  opacity: 0;
  &:nth-of-type(1) {
    transform: rotate(30deg);
    margin-left: 3%;
  }
  &:nth-of-type(2) {
    transform: rotate(-30deg);
    margin-left: -3%;
  }
  &:nth-of-type(3) {
    transform: rotate(-10deg);
    margin-left: 4%;
  }
  &:nth-of-type(4) {
    transform: rotate(-20deg);
    margin-left: 2%;
  }
  &:nth-of-type(5) {
    transform: rotate(30deg);
    margin-left: -2%;
  }
`

const coinFall = keyframes`
  0% {opacity:0;}
  20% {opacity:1;transform:scale(1.2);}
  50%{transform:scale(1.5);opacity: 0.8;}
  70% {
    transform:scale(0.8);
  }
  100% {
    margin-left:0;
    opacity:0;
    top:90%;
    left:85%;
    transform:scale(5),rotate(0deg);
  }
`
const pointFall = keyframes`
  0% {opacity:0;}
  20% {opacity:1;transform:scale(1.4);}
  100%{
    transform:scale(1);
    top:80%;
    opacity: 0;
  }
`
const PointsContainer = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: flex-end;
`
const Points = styled.div`
  color: #fff;
  font-size: ${util.vhToPx(h * 0.057)};
  font-family: pamainbold;
  &:after {
    content: 'PTS';
    color: #18c5ff;
    font-family: pamainlight;
    font-size: ${util.vhToPx(h * 0.053)};
    margin-left: ${util.vhToPx(h * 0.005)};
    display: inline-block;
  }

  position: absolute;
  top: ${props => props.top}%;
  right: ${util.vhToPx(h * 0.03)};
  animation: ${props => pointFall} forwards 0.5s
    cubic-bezier(0.6, -0.28, 0.735, 0.045);
  animation-delay: 0.2s;
`
const TokensContainer = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: flex-end;
`
const Tokens = styled.div`
  color: #fff;
  font-size: ${props => util.vhToPx(h * 0.056)};
  font-family: pamainbold;
  color: #ffb600;
  &:before {
    content: '+';
    font-size: ${props => util.vhToPx(h * 0.05)};
    margin-left: ${props => util.vhToPx(h * 0.05)};
    display: inline-block;
  }
  position: absolute;
  top: ${props => props.top}%;
  right: ${util.vhToPx(h * 0.012)};
  animation: ${props => pointFall} forwards 0.9s
    cubic-bezier(0.6, -0.28, 0.735, 0.045);
`
