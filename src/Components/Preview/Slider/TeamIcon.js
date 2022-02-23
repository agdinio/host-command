import React, { Component } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import icon_lock from '@/assets/images/icon-lock.svg'
import { TweenMax, Linear } from 'gsap'
import * as util from '@/utils'
const attr = {
  teamName: '',
  colorTop: '',
  colorBottom: '',
  selectedTeamName: '',
  initialColor: '',
  teamIconBG: '',
  teamDisplay: 'flex',
  lockDisplay: 'none',
  initial: ''
}

@observer
export default class TeamIcon extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    this.reset()
  }

  componentWillUnmount() {
    this.reset()
  }

  reset() {
    attr.teamName = ''
    attr.colorTop = ''
    attr.colorBottom = ''
    attr.selectedTeamName = ''
    attr.initialColor = ''
    attr.teamIconBG = ''
    attr.teamDisplay = 'flex'
    attr.lockDisplay = 'none'
    attr.initial = ''
  }

  render() {
    const { team } = this.props

    if (!team) {
      return null
    }

    attr.teamName = team.name
    attr.colorTop = team.topColor
    attr.colorBottom = team.bottomColor
    attr.initial = team.initial

    if (
      this.props.selectedTeam !== '' &&
      this.props.selectedTeam.toUpperCase() !== attr.teamName.toUpperCase()
    ) {
      attr.colorTop = '#58595b'
      attr.colorBottom = '#000000'
      attr.lockDisplay = 'none'
    }

    if (
      this.props.changeToBlank &&
      this.props.selectedTeam !== '' &&
      this.props.selectedTeam.toUpperCase() !== attr.teamName.toUpperCase()
    ) {
      attr.teamDisplay = 'flex'
    }

    if (
      this.props.changeToLock &&
      this.props.selectedTeam !== '' &&
      this.props.selectedTeam.toUpperCase() !== attr.teamName.toUpperCase()
    ) {
      attr.initialColor = '#afb1b4'
      attr.lockDisplay = 'none'
      attr.teamIconBG = '#afb1b4'
    } else if (
      this.props.changeToLock &&
      this.props.selectedTeam !== '' &&
      this.props.selectedTeam.toUpperCase() === attr.teamName.toUpperCase()
    ) {
      attr.initialColor = '#FFFFFF'
      attr.teamIconBG = '#FFFFFF'

      TweenMax.to(this.refIconWrapper, 0.3, {
        left: -this.refIconWrapper.offsetWidth,
        ease: Linear.easeOut,
      })
      TweenMax.to(this.refIconLockWrapper, 0.3, {
        left: -this.refIconLockWrapper.offsetWidth,
        ease: Linear.easeIn,
      })
    }

    return (
      <Container innerRef={c => (this.refContainer = c)}>
        <Wrapper>
          <InnerWrapper innerRef={c => (this.refIconWrapper = c)}>
            <IconWrapper>
              <IconTeamDisplayWrapper>
                <IconTeamDisplay>
                  <Top />
                  <Bottom />
                </IconTeamDisplay>
                <AbbrevWrapper>
                  <Abbrev>{attr.initial}</Abbrev>
                </AbbrevWrapper>
              </IconTeamDisplayWrapper>
            </IconWrapper>
          </InnerWrapper>

          <InnerWrapper innerRef={c => (this.refIconLockWrapper = c)}>
            <IconLockWrapper>
              <IconLock src={icon_lock} alt="lock" />
            </IconLockWrapper>
          </InnerWrapper>
        </Wrapper>
      </Container>
    )
  }
}

let h = 0

const Container = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  display: flex;
  background-color: ${props => attr.teamIconBG};
`
const Wrapper = styled.div`
  width: calc(100% * 2);
  height: 100%;
  display: flex;
`
const InnerWrapper = styled.div`
  width: 100%;
  min-width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`
const IconWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  border: ${props => util.vhToPx(h * 0.0055)} solid #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`

const IconTeamDisplayWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  display: ${props => attr.teamDisplay};
`

const IconTeamDisplay = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: absolute;
  overflow: hidden;

  background: red;
`

const Top = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 0 0;
  background-color: ${props => attr.colorTop};
`

const Bottom = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 0 0 50% 50%;
  background-color: ${props => attr.colorBottom};
`

const AbbrevWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  z-index: 1;
`
const Abbrev = styled.div`
  font-family: pamainbold;
  font-size: ${props => util.vhToPx(h * 0.053)};
  color: #ffffff;
  color: ${props => attr.initialColor};
`

const IconLockWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  border: ${props => util.vhToPx(h * 0.0055)} solid #ffffff;
  background-color: #000000;
  justify-content: center;
  align-items: center;
  display: flex;
`

const IconLock = styled.img`
  height: 65%;
  width: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: ${props => util.vhToPx(h * 0.009)} auto;
`

// TeamIcon.propTypes = {
//   team: PropTypes.object.isRequired,
//   selectedTeam: PropTypes.string.isRequired,
//   changeToBlank: PropTypes.bool.isRequired,
//   changeToLock: PropTypes.bool.isRequired,
// }
