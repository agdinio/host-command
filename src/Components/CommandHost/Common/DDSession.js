import React, { Component } from 'react'
import styled from 'styled-components'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import SessionIcon from '@/assets/images/preplay-session-icon.svg'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx } from '@/utils'

//const SessionItems = ['', '1q', '2q', 'ht', '3q', '4q', 'ot']

@inject('PrePlayStore', 'CommandHostStore', 'AutomationStore')
@observer
export default class DDSession extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      value: '',
    })
    this.reference = 'session-option-'
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

  handleButtonClick(refId) {
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

    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({
        evt: 'click',
        refId: refId,
        wait: 0.5,
        isIncrementHeaderPlaySequence: true,
      })
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

      this.value = val
      this.props.value(val)
    }

    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({
        evt: 'click',
        refId: refId,
        wait: 0.5,
        isIncrementHeaderPlaySequence: true,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.readonlyValue) {
      if (
        this.props.PrePlayStore.timePeriods &&
        this.props.PrePlayStore.timePeriods.length > 0
      ) {
        this.value = this.props.PrePlayStore.timePeriods.filter(o =>
          o.name.match(new RegExp(nextProps.readonlyValue, 'gi'))
        )[0]
      } else {
        this.value = null
      }
    } else {
      this.value = null
    }
  }

  render() {
    let { index, locked } = this.props
    const headerDropdownSessionSelectId =
      'header-dropdown-session-select-' +
      this.props.AutomationStore.headerPlaySequence

    return (
      <Scrolling>
        <Button
          id={headerDropdownSessionSelectId}
          locked={locked}
          onClick={
            locked
              ? null
              : this.handleButtonClick.bind(this, headerDropdownSessionSelectId)
          }
        >
          {this.value ? (
            this.value.name
          ) : (
            <img style={{ height: '70%' }} src={SessionIcon} />
          )}
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[`${this.reference}${index}`] = ref)}
          >
            {this.props.PrePlayStore.timePeriods &&
            this.props.PrePlayStore.timePeriods.length > 0
              ? this.props.PrePlayStore.timePeriods.map((val, idx) => {
                  const headerDropdownSessionOptionId = `header-dropdown-session-option-${val.name ||
                    'none'}-${this.props.AutomationStore.headerPlaySequence}`
                  return (
                    <OptionItem
                      id={headerDropdownSessionOptionId}
                      key={idx}
                      onClick={this.handleOptionItemClick.bind(
                        this,
                        val,
                        headerDropdownSessionOptionId
                      )}
                    >
                      <SessionItem>{val.name ? val.name : '-'}</SessionItem>
                    </OptionItem>
                  )
                })
              : null}
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
  width: inherit;
`
const OptionItems = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  background-color: #f1f2f2;
  visibility: hidden;
  position: absolute;
  border: ${props => 0.1}vh solid #1e90ff;
  z-index: 1000 !important;
`
const OptionItem = styled.div`
  width: auto;
  height: auto;
  min-height: ${props => h}vh;
`

const SessionItem = styled.div`
  width: 100%;
  height: ${props => h}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  font-color: #000000;
  text-transform: uppercase;
  &:hover {
    background-color: #c61818;
    color: #ffffff;
  }
`
