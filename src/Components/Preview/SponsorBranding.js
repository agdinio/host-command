import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'
let h = 0

export default class SponsorBranding extends Component {
  constructor(props) {
    super(props);
    h = this.props.height
  }

  render() {
    let { item } = this.props

    return (
      <Container backgroundColor={item.backgroundColor}>
        <SponsorName height={6} color={item.initialColor}>
          {item.name}
        </SponsorName>
        <CircleSponsorLetter
          borderColor={item.circleBorderColor}
          circleFill={item.circleFill}
          color={item.initialColor}
          text={item.initial}
          height={7}
        >
          <CircleSponsorLetterInner
            borderColor={item.circleBorderColor}
            circleFill={item.circleFill}
          >
            <SponsorLetter
              color={item.initialColor}
              text={item.initial}
              height={7}
            >
              {item.initial}
            </SponsorLetter>
          </CircleSponsorLetterInner>
        </CircleSponsorLetter>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.backgroundColor};
  border-radius: ${props => vhToPx(h * 0.005)};
  padding: ${props => vhToPx(h * 0.01)};
`

const SponsorName = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * ((0.6 * props.height)/100))};
  color: ${props => props.color};
  text-transform: uppercase;
  margin-right: ${props => vhToPx(h * 0.01)};
`

const CircleSponsorLetter = styled.div`
  width: ${props => vhToPx(h * (props.height/100))};
  height: ${props => vhToPx(h * (props.height/100))};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: ${props => vhToPx(h * 0.005)};
`

const CircleSponsorLetterInner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: ${props => vhToPx(h * 0.005)} solid ${props => props.borderColor};
  background-color: ${props => props.circleFill};
  display: flex;
  justify-content: center;
  align-items: center;
`

const SponsorLetter = styled.div`
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * (0.8 * props.height)/100)};
  text-transform: uppercase;
  color: ${props => props.color};
  padding-top: ${props => vhToPx(h * 0.006)};
`
