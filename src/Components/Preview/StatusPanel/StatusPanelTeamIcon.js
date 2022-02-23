import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx, responsiveDimension } from '@/utils'

export default class StatusPanelTeamIcon extends PureComponent {
  render() {
    let { teamInfo } = this.props

    return (
      <Container
        size={this.props.size}
        borderColor={this.props.outsideBorderColor}
      >
        <Outer size={this.props.subCircleSize}>
          <Inner>
            <InnerTop bgColor={teamInfo.iconTopColor} />
            <InnerBottom bgColor={teamInfo.iconBottomColor} />
          </Inner>
          <InnerAbbrev abbrSize={this.props.abbrSize}>
            {teamInfo.teamName.charAt(0)}
          </InnerAbbrev>
          {/*<MyDiv>{teamInfo.teamName.charAt(0)}</MyDiv>*/}
        </Outer>
      </Container>
    )
  }
}

const MyDiv = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;

  font-family: pamainbold;
  font-size: 3vh;
  color: white;
`
const Container = styled.div`
  width: ${props => responsiveDimension(props.size)};
  height: ${props => responsiveDimension(props.size)};
  border-radius: ${props => responsiveDimension(props.size)};
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.borderColor || '#ffffff'};
`
const Outer = styled.div`
  width: ${props => props.size || 80}%;
  height: ${props => props.size || 80}%;
  border-radius: 50%;
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
const InnerAbbrev = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  font-family: pamainbold;
  font-size: ${props => responsiveDimension(props.abbrSize)};
  text-transform: uppercase;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`

StatusPanelTeamIcon.propTypes = {
  teamInfo: PropTypes.object.isRequired,
}
