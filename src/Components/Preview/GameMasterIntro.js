import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import gm_white from '@/assets/images/symbol-gm_white.svg'
import { vhToPx, hex2rgb, evalImage } from '@/utils'
let h = 0

@observer
export default class GameMasterIntro extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
  }

  render() {
    let { sponsorLogo } = this.props
    return (
      <Container>
        <FadeInIntro center>
          <PlayIcon>
            <Icon src={gm_white} />
          </PlayIcon>
          <Title>
            <Text>Game Master Play</Text>
          </Title>
          {sponsorLogo && sponsorLogo.image ? (
            <SponsorWrapper>
              <SponsorText>brought to you by:</SponsorText>
              <Sponsor src={evalImage(sponsorLogo.image)} />
            </SponsorWrapper>
          ) : null}
        </FadeInIntro>
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

const FadeInIntro = styled.div`
  ${props =>
    props.fadeOut
      ? `animation: 0.4s ${fadeOutBottom} forwards`
      : `animation: 0.4s ${fadeInTop} forwards;animation-delay: ${
          props.delay ? 0.4 : 0
        }s`};
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: inherit;
  height: inherit;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
`

const PlayIcon = styled.div`
  color: white;
  background-color: #19d1bf;
  height: ${props => vhToPx(h * 0.08)};
  width: ${props => vhToPx(h * 0.08)};
  overflow: hidden;
  border-radius: 100%;
  margin-bottom: ${props => vhToPx(h * 0.025)};
  border: ${props => vhToPx(h * 0.005)} solid #000;
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

const Text = styled.div`
  font-size: ${props => vhToPx(h * 0.07)};
  line-height: 1;
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
  font-size: ${props => vhToPx(h * 0.019)};
  color: #ffffff;
  line-height: 2;
`

const Sponsor = styled.img`
  height: ${props => vhToPx(props.height || (h * 0.05))};
  margin-right: ${props => vhToPx(props.marginRight || 0)};
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
