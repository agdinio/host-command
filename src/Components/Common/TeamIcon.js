import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import * as util from '@/utils'

export default class TeamIcon extends PureComponent {
  render() {
    let { teamInfo } = this.props

    return (
      <Container
        size={this.props.size}
        borderColor={this.props.outsideBorderColor}
      >
        <Outer>
          <Inner>
            <InnerTop bgColor={teamInfo.iconTopColor} />
            <InnerBottom bgColor={teamInfo.iconBottomColor} />
          </Inner>
          <InnerAbbrev abbrSize={this.props.abbrSize}>
            {teamInfo.initial}
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
  font-size: ${props => 3}vh;
  color: white;
`
const Container = styled.div`
  width: ${props => props.size}vh;
  height: ${props => props.size}vh;
  border-radius: ${props => props.size}vh;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.borderColor || '#ffffff'};
`
const Outer = styled.div`
  width: 85%;
  height: 85%;
  border-radius: 85%;
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
  font-size: ${props => props.abbrSize}vh;
  text-transform: uppercase;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`

TeamIcon.propTypes = {
  teamInfo: PropTypes.object.isRequired,
}
