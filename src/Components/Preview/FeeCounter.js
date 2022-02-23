import React, { Component } from 'react'
import { TweenMax, TimelineMax } from 'gsap'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled, { keyframes } from 'styled-components'
import PlayAlongIcon from '@/assets/images/playalong-token.svg'
import Arrow from '@/assets/images/icon-arrow.svg'
import { vhToPx } from '@/utils'
let h = 0

@observer
export default class FeeCounter extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    extendObservable(this, {
      currentValue: this.props.currentValue || 10,
      slides: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    })

    this.animationSpeed = this.props.maxAnimationSpeed
  }

  componentDidMount() {
    setTimeout(() => {
      this.props.handleSetFeeCounterValue(this.currentValue)
      if (this[`counter-${this.currentValue}`]) {
        TweenMax.set(this.SlideWrapper, {
          x: -(
            this[`counter-${this.currentValue}`].offsetWidth *
            (this.currentValue - 1)
          ),
        })
      }
    }, 100)
  }

  componentDidUpdate(nextProps) {
    if (this.currentValue < this.props.currentValue) {
      this.currentValue = this.props.currentValue - 1
      this.handleClick('increase', 0.75)
    } else if (this.currentValue > this.props.currentValue) {
      this.currentValue = this.props.currentValue + 1
      this.handleClick('decrease', 0.75)
    } else {
      if (this.currentValue === 0) {
        this.currentValue = 1
      }
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  handleClick(direction, speed) {
    let pos = null
    if (direction === 'increase') {
      if (this.currentValue + 1 <= this.slides.length) {
        this.currentValue += 1
        pos = -(
          this[`counter-${this.currentValue}`].offsetWidth *
          (this.currentValue - 1)
        )
      } else {
        this.currentValue = 1
        pos =
          this[`counter-${this.currentValue}`].offsetWidth *
          (this.currentValue - 1)
        TweenMax.set(this.SlideWrapper, {
          x: this[`counter-${this.currentValue}`].offsetWidth,
        })
      }
    } else if (direction === 'decrease') {
      if (this.currentValue - 1 >= 1) {
        this.currentValue -= 1
        pos = -(
          this[`counter-${this.currentValue}`].offsetWidth *
          (this.currentValue - 1)
        )
      } else {
        this.currentValue = this.slides.length
        pos = -(
          this[`counter-${this.currentValue}`].offsetWidth *
          (this.currentValue - 1)
        )
        TweenMax.set(this.SlideWrapper, {
          x: -(
            this[`counter-${this.currentValue}`].offsetWidth * this.currentValue
          ),
        })
      }
    }

    this.props.handleSetFeeCounterValue(this.currentValue)

    if (!isMobile.any()) {
      if (this.currentValue === 2) {
        pos = pos + 1
      } else if (this.currentValue === 11) {
        pos = pos + 0.5
      } else if (this.currentValue === 4) {
        pos = pos - 1
      } else if (this.currentValue === 5) {
        pos = pos - 1.5
      } else if (this.currentValue === 6) {
        pos = pos + 3
      } else if (this.currentValue === 7) {
        pos = pos - 2
      } else if (this.currentValue === 8) {
        pos = pos - 2
      } else if (this.currentValue === 9) {
        pos = pos - 2.5
      } else if (this.currentValue === 10) {
        pos = pos + 5.5
      }
    }

    TweenMax.to(this.SlideWrapper, speed, { x: pos })
  }

  render() {
    return (
      <RootDiv>
        <DecreaseButton onClick={this.handleClick.bind(this, 'decrease', 0.3)}>
          <ArrowImg src={Arrow} left />
          <Text color={'#ffffff'}>Less</Text>
        </DecreaseButton>
        <Slider red={this.props.red} fadeIn={this.props.fadeIn}>
          <SliderBorder
            red={this.props.red}
            innerRef={c => (this.refSliderBorder = c)}
          >
            <SliderInner red={this.props.red}>
              <Current>
                <SlideWrapper
                  count={this.slides.length}
                  innerRef={ref => (this.SlideWrapper = ref)}
                >
                  {this.slides.map((item, key) => {
                    return (
                      <Slide
                        key={key}
                        innerRef={ref => (this[`counter-${item}`] = ref)}
                      >
                        {item}
                      </Slide>
                    )
                  })}
                </SlideWrapper>
              </Current>
              <CoinContainer>
                <CoinIcon src={PlayAlongIcon} />
              </CoinContainer>
            </SliderInner>
          </SliderBorder>
        </Slider>
        <IncreaseButton onClick={this.handleClick.bind(this, 'increase', 0.3)}>
          <Text color={'#ffffff'}>More</Text>
          <ArrowImg src={Arrow} />
        </IncreaseButton>
      </RootDiv>
    )
  }
}

FeeCounter.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  direction: PropTypes.string,
  currentValue: PropTypes.number,
  maxAnimationSpeed: PropTypes.number,
  maxSlidingDistance: PropTypes.number,
}

