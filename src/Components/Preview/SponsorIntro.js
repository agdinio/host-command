import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import SymbolLogo from '@/assets/images/symbol-sponsor_white.svg'
import ArrowLogo from '@/assets/images/icon-arrow.svg'
import { vhToPx, hex2rgb, evalImage } from '@/utils'
let h = 0

export default class SponsorPlay extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
  }

  render() {
    let { question, sponsorLogo } = this.props
    return (
      <Container>
        <FadeIn center>
          <Header>
            <SymbolIcon src={SymbolLogo} ringColor={question.ringColor} />
            <Text font={'pamainextrabold'} size={6} color={'#ffffff'} uppercase>
              sponsor video play
            </Text>
          </Header>
          {sponsorLogo && sponsorLogo.introImageBig ? (
            <Body>
              <SponsorText>presented by:</SponsorText>
              <Sponsor
                src={evalImage(sponsorLogo.introImageBig.img)}
                size={sponsorLogo.introImageBig.size}
              />
            </Body>
          ) : null}
          <Footer>
            {sponsorLogo && sponsorLogo.introImageText ? (
              <TextWrapper>
                <Text
                  font={'pamainlight'}
                  size={3.4}
                  color={'#ffffff'}
                  uppercase
                >
                  {sponsorLogo.introImageText}
                </Text>
              </TextWrapper>
            ) : null}
            {/*
            <ArrowIcon src={this.arrowIcon} />
            <TextWrapper>
              <Text font={'pamainbold'} size={3.5} color={'#ffffff'}>
                win&nbsp;
              </Text>
              <Text font={'pamainbold'} size={3.5} color={'#ffb600'}>
                tokens&nbsp;
              </Text>
              <Text font={'pamainbold'} size={3.5} color={'#ffffff'}>
                this play
              </Text>
            </TextWrapper>
*/}
          </Footer>
        </FadeIn>
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
  width: 100%;
  height: 100%;
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

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SymbolIcon = styled.div`
  width: ${props => vhToPx(h * 0.08)};
  height: ${props => vhToPx(h * 0.08)};
  border-radius: ${props => vhToPx(h * 0.08)};
  border: ${props => vhToPx(h * 0.005)} solid ${props => props.ringColor};
  display: flex;
  justify-content: center;
  align-items: center;

  &:after {
    content: '';
    display: inline-block;
    width: ${props => vhToPx(h * 0.061)};
    height: ${props => vhToPx(h * 0.061)};
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin-bottom: ${props => vhToPx(h * 0.004)};
  }
`

const TextWrapper = styled.div``
const Text = styled.span`
  font-family: ${props => props.font};
  font-size: ${props => vhToPx(h * (props.size/100))};
  color: ${props => props.color};
  text-transform: ${props => (props.uppercase ? `uppercase` : `lowercase`)};
  ${props => (props.left ? `padding-left:${vhToPx(h * (props.left/100))}` : '')};
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2%;
`

const SponsorText = styled.span`
  font-family: pamainregular;
  text-transform: uppercase;
  font-size: ${props => vhToPx(h * 0.019)};
  color: #ffffff;
  line-height: 2;
`

const Sponsor = styled.img`
  height: ${props => vhToPx(h * (props.size/100 || 5/100))};
  margin-right: ${props => vhToPx(h * (props.marginRight/100 || 0))};
`

const ArrowIcon = styled.img`
  transform: rotate(-90deg);
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
