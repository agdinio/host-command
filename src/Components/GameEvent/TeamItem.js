import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { vhToPx } from '@/utils'
import { SketchPicker } from 'react-color'

@observer
export default class TeamItem extends Component {
  handleTeamNameChange(e) {
    console.log(e.target.value)
    this.props.item.name = e.target.value
  }

  handleColorClick(pos) {
    if (pos === 'top') {
      this.props.item.colorTop.displayColorPicker = true
    } else {
      this.props.item.colorBottom.displayColorPicker = true
    }
  }

  handleChangeColor(pos, color) {
    if (pos === 'top') {
      this.props.item.colorTop.value = color.hex
    } else {
      this.props.item.colorBottom.value = color.hex
    }
  }

  handleColorClose(pos) {
    if (pos === 'top') {
      this.props.item.colorTop.displayColorPicker = false
    } else {
      this.props.item.colorBottom.displayColorPicker = false
    }
  }

  render() {
    let { item } = this.props

    return (
      <Container>
        <Wrapper>
          <Initial>A</Initial>
          <InputTeamName
            placeholder="name"
            value={item.name}
            onChange={this.handleTeamNameChange.bind(this)}
          />
          <TeamColorCircleWrapper>
            <Outer>
              <Inner>
                <InnerTop bgColor={item.colorTop.value} />
                <InnerBottom bgColor={item.colorBottom.value} />
              </Inner>
              <InnerLine />
            </Outer>
          </TeamColorCircleWrapper>
          <ColorTop
            value={item.colorTop.value}
            onClick={this.handleColorClick.bind(this, 'top')}
          />
          {item.colorTop.displayColorPicker ? (
            <div style={{ position: 'absolute', zIndex: 2 }}>
              <div
                style={{
                  position: 'fixed',
                  top: '0px',
                  right: '0px',
                  bottom: '0px',
                  left: '0px',
                }}
                onClick={this.handleColorClose.bind(this, 'top')}
              />
              <SketchPicker
                color={item.colorTop.value}
                onChange={this.handleChangeColor.bind(this, 'top')}
              />
            </div>
          ) : null}

          <ColorBottom
            value={item.colorBottom.value}
            onClick={this.handleColorClick.bind(this, 'bottom')}
          />
          {item.colorBottom.displayColorPicker ? (
            <div style={{ position: 'absolute', zIndex: 2 }}>
              <div
                style={{
                  position: 'fixed',
                  top: '0px',
                  right: '0px',
                  bottom: '0px',
                  left: '0px',
                }}
                onClick={this.handleColorClose.bind(this, 'bottom')}
              />
              <SketchPicker
                color={item.colorBottom.value}
                onChange={this.handleChangeColor.bind(this, 'bottom')}
              />
            </div>
          ) : null}
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(2)};
  margin-top: ${props => vhToPx(0.2)};
`

const Wrapper = styled.div`
  width: inherit;
  display: flex;
  justify-content: space-between;
`

const Initial = styled.div`
  width: ${props => vhToPx(3.5)};
  height: ${props => vhToPx(5)};
  background-color: #000000;
  color: #ffffff;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
`
const InputTeamName = styled.input`
  width: 50%;
  height: ${props => vhToPx(5)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  text-indent: ${props => vhToPx(1)};
  text-transform: uppercase;
  &::placeholder {
    opacity: 0.3;
  }
`

const TeamColorCircleWrapper = styled.div`
  width: ${props => vhToPx(5)};
  height: ${props => vhToPx(5)};
  border-radius: ${props => vhToPx(5)};
  overflow: hidden;
  position: relative;
`
const Outer = styled.div`
  width: 95%;
  height: 95%;
  border-radius: 95%;
  overflow: hidden;
`

const Inner = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
`
const InnerTop = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.bgColor};
`
const InnerBottom = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.bgColor};
`

const InnerLine = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  color: #ffffff;
  justify-content: center;
  align-items: center;
  &:after {
    content: '-';
  }
`

const ColorWrapper = styled.div`
  display: inline-block;
  cursor: pointer;
`

const ColorTop = styled.div`
  width: ${props => vhToPx(9)};
  height: ${props => vhToPx(5)};
  background-color: ${props => props.backgroundColor || '#fff'};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => vhToPx(0.2)};
  cursor: pointer;
  &:after {
    content: '${props => props.value}';
    color: rgba(0, 0, 0, 0.4);
    font-family: pamainregular;
  }
`

const ColorBottom = styled.div`
  width: ${props => vhToPx(9)};
  height: ${props => vhToPx(5)};
  background-color: ${props => props.backgroundColor || '#fff'};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => vhToPx(0.2)};
  cursor: pointer;
  &:after {
    content: '${props => props.value}';
    color: rgba(0, 0, 0, 0.4);
    font-family: pamainregular;
  }
`

const Swatch = styled.div`
  padding: 5px;
  background: #fff;
  borderradius: 1px;
  display: inline-block;
  cursor: pointer;
`
const ColorSwatch = styled.div`
  width: 36px;
  height: 14px;
  borderradius: 2px;
  background: white;
`