const CoinContainer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0%;
  display: flex;
  justify-content: center;
`

const ArrowImg = styled.img`
  height: ${props => vhToPx(h * 0.035)};
  width: ${props => vhToPx(h * 0.035)};
  ${props => (props.left ? 'transform:rotate(180deg);' : '')};
`
const Text = styled.span`
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.02)};
  text-transform: uppercase;
  color: ${props => props.color || 'yellow'};
`

const CoinIcon = styled.img`
  height: ${props => vhToPx(h * 0.026)};
  width: ${props => vhToPx(h * 0.026)};
  z-index: 1;
`

const Slider = styled.div`
  width: ${props => vhToPx(h * 0.13)};
  min-width: ${props => vhToPx(h * 0.13)};
  height: ${props => vhToPx(h * 0.13)};
  min-height: ${props => vhToPx(h * 0.13)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`
const SliderBorder = styled.div`
  width: ${props => vhToPx(h * 0.13)};
  min-width: ${props => vhToPx(h * 0.13)};
  height: ${props => vhToPx(h * 0.13)};
  min-height: ${props => vhToPx(h * 0.13)};
  border-radius: 50%;
  border: ${props => vhToPx(h * 0.01)} solid ${props => props.red || 'rgba(0, 0, 0, 0.3)'};
  display: flex;
  align-items: center;
  justify-content: center;
`
const SliderInner = styled.div`
  height: ${props => vhToPx(h * 0.109)};
  min-height: ${props => vhToPx(h * 0.109)};
  width: ${props => vhToPx(h * 0.109)};
  min-width: ${props => vhToPx(h * 0.109)};
  border-radius: 50%;
  background-color: ${props => (props.red ? '#000000' : 'rgba(0, 0, 0, 0.6)')};
  display: flex;
  align-items: center;
  justify-content: center;
`
const RootDiv = styled.div`
  color: white;
  overflow: hidden;
  //max-width: ${props => vhToPx(96)};
  width: 100%;
  display: flex;
  position: relative;
  height: auto;
  justify-content: space-around;
`

const Current = styled.div`
  width: ${props => vhToPx(h * 0.11)};
  min-width: ${props => vhToPx(h * 0.11)};
  height: ${props => vhToPx(h * 0.11)};
  min-height: ${props => vhToPx(h * 0.11)};
  border-radius: 50%;
  text-align: center;
  //position: relative;
  display: flex;
  align-items: center;

  overflow: hidden;
`

const SlideWrapper = styled.div`
  display: flex;
  align-items: center;
  width: ${props => vhToPx((h * 0.11) * props.count)};
  height: 100%;
  padding-top: 3%;
`

const Slide = styled.div`
  display: inline-block;
  justify-content: center;
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(h * 0.07)};
  color: #ffb600;
  width: ${props => vhToPx(h * 0.11)};
  height: 100%;
`

const DecreaseButton = styled.div`
  cursor: pointer;
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
`
const IncreaseButton = styled.div`
  cursor: pointer;
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i)
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i)
  },
  any: function() {
    return (
      isMobile.Android() ||
      isMobile.BlackBerry() ||
      isMobile.iOS() ||
      isMobile.Opera() ||
      isMobile.Windows()
    )
  },
}
