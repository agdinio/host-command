import React, { Component } from 'react'
import styled from 'styled-components'
import Team from '@/Components/Common/TeamIcon'
import { vhToPx } from '@/utils'

export default class TeamItem extends Component {
  render() {
    let { team, backgroundColor } = this.props

    return (
      <AvailTeam bg={backgroundColor || 'transparent'}>
        <TeamLabel>{team.teamName}</TeamLabel>
        <TeamCircleWrapper>
          <Team
            teamInfo={team}
            size={3}
            abbrSize={1.8}
            outsideBorderColor={'#000000'}
          />
        </TeamCircleWrapper>
      </AvailTeam>
    )
  }
}

const AvailTeam = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.bg};
`

const TeamLabel = styled.div`
  width: 100%;
  height: inherit;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10%;
  color: white;
`

const TeamCircleWrapper = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 10%;
`
