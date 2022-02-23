import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import LockIcon from '@/assets/images/icon-lock-black.svg'
import Team from '@/Components/Common/TeamIcon'
import { vhToPx } from '@/utils'
import _ from 'lodash'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject('CommandHostStore', 'AutomationStore')
@observer
export default class DDTeam extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      selectedTeam: null,
    })

    this.ddTeamSelectId = ''
    this.ddTeamOptionNone = ''
    this.ddTeamOptionId = ''
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[`team-option-${this.props.index}`]

      if (option) {
        let targetElement = evt.target // clicked element

        do {
          if (targetElement == option) {
            // This is a click inside. Do nothing, just return.
            return
          }
          // Go up the DOM
          targetElement = targetElement.parentNode
        } while (targetElement)

        // This is a click outside.
        if (option.classList.contains('open')) {
          option.className = option.className.replace(' open', '')
          TweenMax.to(option, 0.3, { visibility: 'hidden' })
        }
        document.removeEventListener('click', func)
      }
    }

    if (mode === 0) {
      document.removeEventListener('click', func)
    } else {
      document.addEventListener('click', func)
    }
  }

  handleOptionClick(refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
    }

    const option = this[`team-option-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden' })
      } else {
        setTimeout(() => {
          this.initOptionEventListener(1)
          option.className += ' open'
          TweenMax.to(option, 0.3, { visibility: 'visible' })
        }, 0)
      }
    }
  }

  handleOptionItemClick(_selectedTeam, refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
    }

    this.selectedTeam = _selectedTeam

    const option = this[`team-option-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }
    }

    if (this.props.playItemValue) {
      this.props.playItemValue(_selectedTeam)
    } else {
      if (this.props.value) {
        this.props.value(_selectedTeam)
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(prevProps.headerSelectedTeam, this.props.headerSelectedTeam)
    ) {
      this.selectedTeam = this.props.headerSelectedTeam
      if (this.props.playItemValue) {
        this.props.playItemValue(this.props.headerSelectedTeam)
      }
    }

    //IT IS USED TO SEE WHAT OTHER OPERATOR IS DOING DURING PLAY CREATION.
    if (this.props.syncTeamObj && this.props.syncTeamObj.isSync) {
      this.selectedTeam = this.props.syncTeamObj.value
    }
  }

  componentWillMount() {
    if (this.props.item.team && this.props.item.team.teamName) {
      this.selectedTeam = this.props.teams.filter(
        o =>
          o.teamName.trim().toLowerCase() ===
          this.props.item.team.teamName.trim().toLowerCase()
      )[0]
    } else {
      this.selectedTeam = this.props.headerSelectedTeam
    }

    //this.props.value(this.selectedTeam)
  }

  componentDidMount() {
    let { item } = this.props
    if (item) {
      if (item.type) {
        if (item.id) {
          this.ddTeamSelectId = `dropdown-team-select-${item.type}-${item.id}`
          this.ddTeamOptionNone = `dropdown-team-option-${item.type}-${item.id}-0`
        } else {
          this.ddTeamSelectId = `dropdown-team-select-${item.type}-${this.props.AutomationStore.playSequence}`
          this.ddTeamOptionNone = `dropdown-team-option-${item.type}-${this.props.AutomationStore.playSequence}-0`
        }
      } else {
        this.ddTeamSelectId = `dropdown-team-select-${this.props.AutomationStore.playSequence}`
        this.ddTeamOptionNone = `dropdown-team-option-${this.props.AutomationStore.playSequence}-0`
      }
    }
  }

  render() {
    let { item, locked, reference, presetToNone } = this.props
    let ddTeamOptionNone = ''
    // let ddTeamSelectIdx = ''

    // if (item) {
    //   if (item.type) {
    //     if (item.id) {
    //       // this.ddTeamSelectId = `dropdown-team-select-${item.type}-${item.id}`
    //       ddTeamOptionNone = `dropdown-team-option-${item.type}-${item.id}-0`
    //     } else {
    //       // this.ddTeamSelectId = `dropdown-team-select-${item.type}-${this.props.AutomationStore.playSequence}`
    //       ddTeamOptionNone = `dropdown-team-option-${item.type}-${this.props.AutomationStore.playSequence}-0`
    //     }
    //   } else {
    //     // this.ddTeamSelectId = `dropdown-team-select-${this.props.AutomationStore.playSequence}`
    //     ddTeamOptionNone = `dropdown-team-option-${this.props.AutomationStore.playSequence}-0`
    //   }
    // }

    return (
      <Scrolling>
        <Button
          id={this.ddTeamSelectId}
          innerRef={reference}
          height={this.props.height}
          locked={locked}
          onClick={
            locked
              ? null
              : this.handleOptionClick.bind(this, this.ddTeamSelectId)
          }
        >
          {this.selectedTeam && !presetToNone ? (
            <AvailTeam>
              <TeamLabel>{this.selectedTeam.teamName}</TeamLabel>
              <TeamCircleWrapper>
                <Team
                  teamInfo={this.selectedTeam}
                  size={3}
                  abbrSize={1.8}
                  outsideBorderColor={'#000000'}
                />
              </TeamCircleWrapper>
            </AvailTeam>
          ) : (
            <NoTeam height={this.props.height} withLock={presetToNone} />
          )}
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[`team-option-${this.props.index}`] = ref)}
          >
            <OptionItem key={-1}>
              <NoTeam
                // id={this.ddTeamOptionNone}
                height={this.props.height}
                backgroundColor={PlayColors[item.type]}
                onClick={this.handleOptionItemClick.bind(
                  this,
                  null,
                  this.ddTeamOptionNone
                )}
              />
            </OptionItem>
            {this.props.teams.map((t, idx) => {
              this.ddTeamOptionId = `dropdown-team-option-${idx + 1}-${
                item.id ? item.type + '-' + item.id : item.type
              }-${this.props.AutomationStore.headerPlaySequence}`
              return (
                <OptionItem key={idx}>
                  <TeamOptionWrapper
                    id={this.ddTeamOptionId}
                    height={this.props.height}
                    backgroundColor={PlayColors[item.type]}
                    onClick={this.handleOptionItemClick.bind(
                      this,
                      t,
                      this.ddTeamOptionId
                    )}
                  >
                    <TeamLabel>{t.teamName}</TeamLabel>
                    <TeamCircleWrapper>
                      <Team
                        teamInfo={t}
                        size={3}
                        abbrSize={1.8}
                        outsideBorderColor={'#000000'}
                      />
                    </TeamCircleWrapper>
                  </TeamOptionWrapper>
                </OptionItem>
              )
            })}
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

