import React, { Component } from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import StarIconDark from '@/assets/images/star-icon-dark.svg'
import { vhToPx } from '@/utils'

@inject('AutomationStore')
@observer
export default class DDStar extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selectedStar: 0,
    })

    this.dropdownStarSelectId = ''
    this.dropdownStarOptionIdNone = ''
    this.dropdownStarOptionIdSingle = ''
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[`star-option-base-${this.props.index}`]

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

  handleStarClick(refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
    }

    const option = this[`star-option-base-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      } else {
        setTimeout(() => {
          this.initOptionEventListener(1)
          option.className += ' open'
          TweenMax.to(option, 0.3, { visibility: 'visible', zIndex: 1000 })
        }, 0)
      }
    }
  }

  handleOptionItemClick(multiplier, refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
    }

    this.selectedStar = multiplier
    this.props.value(multiplier)

    const option = this[`star-option-base-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }
    }
  }

  handleSingle(refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({
        evt: 'click',
        refId: this.dropdownStarSelectId,
        wait: 0.5,
        doNotSave: true,
      })
      this.props.automationAddEvent({ evt: 'click', refId: refId, wait: 0.5 })
    }

    const single = this[`star-single-${this.props.index}`]
    if (single) {
      if (this.selectedStar) {
        TweenMax.set(single, { opacity: 0.2, filter: 'grayscale(1)' })
        this.selectedStar = 0
        this.props.value(0)
      } else {
        TweenMax.set(single, { opacity: 1, filter: 'grayscale(0)' })
        this.selectedStar = 1
        this.props.value(1)
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.initStarVal) {
      this.selectedStar = 0
    }

    //IT IS USED TO SEE WHAT OTHER OPERATOR IS DOING DURING PLAY CREATION.
    // if (this.props.syncStarObj && this.props.syncStarObj.isSync) {
    //   if (this.props.item.starMax > 1) {
    //     this.selectedStar = this.props.syncStarObj.value
    //   } else {
    //     const single = document.querySelector('.dd-star-single')
    //     if (single) {
    //       if (this.props.syncStarObj.value) {
    //         TweenMax.set(single, { opacity: 1, filter: 'grayscale(0)' })
    //       } else {
    //         TweenMax.set(single, { opacity: 0.2, filter: 'grayscale(1)' })
    //       }
    //     }
    //   }
    // }
  }

  componentDidMount() {
    let { item } = this.props

    if (item) {
      if (item.type) {
        if (item.id) {
          this.dropdownStarSelectId = `dropdown-star-select-${item.type}-${item.id}`
          this.dropdownStarOptionIdNone = `dropdown-star-option-${item.type}-${item.id}-0`
          this.dropdownStarOptionIdSingle = `dropdown-star-option-${item.type}-${item.id}-1`
        } else {
          this.dropdownStarSelectId = `dropdown-star-select-${item.type}-${this.props.AutomationStore.playSequence}`
          this.dropdownStarOptionIdNone = `dropdown-star-option-${item.type}-${this.props.AutomationStore.playSequence}-0`
          this.dropdownStarOptionIdSingle = `dropdown-star-option-${item.type}-${this.props.AutomationStore.playSequence}-1`
        }
      } else {
        this.dropdownStarSelectId = `dropdown-star-select-${this.props.AutomationStore.playSequence}`
        this.dropdownStarOptionIdNone = `dropdown-star-option-${this.props.AutomationStore.playSequence}-0`
        this.dropdownStarOptionIdSingle = `dropdown-star-option-${this.props.AutomationStore.playSequence}-1`
      }
    }

    if ('LIVEPLAY' === item.type.toUpperCase()) {
      if (item.multiplierChoices && item.multiplierChoices.length === 1) {
        this.selectedStar = item.stars
        const single = this[`star-single-${this.props.index}`]
        if (single) {
          if (item.stars > 0) {
            TweenMax.set(single, { opacity: 1, filter: 'grayscale(0)' })
          } else {
            TweenMax.set(single, { opacity: 0.2, filter: 'grayscale(1)' })
          }
        }
      } else {
        this.selectedStar = item.stars
      }
    } else {
      const single = this[`star-single-${this.props.index}`]
      if ('PRIZE' === item.type.toUpperCase()) {
        if (single) {
          TweenMax.set(single, { opacity: 1, filter: 'grayscale(0)' })
        }
        item.stars = 1
        //this.props.value(1)
        this.selectedStar = 1
      } else {
        if (single) {
          if (item.stars > 0) {
            TweenMax.set(single, { opacity: 1, filter: 'grayscale(0)' })
          } else {
            TweenMax.set(single, { opacity: 0.2, filter: 'grayscale(1)' })
          }
        }
      }
    }
  }

  render() {
    let { item, locked } = this.props

    if (item.starMax > 1) {
      return (
        <Scrolling>
          <StarButton
            id={this.dropdownStarSelectId}
            locked={locked}
            height={this.props.height}
            innerRef={ref => (this[`star-selected-${this.props.index}`] = ref)}
            multiplier={this.selectedStar}
            onClick={
              locked
                ? null
                : this.handleStarClick.bind(this, this.dropdownStarSelectId)
            }
          >
            {this.selectedStar > 1 ? `${this.selectedStar}x` : null}
          </StarButton>
          <Option>
            <OptionItems
              innerRef={ref =>
                (this[`star-option-base-${this.props.index}`] = ref)
              }
            >
              <OptionItem
                id={this.dropdownStarOptionIdNone}
                height={this.props.height}
                innerRef={ref =>
                  (this[`star-option-${this.props.index}-0`] = ref)
                }
                onClick={this.handleOptionItemClick.bind(
                  this,
                  0,
                  this.dropdownStarOptionIdNone
                )}
              >
                0
              </OptionItem>
              {[...Array(item.starMax)].map((e, i) => {
                let dropdownStarOptionId = ''
                if (item) {
                  if (item.type) {
                    if (item.id) {
                      dropdownStarOptionId = `dropdown-star-option-${
                        item.type
                      }-${item.id}-${i + 1}`
                    } else {
                      dropdownStarOptionId = `dropdown-star-option-${
                        item.type
                      }-${this.props.AutomationStore.playSequence}-${i + 1}`
                    }
                  } else {
                    dropdownStarOptionId = `dropdown-star-option-${
                      this.props.AutomationStore.playSequence
                    }-${i + 1}`
                  }
                }
                if (i < 3) {
                  return (
                    <OptionItem
                      id={dropdownStarOptionId}
                      key={i + 1}
                      height={this.props.height}
                      innerRef={ref =>
                        (this[`star-option-${this.props.index}-${i + 1}`] = ref)
                      }
                      onClick={this.handleOptionItemClick.bind(
                        this,
                        i + 1,
                        dropdownStarOptionId
                      )}
                    >
                      {i + 1}x
                    </OptionItem>
                  )
                }
              })}
            </OptionItems>
          </Option>
        </Scrolling>
      )
    } else {
      return (
        <Scrolling>
          <StarButtonSingle
            id={this.dropdownStarOptionIdSingle}
            className="dd-star-single"
            locked={'PRIZE' === item.type.toUpperCase() || locked}
            height={this.props.height}
            innerRef={ref => (this[`star-single-${this.props.index}`] = ref)}
            onClick={
              'PRIZE' === item.type.toUpperCase() || locked
                ? null
                : this.handleSingle.bind(this, this.dropdownStarOptionIdSingle)
            }
          />
        </Scrolling>
      )
    }
  }
}

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`

const StarButton = styled.div`
  width: ${props => props.height}vh;
  height: ${props => props.height}vh;
  background-color: #efdf17;
  -webkit-filter: ${props =>
    props.multiplier ? 'grayscale(0)' : 'grayscale(1)'};
  opacity: ${props => (props.multiplier ? 1 : 0.2)};
  background-image: url(${StarIconDark});
  background-repeat: no-repeat;
  background-size: 75%;
  background-position: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainregular;
  font-size: ${props => 0.4 * props.height}vh;
  color: #ffffff;
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
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => 0.5 * props.height}vh;
  color: #000000;
  &:hover {
    background-color: #efdf17;
  }
`

const StarButtonSingle = styled.div`
  width: ${props => props.height}vh;
  height: ${props => props.height}vh;
  background-color: #efdf17;
  -webkit-filter: grayscale(1);
  opacity: 0.2;
  background-image: url(${StarIconDark});
  background-repeat: no-repeat;
  background-size: 75%;
  background-position: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`
