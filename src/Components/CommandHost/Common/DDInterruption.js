import React, { Component } from 'react'
import styled from 'styled-components'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import InterruptionIcon from '@/assets/images/preplay-interruption-icon.svg'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx } from '@/utils'

const InterruptionItems = [
  {
    value: '',
    text: '',
  },
  {
    value: 't/o',
    text: 'Timeout',
  },
  {
    value: 'flag',
    text: 'Flag',
  },
  {
    value: 'injury',
    text: 'Injury',
  },
  {
    value: 'break',
    text: 'Break',
  },
  {
    value: 'comm',
    text: 'Commercial Break',
  },
  {
    value: 'custom',
    text: 'custom',
  },
]

@inject('PrePlayStore', 'CommandHostStore', 'AutomationStore')
@observer
export default class DDInterruption extends Component {
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

      this.item = val
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

  render() {
    let { index, locked } = this.props
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
            <img style={{ height: '70%' }} src={InterruptionIcon} />
          )}
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[`${this.reference}${index}`] = ref)}
          >
            {this.props.PrePlayStore.interruptPlays &&
            this.props.PrePlayStore.interruptPlays.length > 0
              ? this.props.PrePlayStore.interruptPlays.map((val, idx) => {
                  const headerDropdownInterruptionOptionId = `header-dropdown-interruption-option-${val.name ||
                    'none'}-${this.props.AutomationStore.headerPlaySequence}`
                  return (
                    <OptionItem
                      id={headerDropdownInterruptionOptionId}
                      key={idx}
                      onClick={this.handleOptionItemClick.bind(
                        this,
                        val,
                        headerDropdownInterruptionOptionId
                      )}
                    >
                      <Item>{val.name ? val.name : '-'}</Item>
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
  background-color: #efdf17;
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

const Item = styled.div`
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
    background-color: #efdf17;
  }
`