let FONT_SIZE = '1.8vh'

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  letter-spacing: ${props => 0.1}vh;
`

const Button = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  background-color: #ffffff;
  display: flex;
  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`
const AvailTeam = styled.div`
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const NoTeam = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  display: flex;
  align-items: center;
  padding-left: 10%;
  &:hover {
    background-color: ${props => props.backgroundColor};
  }
  &:before {
    content: 'NONE';
    margin-left: ${props => (props.withLock ? 2 : 0)}vh;
  }
  &:after {
    width: inherit;
    height: ${props => props.height}vh;
    content: '';
    display: inline-block;
    background-image: url(${props => (props.withLock ? LockIcon : '')});
    background-repeat: no-repeat;
    background-size: 30%;
    background-position: center;
  }
`
const TeamOptionWrapper = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color: ${props => props.backgroundColor};
  }
`
const TeamLabel = styled.div`
  width: 100%;
  height: inherit;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10%;
`
const TeamCircleWrapper = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 10%;
`

const Option = styled.div`
  width: inherit;
`
const OptionItems = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  visibility: hidden;
  position: absolute;
  border: 0.1vh solid #1e90ff;
  z-index: 1000 !important;
`
const OptionItem = styled.div`
  width: auto;
  height: auto;
  min-height: ${props => props.height}vh;
`
