import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import { observer, inject } from 'mobx-react'
import {extendObservable, intercept} from 'mobx'
import bgDefault from '@/assets/images/preview/playalong-kickoff.jpg'
import iconMenu from '@/assets/images/preview/icon-menu.svg'
import iconMenuPlayalong from '@/assets/images/preview/PlayAlongNow-Logo_Invert.svg'
import {vhToPx, vhToPxNum} from '@/utils'
import HistoryTracker from './HistoryTracker'
import PicksPointsTokens from './PicksPointsTokens'
import Draggable, {DraggableCore} from 'react-draggable';

import StatusPanel from './StatusPanel/StatusPanel'
import GameHeader from './GameHeader'
import script from './PlayScript'
import MultiplierQuestion from './MultiplierQuestion'
import GameMasterQuestion from './GameMaster'
import SponsorQuestion from './Sponsor'
import AdvertisementQuestion from './Advertisement'
import Announce from './Announce'

@inject('GameStore')
@observer
export default class Preview extends Component {
  constructor(props) {
    super(props);
    extendObservable(this, {
      currentScreen: null,
    })

    this.screens = {
      MultiplierQuestion,
      GameMasterQuestion,
      SponsorQuestion,
      AdvertisementQuestion,
      Announce
    }

    this.values = null


    this.destroyAnnouncementValue = intercept(this.props.GameStore, 'announcementValueObservable', change => {
      this.populateAnnouncements(change.newValue)
      return change;
    })
  }

  populateAnnouncements(_announce) {
    const q = script.filter(o => new RegExp('announce', 'gi').test(o.type))[0]
    if (q) {
      // q.choices = this.values.choices
      // q.forTeam = this.values.team
      // q.stars = this.values.stars
      // q.playTitle = this.values.playTitle.value
      q.announcements = _announce ? _announce.announcements : []
      q.sponsor = _announce ? _announce.sponsor : null
      this.currentScreen = q
    }
  }

  populateValues() {
    if (!this.values) {
      this.values = this.props.values
    }

    if (this.values && Object.keys(this.values).length > 0) {

      const q = script.filter(o => new RegExp(this.values && this.values.type ? this.values.type : '', 'gi').test(o.type))[0]
      if (q) {
        q.choices = this.values.choices
        q.forTeam = this.values.team
        q.stars = this.values.stars
        q.playTitle = this.values.playTitle.value
        this.currentScreen = q
      }
    } else {
      this.populateAnnouncements(this.props.GameStore.announcementValueObservable)
    }
  }

  componentWillUnmount() {
    this.destroyAnnouncementValue();
  }

  componentWillReceiveProps(nextProps) {
    this.values = nextProps.values
    this.populateValues()
  }

  componentDidMount() {
    this.populateValues()
  }

  LiveQuestionOption() {
    const current = Object.assign({}, this.currentScreen || {})
    const Comp = this.screens[current.componentName]

    if (current && Comp) {
      //this.props.questionBackground(current.backgroundImage)

      return (
        <Comp
          key={`questionComp-${current.id}`}
          teams={this.props.teams}
          question={current}
          timer={current.length}
          height={h}
        />
      )
    }

    return null
  }

