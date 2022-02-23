import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import CheckIcon from '@/assets/images/play-resolved.svg'
import DDStar from '@/Components/CommandHost/Common/DDStar'
import DDSponsorBrand from '@/Components/CommandHost/Common/DDSponsorBrand'
import { vhToPx, evalImage } from '@/utils'
import { intercept, extendObservable } from 'mobx'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject('CommandHostStore', 'GameStore', 'AutomationStore', 'PrePlayStore')
@observer
export default class PlayItemResolved extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      sessionStarted: this.props.GameStore.isSessionStarted,
    })
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'

    this.reference = `play-item-resolved-${this.props.item.id}`
    this.MAIN_CHOICE = this.props.item.multiplierChoices.filter(
      o => o.id === this.props.item.id
    )[0]

    this.destroySessionMode = intercept(
      this.props.GameStore,
      'sessionMode',
      change => {
        this.sessionStarted = change.newValue === 1
        this.forceUpdate()
        return change
      }
    )
  }

  async handleReuseButtonClick(refId) {
    this.props.AutomationStore.addEvent({
      evt: 'click',
      refId: refId,
      wait: 0.5,
      playId: this.props.item.id,
    })
    //this.props.reuse(this.props.item)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0

    let { item } = this.props

    const preItemsByType = await this.props.PrePlayStore.getPresetItemsByType(
      item.type
    )
    const preItemSelected = await preItemsByType.filter(
      o => o.preset.toLowerCase() === item.presetId.toLowerCase()
    )[0]
    const preItemsSelected = await this.props.PrePlayStore.pullMultiplierChoices(
      preItemSelected.id
    )
    const _multiplierChoices = []

    if (preItemSelected) {
      _multiplierChoices.push(preItemSelected)
    }

    if (preItemSelected) {
      for (let i = 0; i < preItemSelected.choices.length; i++) {
        const choice = preItemSelected.choices[i]
        if (choice.nextId) {
          const p_item = await preItemsByType.filter(
            o => o.id === choice.nextId
          )[0]
          if (p_item) {
            _multiplierChoices.push(p_item)
          }
        }
      }
    }

    const reusePlay = {
      type: item.type,
      playTitle: item.playTitle && item.playTitle.value ? item.playTitle : '',
      choices: preItemSelected.choices,
      multiplierChoices: preItemsSelected,
      stars: item.stars,
      award: await this.props.PrePlayStore.AwardList[item.type],
      showNextPlayAd: false,
      nextPlayType: null,
      isPresetTeamChoice: false,
      lockedReuse: false,
      starMax: item.starMax,
      points: item.points,
      tokens: item.tokens,
      participantId: item.participantId,
      presetId: item.presetId,
      sponsor: item.sponsor,
      sponsorId: item.sponsorId,
      team: await this.props.GameStore.participants.filter(
        o => o.id === item.part
      )[0],
      preset: preItemSelected,
    }

    this.props.reuse(reusePlay)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  componentWillUnmount() {
    this.destroySessionMode()
  }

  componentDidMount() {
    delete this.props.item.editorEvents
  }

  render() {
    const automationReuseButtonId = `play-item-resolved-reuse-button-${this.props.item.id}`

    let { item } = this.props

    const isLocked = !this.sessionStarted

    if (item) {
      setTimeout(() => {
        item.lockedReuse = false
      }, 0)
      return (
        <Container>
          <Wrapper>
            <ResolvedIcon />
            <PlayType backgroundColor={PlayColors[item.type]}>
              {item.type}
            </PlayType>
            <SelectTypeLocked>{this.MAIN_CHOICE.preset}</SelectTypeLocked>
            <QuestionInputLocked>
              {this.MAIN_CHOICE.question}
            </QuestionInputLocked>
            <Result>{item.result.resultTitle}</Result>
            <StarWrapper>
              <DDStar
                locked
                item={item}
                height={h}
                index={'playitemresolved-' + item.index}
                value={val => {
                  this.props.item.stars = val
                }}
              />
            </StarWrapper>
            <SponsorBrandWrapper>
              <DDSponsorBrand
                locked
                height={h}
                index={'playitemresolved-' + item.index}
                selectedSponsor={item.sponsor}
                value={val => {
                  item.sponsor = val
                }}
              />
            </SponsorBrandWrapper>
            <PlayAnalyticsButton color={PlayColors[this.props.item.type]} />
            <ReuseButton
              locked={isLocked}
              id={automationReuseButtonId}
              onClick={
                isLocked
                  ? null
                  : this.handleReuseButtonClick.bind(
                      this,
                      automationReuseButtonId
                    )
              }
            />
          </Wrapper>
        </Container>
      )
    } else {
      return <Container />
    }
  }
}

const h = 5
let FONT_SIZE = '1.8vh'

const Container = styled.div`
  width: 100%;
  height: ${props => h}vh;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  opacity: 0;
  animation: ${props => fadeIn} 0.5s forwards;
  margin-top: ${props => 0.2}vh;
`
const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const Wrapper = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: row;
`

const ResolvedIcon = styled.div`
  width: 3%;
  height: inherit;
  background-color: #000000;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${CheckIcon});
    background-repeat: no-repeat;
    background-size: 50%;
    background-position: center;
  }
`

const PlayType = styled.div`
  width: 8%;
  height: inherit;
  background-color: ${props => props.backgroundColor};
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
`

const SelectTypeLocked = styled.div`
  width: 7%;
  height: ${props => h}vh;
  background-color: #e5e5e5;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #000000;
  line-height: 1;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
`

const QuestionInputLocked = styled.div`
  width: 16%;
  height: inherit;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  text-indent: ${props => 1}vh;
  background-color: #ffffff;
  display: flex;
  align-items: center;
`

const Result = styled.div`
  width: 20%;
  height: inherit;
  background-color: #0fbc1c;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
`

const StarWrapper = styled.div`
  width: 2.6%;
  height: ${props => h}vh;
`

const SponsorBrandWrapper = styled.div`
  width: 13%;
  height: ${props => h}vh;
`

const PlayAnalyticsButton = styled.div`
  width: 24%;
  height: inherit;
  color: ${props => props.color || '#c61818'};
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'PLAY ANALYTICS';
  }
`

const ReuseButton = styled.div`
  width: 6.6%;
  height: inherit;
  color: #18c5ff;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  opacity: ${props => (props.locked ? 0.2 : 1)};
  &:before {
    content: 'REUSE';
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    background-image: url(${props => evalImage('reuse.svg')});
    background-repeat: no-repeat;
    background-size: 35%;
    background-position: center;
  }
`
