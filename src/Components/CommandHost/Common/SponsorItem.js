import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'

export default class SponsorItem extends Component {
  render() {
    let {
      item,
      hasBorderBottom,
      backgroundColor,
      refClick,
      locked,
    } = this.props

    return (
      <Container
        backgroundColor={backgroundColor}
        hasBorderBottom={hasBorderBottom}
        onClick={refClick}
        locked={locked}
      >
        <Wrapper>
          <ItemName>{item.brandName}</ItemName>
          <Thumbnail>
            <Circle src={item.brandImage} />
          </Thumbnail>
          <ExposureCount>
            <ExposureCountText>{item.brandExposureCount}</ExposureCountText>
          </ExposureCount>
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background-color: ${props => props.backgroundColor};
  padding-left: ${props => 1}vh;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  ${props =>
    props.hasBorderBottom ? `border-bottom: ${0.1}vh solid #d9d9d9` : ''};
`

const Wrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: row;
`

const ItemName = styled.div`
  width: 64%
  height: 100%;
  font-family: pamainregular;
  font-size: ${props => 100 * 0.02}vh;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  white-space: nowrap;
`

const Thumbnail = styled.div`
  width: 18%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Circle = styled.div`
  position: relative;
  width: 90%;
  min-width: 90%;
  height: 0;
  padding-bottom: 90%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  &:before {
    content: '';
    position: absolute;
    width: 90%;
    height: 90%;
    min-width: 90%;
    min-height: 90%;
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  &:after {
    width: 90%;
    height: 90%;
    border-radius: 50%;
    position: absolute;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`

const ExposureCount = styled.div`
  width: 18%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ExposureCountText = styled.span`
  font-family: pamainbold;
  font-size: ${props => 100 * 0.02}vh;
  color: #000000;
  line-height: 1;
`