  render() {
    let { teams } = this.props

    const x = window.innerWidth - vhToPxNum(w + 2)
    const y = vhToPxNum(13)

    return (
      <PreviewContainer grab={true}>
        <Draggable
          positionOffset={{x: '100%', y: 0}}
          defaultPosition={{x: x, y: y}}
          handle=".handle"
          grid={[5, 5]}
          scale={1}
          bounds="body"
        >
          <Container className="handle">
            <MenuWrapper>
              <TopNavContentSideBySide>
                <TopNavContentLeft></TopNavContentLeft>
                <TopNavContentRight>
                  <IconMenuWrapper>
                    <IconMenu src={iconMenu} />
                  </IconMenuWrapper>
                </TopNavContentRight>
              </TopNavContentSideBySide>
              <TopNavContentMiddle>
                <IconMenuPlayalong src={iconMenuPlayalong} />
              </TopNavContentMiddle>
            </MenuWrapper>
            <Background />
            <Wrapper>

              <Section>
                <GameHeader teams={teams} height={h} />
              </Section>

              <Section>
                <Content>
                  <LiveQuestionContainer>
                    {this.LiveQuestionOption()}
                  </LiveQuestionContainer>
                </Content>
              </Section>

              <Section>
                <StepWrapper>
                  <Step
                    key={0}
                    innerRef={c => (this[`step0`] = c)}
                  />
                  <Step
                    key={1}
                    innerRef={c => (this[`step1`] = c)}
                  />
                  <Step
                    key={2}
                    innerRef={c => (this[`step2`] = c)}
                  />
                </StepWrapper>
              </Section>

              <Section>
                <TabWrapper>
                  <TabInnerWrapper>
                    <Tab key={0} innerRef={c => (this['tab0'] = c)} id="tab0">
                      <HistoryTracker
                        preText="Pre Pick"
                        symbol="PrePick"
                        //currentPrePick={question && question.sequence ? question.sequence : 0}
                        height={h}
                      />
                    </Tab>
                  </TabInnerWrapper>
                </TabWrapper>
              </Section>

            </Wrapper>
          </Container>
        </Draggable>
      </PreviewContainer>
    )
  }

}


const h = 50;
const w = h * 0.65;

const PreviewContainer = styled.div`
  position: absolute;
  width: ${props => vhToPx(w)};
  height: ${props => vhToPx(h)};
  z-index: 202;
  left: ${props => vhToPx(-w)};
  top: 0;
  &:hover {
    cursor: ${props => (props.grab ? '-moz-grab' : '')};
    cursor: ${props => (props.grab ? '-webkit-grab' : '')};
    cursor: ${props => (props.grab ? 'grab' : '')};
  }
  &:active {
    cursor: ${props => (props.grab ? '-moz-grabbing' : '')};
    cursor: ${props => (props.grab ? '-webkit-grabbing' : '')};
    cursor: ${props => (props.grab ? 'grabbing' : '')};
  }
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Background = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  background-image: url(${bgDefault});
  background-repeat: no-repeat;
  background-size: cover;
  filter: grayscale(1);
  -webkit-filter: grayscale(1);
  z-index: 1;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 2;
`

const MenuWrapper = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 0.068)};
  background-color: #000000;
  z-index: 2;
  display: flex;
  position: relative;
`

const TopNavContentSideBySide = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  display: flex;
  width: 100%;
  height: 100%;
`

const TopNavContentLeft = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
`

const TopNavContentRight = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`

const IconMenuWrapper = styled.div`
  right: 0;
  width: ${props => vhToPx(h * (5.5/100))};
  height: ${props => vhToPx(h * (5.5/100))};
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 2%;
`

const IconMenu = styled.img`
  width: ${props => vhToPx(h * (2.7/100))};
  pointer-events: none;
`

const TopNavContentMiddle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const IconMenuPlayalong = styled.img`
  z-index: 1;
  height: ${props => vhToPx(h * (4.5/100))};
  pointer-events: none;
`

const Section = styled.div`
  width: 100%;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  ${props => props.direction ? `flex-direction:${props.direction}` : ``};
  ${props => props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => props.alignItems ? `align-items:${props.alignItems};` : ``};
`

const Content = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 0.45)};
  display: flex;
  position: relative;
  overflow: hidden;
`

const StepWrapper = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 0.025)};
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #565859;
  position: relative;
  z-index: 99;
`
const Step = styled.span`
  height: ${props => vhToPx(h * 0.04)};
  width: ${props => vhToPx(h * 0.04)};
  background-color: #919594;
  border: none;
  border-radius: 50%;
  display: inline-block;
  z-index: 1;
  margin-right: ${props => vhToPx(h * 0.035)};
  &:hover {
    cursor: pointer;
  }
  &.active {
    background-color: #ffffff;
  }
`

const TabWrapper = styled.div`
  width: 100%;
  height: 75%
  position: relative;
  display: flex;
  background-color: transparent;
  overflow: hidden;
`

const TabInnerWrapper = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  //height: fill-available;
  height: 100%;
  z-index: 1; /* to put infront of the points and tokens div */
`

const Tab = styled.div`
  display: inline-block;
  width: 100%;
  height: 100%;
`

const LiveQuestionContainer = styled.div`
  width: inherit;
  height: inherit;
  position: absolute;
`
