import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import { vhToPx } from '@/utils'

const FontLabels = {
  pamainlight: 'THIN',
  pamainregular: 'REG',
  pamainbold: 'BOLD',
  pamainextrabold: 'XTRA',
}

const FontList = [
  {
    font: 'pamainlight',
  },
  {
    font: 'pamainregular',
  },
  {
    font: 'pamainbold',
  },
  {
    font: 'pamainextrabold',
  },
]

@inject('CommandHostStore')
@observer
export default class DDFont extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      selItem: null,
    })
    this.reference = 'font-option-'
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

    this.props.clicked()
  }

  handleOptionItemClick(f, area) {
    const option = this[`${this.reference}${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.props.value(f.font, area)
      this.selItem = f
    }
  }

  componentWillMount() {
    this.selItem = FontList[0]
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.defaultFont) {
        const f = FontList.filter(o => o.font === this.props.defaultFont)[0]
        if (f) {
          this.props.value(f.font)
          this.selItem = f
        }
      } else {
        this.selItem = FontList[0]
      }
    }, 0)
  }

  render() {
    let { height, announcement, index, locked, hidden } = this.props

    return (
      <Scrolling hidden={hidden}>
        <Button
          locked={locked}
          height={height}
          font={this.selItem.font}
          onClick={locked ? null : this.handleButtonClick.bind(this)}
        >
          {FontLabels[this.selItem.font]}
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[`${this.reference}${index}`] = ref)}
          >
            {FontList.map((f, idx) => {
              return (
                <OptionItem
                  key={idx}
                  height={height}
                  onClick={this.handleOptionItemClick.bind(
                    this,
                    f,
                    announcement.area
                  )}
                >
                  <FontItem height={height} font={f.font}>
                    {FontLabels[f.font]}
                  </FontItem>
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
  width: ${props => 6}vh;
  display: flex;
  flex-direction: column;
  letter-spacing: ${props => 0.1}vh;
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
`

const Button = styled.div`
  width: ${props => 6}vh;
  height: ${props => props.height}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${props => props.font};
  font-size: ${props => FONT_SIZE};
  font-color: #000000;
  background-color: #ffffff;
  text-decoration: underline;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
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
  z-index: 1000 !important;
`

const OptionItem = styled.div`
  width: auto;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.height}vh;
`

const FontItem = styled.div`
  width: ${props => 6}vh;
  height: ${props => props.height}vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${props => props.font};
  font-size: ${props => FONT_SIZE};
  font-color: #000000;
  text-decoration: underline;
`
