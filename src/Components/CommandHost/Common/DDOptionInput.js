import React, { Component } from 'react'
import styled from 'styled-components'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import { vhToPx } from '@/utils'

export default class DDOptionInput extends Component {
  render() {
    let { item, readOnly } = this.props

    return (
      <Scrolling>
        <SelectedButton
          height={this.props.height}
          backgroundColor={this.props.backgroundColor}
          readOnly={readOnly}
        >
          {item}
        </SelectedButton>
      </Scrolling>
    )
  }
}

const FONT_SIZE = '1.8vh'

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  letter-spacing: ${props => 0.1}vh;
`

const SelectedButton = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  background-color: ${props => props.backgroundColor};
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;

  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`
