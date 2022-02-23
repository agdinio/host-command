import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import { vhToPx, evalImage } from '@/utils'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject('CommandHostStore', 'PrePlayStore')
@observer
export default class DDAward extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      typeItem: null,
      selItem: null,
    })
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[`award-option-${this.props.index}`]

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

  handleOptionClick() {
    const option = this[`award-option-${this.props.index}`]
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

  handleOptionItemClick(val) {
    this.selItem = this.typeItem.awards.filter(
      o =>
        o.value.trim().toLocaleLowerCase() ===
        val.value.trim().toLocaleLowerCase()
    )[0]

    const option = this[`award-option-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }
    }

    this.props.value(val)
  }

  componentWillMount() {
    this.typeItem = this.props.PrePlayStore.AwardList[this.props.item.type]

    this.selItem = this.typeItem.awards.filter(
      o => o.value === this.props.item.award
    )[0]
    if (!this.selItem) {
      this.selItem = this.typeItem.awards.filter(o => o.init)[0]
    }
    this.props.initValue(this.selItem)
  }

  render() {
    let { locked } = this.props

    return (
      <Scrolling>
        <AwardButton
          height={this.props.height}
          backgroundColor={this.selItem.bg}
          locked={locked || this.selItem.isLocked}
          onClick={
            locked
              ? null
              : this.selItem.isLocked
              ? null
              : this.handleOptionClick.bind(this)
          }
        >
          <AwardLabel color={this.selItem.c} locked={this.selItem.isLocked}>
            {this.selItem.value}
          </AwardLabel>
          {this.selItem.isLocked ? (
            <AwardLock src={evalImage(this.typeItem.lockIcon)} />
          ) : null}
        </AwardButton>
        <Option>
          <OptionItems
            innerRef={ref => (this[`award-option-${this.props.index}`] = ref)}
          >
            {this.typeItem.awards.map((award, idx) => {
              return (
                <OptionItem
                  key={idx}
                  height={this.props.height}
                  onClick={this.handleOptionItemClick.bind(this, award)}
                >
                  <AwardItem
                    height={this.props.height}
                    backgroundColor={this.typeItem.backgroundColor}
                  >
                    {award.value}
                  </AwardItem>
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
  background: green;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  letter-spacing: ${props => 0.1}vh;
`

const AwardButton = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  background-color: ${props => props.backgroundColor || '#ffffff'};
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`
const AwardLabel = styled.div`
  width: 100%;
  height: 100%;
  color: ${props => props.color};
  text-transform: uppercase;
  display: flex;
  justify-content: center
  align-items: center;

`

const AwardLock = styled.div`
  width: ${props => 3}vh;
  height: ${props => 3}vh;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: center;
  margin-right: 20%;
`

const PlayMode = styled.div`
  width: inherit;
  height: inherit;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: 'PLAY';
    margin-left: ${props => 2}vh;
  }
  &:after {
    width: inherit;
    height: inherit;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 40%;
    background-position: center;
  }
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
  border: ${props => 0.1}vh solid #1e90ff;
  z-index: 1000 !important;
`
const OptionItem = styled.div`
  width: auto;
  height: auto;
  min-height: ${props => props.height}vh;
`
const AwardItem = styled.div`
  width: 100%;
  height: ${props => props.height}vh;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  text-indent: ${props => 1}vh;
  &:hover {
    background-color: ${props => props.backgroundColor};
  }
`
