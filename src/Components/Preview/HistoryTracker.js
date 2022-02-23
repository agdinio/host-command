import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept, observe, action, runInAction } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TimelineMax, TweenMax, Back, Quad } from 'gsap'
import PrePick from '@/assets/images/preview/symbol-prepick.svg'
import { vhToPx } from "@/utils";

const Icons = {
  PrePick,
}

const IconsColor = {
  Empty: '#c1c1c1',
  PrePick: '#2fc12f',
  GameMaster: '#19d1bf',
  LivePlay: '#c61818',
  Sponsor: '#495bdb',
  Prize: '#9368AA',
  ExtraPoint: '#c61818',
  Summary: '#c61818',
  NextPlayAd: '#c61818',
  Announce: '#c61818',
}

const textColor = {
  LivePlay: '#ffffff',
  PrePick: '#2fc12f',
  GameMaster: '#ffffff',
  Sponsor: '#ffffff',
  Prize: '#ffffff',
  ExtraPoint: '#ffffff',
  Summary: '#ffffff',
  NextPlayAd: '#ffffff',
  Announce: '#ffffff',
}

const IconsColorDark = {
  Empty: '#888',
  PrePick: '#146314',
  GameMaster: '#118e82',
  LivePlay: '#601313',
  Sponsor: '#24245b',
  Prize: '#452d59',
  ExtraPoint: '#601313',
  Summary: '#601313',
  NextPlayAd: '#601313',
  Announce: '#601313',
}
const backgroundColorLight = {
  LivePlay: '#c61818',
  PrePick: '#ffffff',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368AA',
  ExtraPoint: '#c61818',
  Summary: '#c61818',
  NextPlayAd: '#c61818',
  Announce: '#c61818',
}

export default class HistoryTracker extends Component {

  constructor(props) {
    super(props);
    h = this.props.height
    ActivePlayHeight = this.props.height * 0.07
    this.symbolIcon = this.props.symbol
    this.shortHandText = this.props.preText
    this.preText = 'pre pick'
  }

  render() {

    let { currentPrePick } = this.props

    return (
      <Container>
        <MasterWrapperOuter prepick>
          <MasterWrapper
            //maxWidth={!!this.props.PrePickStore.multiplier}
            innerRef={ref => (this.MasterWrapper = ref)}
            id="historytracker-masterwrapper"
          >
            <SymbolContainer
              dark={IconsColorDark[this.symbolIcon]}
              color={IconsColor[this.symbolIcon]}
              innerRef={ref => (this.SymbolContainer = ref)}
            >
              <PrepickActiveWrapper
                backgroundColor={backgroundColorLight[this.symbolIcon]}
                innerRef={ref => (this.ActiveWrapper = ref)}
              >
                <ShortHandWrapper
                  color={IconsColor[this.symbolIcon]}
                  innerRef={ref => (this.refShortHandLabelWrapper = ref)}
                >
                  <ShortHandLabel>{this.shortHandText}</ShortHandLabel>
                </ShortHandWrapper>
                <PrePickNumberWrapper>
                  <PrePickNumber color={IconsColor[this.symbolIcon]}>
                    {currentPrePick}
                  </PrePickNumber>
                </PrePickNumberWrapper>
                <PrePickText color={textColor[this.symbolIcon]}>
                  {this.preText}
                </PrePickText>
              </PrepickActiveWrapper>
              <SymbolWrapper innerRef={ref => (this.refSymbolWrapper = ref)}>
                <ActivePlaySymbolImg
                  src={Icons[this.symbolIcon]}
                />
              </SymbolWrapper>
            </SymbolContainer>
          </MasterWrapper>
        </MasterWrapperOuter>
      </Container>
      )
  }

}

let h = 0

let ActivePlayHeight = 0

const Container = styled.div`
  width: 58%;
`

let MasterWrapperOuter = styled.div`
  width: 100%;
  height: ${props => vhToPx(ActivePlayHeight)};
  margin-top: ${props => vhToPx(props.prepick ? (h * 0.04) : (h * 0.02))};
  margin-bottom: ${props => vhToPx(h * 0.013)};
`

let MasterWrapper = styled.li`
  width: 100%;
  height: ${props => vhToPx(ActivePlayHeight)};
  overflow: hidden;
  opacity: 1;
  display: flex;
  filter: ${props =>
  props.noPoint === 'NO POINTS' ? `grayscale(1)` : `grayscale(0)`};
`

let SymbolContainer = styled.div`
  width: 100%;
  background-color: ${props => props.dark};
  border-radius: 0 ${props => vhToPx(ActivePlayHeight)}
    ${props => vhToPx(ActivePlayHeight)} 0;
  border-top: ${props => vhToPx(h * 0.003)} solid ${props => props.color};
  border-right: ${props => vhToPx(h * 0.003)} solid ${props => props.color};
  border-bottom: ${props => vhToPx(h * 0.003)} solid ${props => props.color};
  display: flex;
  z-index: 3;
  opacity: 1;
  justify-content: space-between;
  align-items: center;
`

let SymbolWrapper = styled.div`
  background-color: white;
  border-radius: 50%;
  height: ${props => vhToPx(ActivePlayHeight * 0.85)};
  width: ${props => vhToPx(ActivePlayHeight * 0.85)};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => vhToPx(h * 0.001)};
`

const ActivePlaySymbolImg = styled.img`
  height: 80%;
  ${props => (props.isEmpty ? 'width:80%;' : '')};
  animation: ${props => rotateSymbol} 1.5s infinite forwards ease-out;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
`

const rotateSymbol = keyframes`
  0%{transform: rotate(0deg);}
  45%{transform: rotate(420deg);}
  100%{transform: rotate(360deg);}
`

const PrepickActiveWrapper = styled.div`
  position: relative;
  display: flex;
  width: 82%;
  height: ${props => vhToPx(ActivePlayHeight)};
  opacity: 1;
  z-index: 5;
  border-radius: 0 ${props => vhToPx(ActivePlayHeight)}
    ${props => vhToPx(ActivePlayHeight)} 0;
  background-color: ${props => props.backgroundColor || '#ffffff'};
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
`

let ShortHandWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 0;
  height: inherit;
  border-radius: 0 ${props => vhToPx(ActivePlayHeight)}
    ${props => vhToPx(ActivePlayHeight)} 0;
  background: ${props => props.color};
`
let ShortHandLabel = styled.span`
  display: flex;
  margin-right: ${props => vhToPx(2.5)};
  color: #ffffff;
  font-size: ${props => vhToPx(h * 0.22)};
  text-transform: uppercase;
`

let PrePickNumberWrapper = styled.div`
  margin-left: 7%;
`

let PrePickNumber = styled.div`
  background-color: ${props => props.color};
  width: ${props => vhToPx(h * 0.03)};
  height: ${props => vhToPx(h * 0.03)};
  border-radius: 50%;
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(h * 0.02)};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4%;
`

let PrePickText = styled.div`
  font-family: pamainregular;
  color: ${props => props.color};
  font-size: ${props => vhToPx(h * 0.022)};
  text-transform: uppercase;
  margin-right: ${props => vhToPx(h * 0.025)};
`
