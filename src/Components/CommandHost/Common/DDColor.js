import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import { vhToPx } from '@/utils'

const ColorList = [
  {
    color: '#000000',
    default: true,
    defaultColor: '#e6e7e8',
  },
  {
    color: '#17c4fe',
  },
  {
    color: '#ffb600',
  },
  {
    color: '#efdf17',
  },
  {
    color: '#c61818',
  },
  {
    color: '#0fbc1c',
  },
]

@observer
export default class DDColor extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selItem: null,
    })
    this.reference = 'color-option-'
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

  handleOptionItemClick(c, area) {
    const option = this[`${this.reference}${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.props.value(c.color, area)
      this.selItem = c
    }
  }

  componentWillMount() {
    this.selItem = ColorList.filter(o => o.default)[0]
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.defaultColor) {
        const c = ColorList.filter(o => o.color === this.props.defaultColor)[0]
        if (c) {
          this.props.value(c.color, this.props.announcement.area)
          this.selItem = c
        }
      } else {
        this.selItem = ColorList.filter(o => o.default)[0]
      }
    }, 0)
  }

  render() {
    let { height, index, announcement, locked, hidden } = this.props

    return (
      <Scrolling hidden={hidden}>
        <Button
          locked={locked}
          height={height}
          default={this.selItem.default}
          backgroundColor={
            this.selItem.default
              ? this.selItem.defaultColor
              : this.selItem.color
          }
          onClick={locked ? null : this.handleButtonClick.bind(this)}
        >
          <VerticalLine default={this.selItem.default} />
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[`${this.reference}${index}`] = ref)}
          >
            {ColorList.map((c, idx) => {
              return (
                <OptionItem
                  key={idx}
                  height={height}
                  onClick={this.handleOptionItemClick.bind(
                    this,
                    c,
                    announcement.area
                  )}
                >
                  <ColorItem height={height} backgroundColor={c.color} />
                </OptionItem>
              )
            })}
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const Scrolling = styled.div`
  width: ${props => 5}vh;
  display: flex;
  flex-direction: column;
  letter-spacing: ${props => 0.1}vh;
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
`

const Button = styled.div`
  width: ${props => 5}vh;
  height: ${props => props.height}vh;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  overflow: hidden;

  &:after {
    width: ${props => 2.1}vh;
    height: ${props => 2.1}vh;
    content: '';
    display: inline-block;
    background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
    background-repeat: no-repeat;
    background-position: right ${props => -0.5}vh;
    background-size: contain;
    transform: rotate(135deg);
  }
`

const VerticalLine = styled.div`
  width: ${props => 0.4}vh;
  height: ${props => 8}vh;
  ${props => (props.default ? 'background-color:#bcbec0' : '')};
  transform: rotate(44deg);
  margin-bottom: ${props => -1.4}vh;
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

const ColorItem = styled.div`
  width: ${props => 5}vh;
  height: ${props => props.height}vh;
  background-color: ${props => props.backgroundColor};
`
