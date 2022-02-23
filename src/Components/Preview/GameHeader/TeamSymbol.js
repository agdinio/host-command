import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { vhToPx } from '@/utils'

export default class TeamSymbol extends PureComponent {
  render() {
    let { teamInfo, sizeInPercent, abbrSize, borderColor } = this.props

    return (
      <Container size={sizeInPercent} backgroundColor={borderColor}>
        <Outer>
          <Inner>
            <InnerColors>
              <InnerTop bgColor={teamInfo.iconTopColor} />
              <InnerBottom bgColor={teamInfo.iconBottomColor} />
            </InnerColors>
            <InnerAbbrev size={23} abbrSize={abbrSize}>
              {teamInfo.teamName.initial}
            </InnerAbbrev>
          </Inner>
        </Outer>
      </Container>
    )
  }
}

const Container = styled.div`
  position: relative;
  width: ${props => props.size}%;
  min-width: ${props => props.size}%;
  height: 0;
  padding-bottom: ${props => props.size}%;
  background-color: ${props => props.backgroundColor};
  border-radius: 50%;
`

const Outer = styled.div`
  position: absolute;
  width: 80%;
  min-width: 80%;
  height: 80%;
  min-height: 80%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Inner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
`

const InnerColors = styled.div`
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
  font-size: ${props => vhToPx(props.abbrSize)};
  text-transform: uppercase;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`

TeamSymbol.propTypes = {
  teamInfo: PropTypes.object.isRequired,
}
