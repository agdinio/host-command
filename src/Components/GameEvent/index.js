import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { TweenMax } from 'gsap'
import { vhToPx, vwToPx, vhToNum } from '@/utils'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import StartDateIcon from '@/assets/images/icon-start-date.svg'
import StartTimeIcon from '@/assets/images/icon-start-time.svg'
import StartScheduleIcon from '@/assets/images/icon-start-schedule.svg'
import TeamItem from '@/Components/GameEvent/TeamItem'
import {
  AlphaPicker,
  BlockPicker,
  ChromePicker,
  CirclePicker,
  CompactPicker,
  GithubPicker,
  HuePicker,
  MaterialPicker,
  PhotoshopPicker,
  SketchPicker,
  SliderPicker,
  SwatchesPicker,
  TwitterPicker,
} from 'react-color'

@inject('GameEventStore')
@observer
export default class GameEvent extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      values: {
        teams: [],
      },
    })

    this.state = {
      displayColorPicker: false,
      color: {
        r: '241',
        g: '112',
        b: '19',
        a: '1',
      },
    }
  }

  handleColor1Click() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
    console.log(this.values)
  }

  handleChangeColor(color) {
    this.setState({ color: color.rgb })
  }

  handleColorClose() {
    this.setState({ displayColorPicker: false })
  }

  handleAddTeamClick() {
    this.props.GameEventStore.incrementTeamCounter(cnt => {
      let team = {
        id: cnt,
        name: '',
        initial: '',
        colorTop: {
          value: '#000000',
          displayColorPicker: false,
        },
        colorBottom: {
          value: '#414042',
          displayColorPicker: false,
        },
      }
      this.values.teams.push(team)
    })
  }

  render() {
    return (
      <Container>
        <Wrapper>
          <EventsWrapper>
            <Section>
              <GameEventWrapper>
                <Label size={3}>game id</Label>
                <InputGameEvent placeholder="game event name" />
              </GameEventWrapper>
            </Section>
            <Section marginTop={6}>
              <SportTypeWrapper>
                <Label size={2} faded>
                  sport type
                </Label>
                <SportTypes>
                  <SportType>football</SportType>
                  <SportType>basketball</SportType>
                  <SportType>golf</SportType>
                </SportTypes>
                <SportTypes>
                  <SportType>nfl</SportType>
                  <SportType>ncaa</SportType>
                  <SportType />
                </SportTypes>
              </SportTypeWrapper>
            </Section>
            <Section marginTop={3}>
              <VenueWrapper>
                <Label faded>venue location</Label>
                <Venues>
                  <DDState>
                    <option value={''}>STATE</option>
                  </DDState>
                  <DDCity>
                    <option value={''}>CITY</option>
                  </DDCity>
                  <InputStadiumName placeholder="stadium name" />
                </Venues>
              </VenueWrapper>
            </Section>
            {/*
            <Section marginTop={3}>
              <DateTimeWrapper>
                <Label faded>game day - date & time</Label>
                <DateTimePanel>
                  <StartDate placeholder="start date" />
                  <StartTime placeholder="start time" />
                </DateTimePanel>
                <AnnounceToSchedule placeholder="announce to schedule" />
              </DateTimeWrapper>
            </Section>
*/}
            <Section marginTop={3}>
              <TeamsWrapper>
                <Label faded>teams or participants</Label>
                <TeamsPanel>
                  {this.values.teams.map(team => {
                    return <TeamItem key={team.id} item={team} />
                  })}
                </TeamsPanel>
                <AddTeamButton onClick={this.handleAddTeamClick.bind(this)}>
                  <PlusSign>+</PlusSign>
                  ADD TEAM/PARTICIPANT
                </AddTeamButton>

                <Swatch onClick={this.handleColor1Click.bind(this)}>
                  <ColorSwatch
                    r={this.state.color.r}
                    g={this.state.color.g}
                    b={this.state.color.b}
                    a={this.state.color.a}
                  />
                </Swatch>
                {this.state.displayColorPicker ? (
                  <div style={{ position: 'absolute', zIndex: 2 }}>
                    <div
                      style={{
                        position: 'fixed',
                        top: '0px',
                        right: '0px',
                        bottom: '0px',
                        left: '0px',
                      }}
                      onClick={this.handleColorClose.bind(this)}
                    />
                    <SketchPicker
                      color={this.state.color}
                      onChange={this.handleChangeColor.bind(this)}
                    />
                  </div>
                ) : null}
              </TeamsWrapper>
            </Section>

            {/*
            <Section marginTop={30}>
              <Color1 backgroundColor={this.values.color1} innerRef={ref => this.Color1 = ref} onClick={this.handleColor1Click.bind(this)} />
              {
                this.values.displayColor ? (
                  <div style={{position:'absolute', zIndex:2}} ref={ref => this.PickerWrapper = ref}>
                    <div style={{position:'fixed', top:0, right:0, bottom:0, left:0}} onClick={this.handleColorClose.bind(this)} />
                    <SketchPicker color={this.values.color1} onChange={this.handleChangeComplete.bind(this)} />
                  </div>
                ) : null

              }
            </Section>
*/}
          </EventsWrapper>

          <PrePicksWrapper />

          <SponsorsWrapper />
        </Wrapper>
      </Container>
    )
  }
}

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
  background: rgba(
    ${props => `${props.r}, ${props.g}, ${props.b}, ${props.a}`}
  );
