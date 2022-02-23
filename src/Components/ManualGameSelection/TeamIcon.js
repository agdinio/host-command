import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { vhToPx } from '@/utils'

export default class TeamIcon extends PureComponent {


  constructor(props) {
    super(props)
    h = this.props.size
  }

  render() {
    let { teamInfo } = this.props

    return (
      <Container>
        <Outer backgroundColor={this.props.outsideBorderColor}>
          <Inner borderColor={this.props.outsideBorderColor} borderWidth={this.props.outsideBorderWidth}>
            <InnerTop bgColor={teamInfo.topColor} />
            <InnerBottom bgColor={teamInfo.bottomColor} />
          </Inner>
          <InnerAbbrev abbrSize={this.props.abbrSize} font={this.props.font} text={teamInfo.initial} />
        </Outer>
      </Container>
    )
  }
}

let h = 0
const Container = styled.div`
  width: ${props => vhToPx(h)};
  height: ${props => vhToPx(h)};
  min-width: ${props => vhToPx(h)};
  min-height: ${props => vhToPx(h)};
  border-radius: ${props => vhToPx(h/2)};
  overflow: hidden;
  position: relative;
`
const Outer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${props => props.backgroundColor || '#ffffff'};
`
const Inner = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: ${props => vhToPx(props.borderWidth || (h * 0.1))} solid ${props => props.borderColor || '#ffffff'}; 
  overflow: hidden;
`
const InnerTop = styled.div`
  width: 100%;
  height: 100%;
  border-top-left-radius: ${props => vhToPx(h/2)};
  border-top-right-radius: ${props => vhToPx(h/2)};
  background-color: ${props => props.bgColor};
`
const InnerBottom = styled.div`
  width: 100%;
  height: 100%;
  border-bottom-left-radius: ${props => vhToPx(h/2)};
  border-bottom-right-radius: ${props => vhToPx(h/2)};
  background-color: ${props => props.bgColor};
`
const InnerAbbrev = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '${props => props.text}';
    font-family: ${props => props.font || 'pamainbold'};
    font-size: ${props => vhToPx(h * 0.6)};
    text-transform: uppercase;
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx((h * 0.6) * 0.75)};
    margin-bottom: 5%;
  }
`

TeamIcon.propTypes = {
  teamInfo: PropTypes.object.isRequired,
}
