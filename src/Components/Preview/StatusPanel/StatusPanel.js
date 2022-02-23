import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import StatusPanelTeam from './StatusPanelTeamIcon'
import { vhToPx, responsiveDimension } from '@/utils'

@observer
export default class StatusPanel extends Component {
  constructor(props) {
    super(props)

    extendObservable(this, {
      // inning: 'NFL',
      // gameStatus: 'Waiting...',
      // playingStatus: 'Game Start',
      // playingPeriod: '1st qtr',
      // playingTime: '15:00',
      /*
      teamsx: [
        {
          teamName: 'Bengals',
          iconTopColor: '#f24c20',
          iconBottomColor: '#000000',
          score: 0,
        },
        {
          teamName: 'Seahawks',
          iconTopColor: '#00133d',
          iconBottomColor: '#68bf10',
          score: 0,
        },
      ],
*/
    })
  }

  componentWillMount() {
    // if (this.props.PrePickStore.teams.length < 1) {
    //   this.props.PrePickStore.pullTeams(isDone => {
    //     debugger
    //     if (isDone) {
    //       this.props.LiveGameStore.setSelectedTeam(
    //         this.props.PrePickStore.teams[1]
    //       )
    //     }
    //   })
    // }
  }

  render() {
    const { teams } = this.props

    const isTeams = teams && teams.length > 1 ? true : false

      return (
        <Container>
          <Wrapper>
            <WrapperLeft>
              <WrapperLeftTop>
                <WrapperLeftTopInnerFront>
                  <WrapperLeftTopInnerFrontText>
                    {'SUPERBOWL'}
                  </WrapperLeftTopInnerFrontText>
                  <WrapperLeftTopInnerFrontImage
                    src={require('@/assets/images/icon-football.svg')}
                  />
                </WrapperLeftTopInnerFront>
                <InnerScore>{isTeams ? teams[0].score : ''}</InnerScore>
              </WrapperLeftTop>
              <WrapperLeftBottom>
                <WrapperLeftBottomInnerFront>
                  <WrapperLeftBottomInnerFrontText>
                    <div style={{ color: '#ffffff' }}>{'gameStatus'}</div>
                  </WrapperLeftBottomInnerFrontText>
                </WrapperLeftBottomInnerFront>
                <InnerScore>{isTeams ? teams[1].score : ''}</InnerScore>
              </WrapperLeftBottom>
            </WrapperLeft>

            <WrapperMiddle>
              <WrapperMiddleTeam>
                {
                  isTeams ? (
                    <StatusPanelTeam
                      teamInfo={teams[0]}
                      size={2.6}
                      abbrSize={1.8}
                    />
                  ) : null
                }
                <MiddleTeamName>{isTeams ? teams[0].teamName : ''}</MiddleTeamName>
              </WrapperMiddleTeam>
              <WrapperMiddleTeam>
                {
                  isTeams ? (
                    <StatusPanelTeam
                      teamInfo={teams[1]}
                      size={2.6}
                      abbrSize={1.8}
                    />
                  ) : null
                }
                <MiddleTeamName>{isTeams ? teams[1].teamName : ''}</MiddleTeamName>
              </WrapperMiddleTeam>
            </WrapperMiddle>

            <WrapperRight>
              <WrapperRightTop>
                <RightTopText1>{'playingPeriod'}</RightTopText1>
              </WrapperRightTop>
              <WrapperRightBottom
                style={{ color: '#c61818' }}
              >
                {'GAME START'}
              </WrapperRightBottom>
            </WrapperRight>
          </Wrapper>
        </Container>
      )
  }
}

const Container = styled.div`
  width: 100%;
  height: ${props => responsiveDimension(8.3)};
`
const Wrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
`
const WrapperLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
`
const WrapperLeftTop = styled.div`
  width: ${props => responsiveDimension(20)};
  height: ${props => responsiveDimension(3)};
  background-color: #cfd2d0;
  border-radius: 0 ${props => responsiveDimension(3)} ${props => responsiveDimension(3)} 0;
  display: flex;
  flex-direction: row;
`
const WrapperLeftTopInnerFront = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: ${props => responsiveDimension(1.5)};
  width: 90%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#565859'};
  border-top-right-radius: ${props => responsiveDimension(3)};
  border-bottom-right-radius: ${props => responsiveDimension(3)};
`
const WrapperLeftTopInnerFrontText = styled.div`
  font-family: pamainregular;
  font-size: ${props => responsiveDimension(2.2)};
  color: #ffffff;
  padding-right: ${props => responsiveDimension(0.5)};
`
const WrapperLeftTopInnerFrontImage = styled.img`
  height: 80%;
  margin-top: ${props => responsiveDimension(0.4)};
  padding-right: ${props => responsiveDimension(0.5)};
`
const InnerScore = styled.div`
  font-family: pamainbold;
  font-size: ${props => responsiveDimension(2.2)};
  height: 100%;
  width: 33%;
  display: flex;
  justify-content: flex-end;
  padding-right: ${props => responsiveDimension(3)};
`
const WrapperLeftBottom = styled.div`
  width: ${props => responsiveDimension(20)};
  height: ${props => responsiveDimension(3)};
  background-color: #cfd2d0;
  border-radius: 0 ${props => responsiveDimension(3)} ${props => responsiveDimension(3)} 0;

  display: flex;
  flex-direction: row;
`
const WrapperLeftBottomInnerFront = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: ${props => responsiveDimension(1.5)};
  width: 90%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#231e1c'};
  border-top-right-radius: ${props => responsiveDimension(3)};
  border-bottom-right-radius: ${props => responsiveDimension(3)};
`
const WrapperLeftBottomInnerFrontText = styled.div`
  font-family: pamainregular;
  font-size: ${props => responsiveDimension(2.2)};
  color: #18c5ff;
  text-align: right;
  text-transform: uppercase;
`

const WrapperMiddle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
  padding-left: 5%;
  width: 100%;
  overflow: hidden;
`
const WrapperMiddleTeam = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
`
const MiddleTeamName = styled.div`
  font-family: pamainbold;
  font-size: ${props => responsiveDimension(2.2)};
  color: #ffffff;
  padding-left: 2%;
  text-transform: uppercase;
`

const WrapperRight = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
`
const WrapperRightTop = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 9%;
  padding-top: ${props => responsiveDimension(1.2)};
`
const RightTopText1 = styled.div`
  font-family: pamainregular;
  font-size: ${props => responsiveDimension(2.5)};
  color: #ffffff;
  text-transform: uppercase;
`
const RightTopText2 = styled.div`
  font-family: pamainregular;
  font-size: ${props => responsiveDimension(2.5)};
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
`
const WrapperRightBottom = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 9%;
  font-family: pamainlight;
  font-size: ${props => responsiveDimension(3.6)};
  text-transform: uppercase;
  padding-bottom: ${props => responsiveDimension(0.5)};
`
