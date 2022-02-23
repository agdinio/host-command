import React, { Component } from 'react'
import styled from 'styled-components'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import { vhToPx } from '@/utils'

export default class DDReason extends Component {
  render() {
    return (
      <Scrolling>
        <ReasonButton height={this.props.height}>REASON</ReasonButton>
      </Scrolling>
    )
  }
}

const FONT_SIZE = '1.8vh'

const Scrolling = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  letter-spacing: ${props => 0.1}vh;
`

const ReasonButton = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  background-color: #e5e5e5;
  color: #808285;
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`