`

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: #f1f2f2;
  position: relative;
  font-family: pamainbold;
  font-size: ${props => vhToPx(2)};
  text-transform: uppercase;
`

const Wrapper = styled.div`
  width: ${props => vwToPx(100)};
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
`

const EventsWrapper = styled.div`
  width: 45%;
  height: inherit;
  background-color: #eaeaea;
  display: flex;
  flex-direction: column;
  padding: 1.5% 1%;
`

const PrePicksWrapper = styled.div`
  width: 100%;
  height: inherit;
`

const SponsorsWrapper = styled.div`
  width: 30%;
  height: inherit;
  background-color: #212121;
`

const Section = styled.div`
  width: 100%;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  align-items: center;
`

const GameEventWrapper = styled.div`
  width: inherit;
  height: ${props => vhToPx(5)};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Label = styled.span`
  font-size: ${props => vhToPx(props.size || 2)};
  margin-right: ${props => vhToPx(props.marginRight || 0)};
  color: ${props => (props.faded ? 'rgba(0,0,0,0.5)' : '#000000')};
`

const InputGameEvent = styled.input`
  width: 70%;
  height: inherit;
  border: none;
  outline: none;
  padding-left: 3%;
  padding-right: 3%;
  text-transform: uppercase;
  &::placeholder {
    opacity: 0.3;
  }
`

const SportTypeWrapper = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
`

const SportTypes = styled.div`
  width: inherit;
  display: flex;
  flex-direction: row;
  margin-bottom: ${props => vhToPx(0.2)};
`

const SportType = styled.div`
  width: 100%;
  height: ${props => vhToPx(5)};
  background-color: #d3d3d3;
  color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => vhToPx(0.2)};
`

const VenueWrapper = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
`

const Venues = styled.div`
  width: inherit;
  display: flex;
  justify-content: space-between;
`

const DDState = styled.select`
  width: 24%;
  height: ${props => vhToPx(5)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => vhToPx(2)};
  text-align-last: center;
  margin-right: ${props => vhToPx(0.2)};
`

const DDCity = styled.select`
  width: 24%;
  height: ${props => vhToPx(5)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => vhToPx(2)};
  text-align-last: center;
  margin-right: ${props => vhToPx(0.2)};
`

const InputStadiumName = styled.input`
  width: 53%;
  height: inherit;
  border: none;
  outline: none;
  padding-left: 3%;
  padding-right: 3%;
  text-transform: uppercase;
  &::placeholder {
    opacity: 0.3;
  }
`

const DateTimeWrapper = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
`

const DateTimePanel = styled.div`
  width: inherit;
  display: flex;
  flex-direction: row;
`

const StartDate = styled.input`
  width: ${props => vhToPx(18)};
  height: ${props => vhToPx(5)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${StartDateIcon});
  background-repeat: no-repeat;
  background-position: center right ${props => vhToPx(1)};
  background-size: ${props => vhToPx(2.7)};
  padding-left: 3%;
  padding-right: ${props => vhToPx(4.5)};
  text-transform: uppercase;
  margin-right: ${props => vhToPx(0.2)};
`

const StartTime = styled.input`
  width: ${props => vhToPx(18)};
  height: ${props => vhToPx(5)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${StartTimeIcon});
  background-repeat: no-repeat;
  background-position: center right ${props => vhToPx(1)};
  background-size: ${props => vhToPx(3)};
  padding-left: 3%;
  padding-right: ${props => vhToPx(4.5)};
  text-transform: uppercase;
  margin-right: ${props => vhToPx(0.2)};
`

const AnnounceToSchedule = styled.input`
  width: ${props => vhToPx(36.2)};
  height: ${props => vhToPx(5)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${StartScheduleIcon});
  background-repeat: no-repeat;
  background-position: center right ${props => vhToPx(1)};
  background-size: ${props => vhToPx(3)};
  padding-left: 3%;
  padding-right: ${props => vhToPx(4.5)};
  text-transform: uppercase;
  margin-right: ${props => vhToPx(0.2)};
  margin-top: ${props => vhToPx(0.2)};
`

const TeamsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const TeamsPanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Color1 = styled.div`
  width: ${props => vhToPx(10)};
  height: ${props => vhToPx(5)};
  background-color: ${props => props.backgroundColor};
  cursor: pointer;
`

const PickerWrapper = styled.div`
  height: auto;
  position: absolute;
  display: none;
`

const AddTeamButton = styled.div`
  width: 100%;
  height: ${props => vhToPx(5)};
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  text-transform: uppercase;
  cursor: pointer;
  letter-spacing: ${props => vhToPx(0.1)};
  margin-top: ${props => vhToPx(0.5)};
`

const PlusSign = styled.span`
  height: inherit;
  font-family: pamainlight;
  font-size: ${props => vhToPx(2.5)};
  display: flex;
  justify-content: center;
  align-items: center;
`
