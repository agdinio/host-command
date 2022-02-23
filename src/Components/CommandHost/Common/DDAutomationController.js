import React, { Component } from 'react'
import styled from 'styled-components'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx } from '@/utils'
import ControllerAutomationIcon from '@/assets/images/automation-controller-icon.svg'
import InitPlayAutomationIcon from '@/assets/images/automation-initplay-icon.svg'
import RewindAutomationIcon from '@/assets/images/automation-rewind-icon.svg'
import PauseAutomationIcon from '@/assets/images/automation-pause-icon.svg'
import PlayAutomationIcon from '@/assets/images/automation-play-icon.svg'

@inject('PrePlayStore', 'CommandHostStore', 'AutomationStore')
@observer
export default class DDAutomationController extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      item: '',
    })
    this.reference = 'interruption-option-'
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[`${this.reference}${this.props.index}`]

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

  handleButtonClick() {
    const option = this[`${this.reference}${this.props.index}`]
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

  handleOptionItemClick(val, refId) {
    const option = this[`${this.reference}${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.item = val
      this.props.value(val)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.readonlyValue) {
      if (
        this.props.PrePlayStore.interruptPlays &&
        this.props.PrePlayStore.interruptPlays.length > 0
      ) {
        this.item = this.props.PrePlayStore.interruptPlays.filter(o =>
          o.name.match(new RegExp(nextProps.readonlyValue, 'gi'))
        )[0]
      } else {
        this.item = null
      }
    } else {
      this.item = null
    }
  }

  handleControlClick(automationAction) {
    this.props.control(automationAction)
    if ('restart' === automationAction) {
      this.handleButtonClick()
    }
  }

  render() {
    let { index, locked, baseWidth, AutomationStore } = this.props
    const headerDropdownInterruptionSelectId =
      'header-dropdown-interruption-select' +
      this.props.AutomationStore.headerPlaySequence

    return (
      <Scrolling>
        <Button
          id={headerDropdownInterruptionSelectId}
          locked={locked}
          onClick={
            locked
              ? null
              : this.handleButtonClick.bind(
                  this,
                  headerDropdownInterruptionSelectId
                )
          }
        >
          {this.item ? (
            this.item.name
          ) : (
            <img style={{ height: '70%' }} src={ControllerAutomationIcon} />
          )}
        </Button>
        <Option width={baseWidth * 2 * 4} left={-(baseWidth * 2 * 3.5)}>
          <OptionItems
            height={baseWidth * 2}
            innerRef={ref => (this[`${this.reference}${index}`] = ref)}
          >
            <ControlAutomationImg
              src={InitPlayAutomationIcon}
              imgSize="55"
              borderLeft
              borderRight
              onClick={
                AutomationStore.hasStartedAutomation
                  ? null
                  : this.handleControlClick.bind(this, 'start')
              }
              title="start"
              locked={AutomationStore.hasStartedAutomation}
            />
            <ControlAutomationImg
              src={RewindAutomationIcon}
              imgSize="60"
              borderRight
              onClick={
                !AutomationStore.hasStartedAutomation
                  ? null
                  : this.handleControlClick.bind(this, 'restart')
              }
              title="restart"
              locked={!AutomationStore.hasStartedAutomation}
            />
            <ControlAutomationImg
              src={PauseAutomationIcon}
              imgSize="45"
              borderRight
              onClick={
                AutomationStore.hasPausedAutomation ||
                !AutomationStore.hasStartedAutomation
                  ? null
                  : this.handleControlClick.bind(this, 'pause')
              }
              title="pause"
              locked={
                AutomationStore.hasPausedAutomation ||
                !AutomationStore.hasStartedAutomation
              }
            />
            <ControlAutomationImg
              src={PlayAutomationIcon}
              imgSize="45"
              borderRight
              onClick={
                AutomationStore.hasResumeAutomation
                  ? null
                  : this.handleControlClick.bind(this, 'resume')
              }
              title="resume"
              locked={AutomationStore.hasResumeAutomation}
            />
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const w = 6
const h = 5
let FONT_SIZE = '0vh'

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  letter-spacing: ${props => 0.1}vh;
`

const Button = styled.div`
  width: 100%;
  height: ${props => h}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  font-color: #000000;
  background-color: #f1f2f2;
  text-transform: uppercase;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.4}vh right;
  background-size: ${props => 1.4}vh;
`

const Option = styled.div`
  position: relative;
  width: ${props => props.width}vh;
  left: ${props => props.left}vh;
  margin-top: ${props => 0.1}vh;
`
const OptionItems = styled.div`
  width: inherit;
  //height: ${props => 10}vh;
  height: ${props => props.height}vh;
  display: flex;
  justify-content: space-between;
  background-color: #f1f2f2;
  visibility: hidden;
  position: absolute;
  z-index: 1000 !important;
`

const ControlAutomationImg = styled.div`
  width: 100%;
  height: inherit;
  background-color: #f1f2f2;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  ${props => (props.borderLeft ? `border-left: ${0.2}vh solid #d3d3d3;` : ``)};
  ${props =>
    props.borderRight ? `border-right: ${0.2}vh solid #d3d3d3;` : ``};
  border-top: ${0.2}vh solid #d3d3d3;
  border-bottom: ${0.2}vh solid #d3d3d3;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: ${props => props.imgSize}%;
    background-position: center;
    opacity: ${props => (props.locked ? 0.2 : 1)};
  }

  ${props =>
    props.locked
      ? ``
      : `
      &:hover {
        background-color: #d3d3d3;
      }
    `};
`
