import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import Star6Icon from '@/assets/images/preplay-sponsor-star6.svg'
import { vhToPx, hex2rgb } from '@/utils'
import deepEqual from 'deep-equal'
import '@/styles/sponsor-dropdown.css'
import SponsorItem from '@/Components/CommandHost/Common/SponsorItem'

const SponsorItemsDELETE = [
  {
    name: 'sponsor papa',
    initial: 'p',
    initialColor: '#383644',
    backgroundColor: '#b2cbce',
    circleBorderColor: '#91a5c1',
    count: 10,
  },
  {
    name: 'sponsor bravo',
    initial: 'b',
    initialColor: '#3f2919',
    backgroundColor: '#e2a069',
    circleBorderColor: '#7c4724',
    count: 2,
  },
  {
    name: 'sponsor sierra',
    initial: 's',
    initialColor: '#4c4c4c',
    backgroundColor: '#bababa',
    circleBorderColor: '#999999',
    count: 5,
  },
  {
    name: 'sponsor golf',
    initial: 'g',
    initialColor: '#754b00',
    backgroundColor: '#ffde9c',
    circleBorderColor: '#f4a300',
    count: 4,
  },
]

@inject('PrePlayStore', 'CommandHostStore', 'AutomationStore')
@observer
export default class DDSponsorBrand extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      selectedItem: null,
      sponsors: this.props.PrePlayStore.sponsors,
      sportTypeNoHover: false,
    })
    this.reference = 'sponsor-option-'

    intercept(this.props.PrePlayStore, 'sponsors', change => {
      if (this.props.isHeader) {
        if (change.newValue) {
          this.sponsors = change.newValue
        }
      }
      return change
    })

    this.dropdownSelectId = ''
    this.dropdownOptionId = ''
    this.dropdownSponsorCategory = ''
    this.dropdownSponsorItem = ''
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

  handleSponsorBrandClick(refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({
        evt: 'click',
        refId: refId,
        wait: 0.5,
        isIncrementHeaderPlaySequence: refId.includes('header'),
      })
    }

    this.toggleSponsorOpenClose()

    /**
     * UNCOMMENT THIS
     * IF YOU DON'T WANT TO USE HOVER

     for (let i=0; i<this.sponsors.length; i++) {
      this[`refSponsorCategory-${i}`].querySelector('ul').style.display = 'none'
    }
     **/
  }

  handleOptionItemClick_(val, refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({
        evt: 'click',
        refId: refId,
        wait: 0.5,
        isIncrementHeaderPlaySequence: refId.includes('header'),
      })
    }

    const option = this[`${this.reference}${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.selectedItem = val
      this.props.value(val)
    }
  }

  handleCategoryClick(category, idx, refId) {
    if (this.props.automationAddEvent) {
      this.props.automationAddEvent({
        evt: 'click',
        refId: refId,
        wait: 0.5,
        isIncrementHeaderPlaySequence: refId.includes('header'),
      })
    }

    /**
     * UNCOMMENT THIS
     * IF YOU DON'T WANT TO USE HOVER

     for (let i=0; i<this.sponsors.length; i++) {
      if (idx === i) {
        this[`refSponsorCategory-${i}`].querySelector('ul').style.display = 'inherit'
      } else {
        this[`refSponsorCategory-${i}`].querySelector('ul').style.display = 'none'
      }
    }
     this.selectedItem = {sponsorCategory: category, sponsorItem: null}

     */
  }

  handleSponsorItemClick(cat, brand, refId) {
    // if (this.props.automationAddEvent) {
    //   this.props.automationAddEvent({
    //     evt: 'click',
    //     refId: refId,
    //     wait: 0.5,
    //     isIncrementHeaderPlaySequence: refId.includes('header'),
    //   })
    // }

    this.toggleSponsorOpenClose()
    this.selectedItem = { sponsorCategory: cat, sponsorItem: brand }
    this.props.value(this.selectedItem)

    /**
     * COMMENT THIS
     * IF YOU DON'T WANT TO USE HOVER
     */
    this.sportTypeNoHover = true
    setTimeout(() => (this.sportTypeNoHover = false), 500)
  }

  toggleSponsorOpenClose() {
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

  componentDidUpdate(prevProps) {
    if (!deepEqual(prevProps.selectedSponsor, this.props.selectedSponsor)) {
      if (this.props.selectedSponsor && this.props.selectedSponsor.name) {
        this.selectedItem = this.props.selectedSponsor
      }
    }

    // if (prevProps.selectedSponsor !== this.props.selectedSponsor) {
    //   if (this.props.selectedSponsor && this.props.selectedSponsor.name) {
    //     //TODO
    //   }
    // }

    //IT IS USED TO SEE WHAT OTHER OPERATOR IS DOING DURING PLAY CREATION.
    if (this.props.syncSponsorObj && this.props.syncSponsorObj.isSync) {
      this.selectedItem = this.props.syncSponsorObj.value
    }
  }

  componentWillMount() {
    if (
      this.props.selectedSponsor &&
      this.props.selectedSponsor.sponsorItem &&
      this.props.selectedSponsor.sponsorItem.brandId
    ) {
      this.selectedItem = this.props.selectedSponsor
      if (this.props.isPlayItem) {
        this.props.value(this.selectedItem)
      }
    } else {
      //this.selectedItem = this.sponsors[0]
    }

    //this.props.value(this.selectedItem)
  }

  componentDidMount() {
    let { item } = this.props
    if (item) {
      if (item.type) {
        if (item.id) {
          this.dropdownSelectId = `dropdown-sponsor-select-${item.type}-${item.id}`
        } else {
          this.dropdownSelectId = `dropdown-sponsor-select-${item.type}-${this.props.AutomationStore.playSequence}`
        }
      } else {
        this.dropdownSelectId = `dropdown-sponsor-select-${this.props.AutomationStore.playSequence}`
      }
    } else {
      this.dropdownSelectId = `header-dropdown-sponsor-select-${this.props.AutomationStore.headerPlaySequence}`
    }
  }

  render() {
    let { item, locked } = this.props

    // if (item) {
    //   if (item.type) {
    //     if (item.id) {
    //       dropdownSelectId = `dropdown-sponsor-select-${item.type}-${item.id}`
    //     } else {
    //       dropdownSelectId = `dropdown-sponsor-select-${item.type}-${this.props.AutomationStore.playSequence}`
    //     }
    //   } else {
    //     dropdownSelectId = `dropdown-sponsor-select-${this.props.AutomationStore.playSequence}`
    //   }
    // } else {
    //   dropdownSelectId = `header-dropdown-sponsor-select-${this.props.AutomationStore.headerPlaySequence}`
    // }

    return (
      <Scrolling>
        {!this.selectedItem ? (
          <Button
            id={this.dropdownSelectId}
            locked={locked}
            height={this.props.height}
            onClick={
              locked
                ? null
                : this.handleSponsorBrandClick.bind(this, this.dropdownSelectId)
            }
          >
            <ItemName>{'BRAND PACKS'}</ItemName>
            <EmptyBrandCircle />
            <EmptyBrandCount></EmptyBrandCount>
          </Button>
        ) : this.selectedItem.sponsorItem ? (
          /*
            <Button
              id={dropdownSelectId}
              locked={locked}
              height={this.props.height}
              backgroundColor={this.selectedItem.backgroundColor}
              onClick={
                locked
                  ? null
                  : this.handleSponsorBrandClick.bind(this, dropdownSelectId)
              }
            >
            <ItemName>{this.selectedItem.name}</ItemName>
            <CircleWrapper>
              <ItemOuterBorderCircle
                borderColor={this.selectedItem.circleBorderColor}
                circleFill={this.selectedItem.circleFill}
                color={this.selectedItem.initialColor}
                text={this.selectedItem.initial}
                height={this.props.height}
              />
            </CircleWrapper>
            <CountWrapper>
              <Count>{this.selectedItem.count}</Count>
            </CountWrapper>
            </Button>
*/

          <Button
            id={this.dropdownSelectId}
            locked={locked}
            height={this.props.height}
            backgroundColor={this.selectedItem.sponsorCategory.backgroundColor}
            onClick={
              locked
                ? null
                : this.handleSponsorBrandClick.bind(this, this.dropdownSelectId)
            }
          >
            <SponsorItem
              locked={locked}
              hasBorderBottom={false}
              item={this.selectedItem.sponsorItem}
              //backgroundColor={this.selectedItem.sponsorCategory.backgroundColor}
              //refClick={this.handleSponsorItemClick.bind(this, cat, brand, `${dropdownSponsorItem}-${brand.brandId}`)}
            />
          </Button>
        ) : null}

        <Option>
          <OptionItems
            innerRef={ref =>
              (this[`${this.reference}${this.props.index}`] = ref)
            }
          >
            <nav>
              <ul>
                {this.sponsors.map((cat, idx) => {
                  //let dropdownSponsorItem = ''
                  if (item) {
                    if (item.type) {
                      if (item.id) {
                        this.dropdownOptionId = `dropdown-sponsor-option-${item.type}-${item.id}-${cat.id}`
                        this.dropdownSponsorCategory = `dropdown-sponsor-category-${item.type}-${item.id}-${cat.id}`
                        this.dropdownSponsorItem = `dropdown-sponsor-item-${item.type}-${item.id}-${cat.id}`
                      } else {
                        this.dropdownOptionId = `dropdown-sponsor-option-${item.type}-${this.props.AutomationStore.playSequence}-${cat.id}`
                        this.dropdownSponsorCategory = `dropdown-sponsor-category-${item.type}-${this.props.AutomationStore.playSequence}-${cat.id}`
                        this.dropdownSponsorItem = `dropdown-sponsor-item-${item.type}-${this.props.AutomationStore.playSequence}-${cat.id}`
                      }
                    } else {
                      this.dropdownOptionId = `dropdown-sponsor-option-${this.props.AutomationStore.playSequence}-${cat.id}`
                      this.dropdownSponsorCategory = `dropdown-sponsor-category-${this.props.AutomationStore.playSequence}-${cat.id}`
                      this.dropdownSponsorItem = `dropdown-sponsor-item-${this.props.AutomationStore.playSequence}-${cat.id}`
                    }
                  } else {
                    this.dropdownOptionId = `header-dropdown-sponsor-option-${this.props.AutomationStore.headerPlaySequence}-${cat.id}`
                    this.dropdownSponsorCategory = `dropdown-sponsor-category-${this.props.AutomationStore.headerPlaySequence}-${cat.id}`
                    this.dropdownSponsorItem = `dropdown-sponsor-item-${this.props.AutomationStore.headerPlaySequence}-${cat.id}`
                  }

                  return (
                    <li
                      key={`li-sponsor-category-${idx}`}
                      //id={dropdownSponsorCategory}
                      ref={ref => (this[`refSponsorCategory-${idx}`] = ref)}
                      //onClick={this.handleCategoryClick.bind(this, idx, dropdownSponsorCategory)}
                      className={this.sportTypeNoHover ? 'nohover' : ''}
                    >
                      <OptionItem
                        id={this.dropdownOptionId}
                        // onClick={this.handleOptionItemClick.bind(
                        //   this,
                        //   cat,
                        //   dropdownOptionId
                        // )}
                        onClick={this.handleCategoryClick.bind(
                          this,
                          cat,
                          idx,
                          this.dropdownOptionId
                        )}
                      >
                        <Item
                          height={this.props.height}
                          text={cat.name}
                          backgroundColor={cat.backgroundColor}
                        >
                          <ItemName>{cat.name}</ItemName>
                          <CircleWrapper>
                            <ItemOuterBorderCircle
                              borderColor={cat.circleBorderColor}
                              circleFill={cat.circleFill}
                              color={cat.initialColor}
                              text={cat.initial}
                              height={this.props.height}
                            />
                          </CircleWrapper>
                          <CountWrapper>
                            <Count>{cat.count}</Count>
                          </CountWrapper>
                        </Item>
                      </OptionItem>

                      <ul ref={ref => (this[`refSponsortItems-${idx}`] = ref)}>
                        {(cat.brands || []).map((brand, idx) => {
                          if (brand && brand.brandId) {
                            const _cat = { ...cat }
                            delete _cat.brands
                            return (
                              <li
                                key={`li-sponsor-brand-${this.dropdownSponsorItem}-${brand.brandId}`}
                                style={{
                                  width: '100%',
                                  height: this.props.height + 'vh',
                                  left: '100%',
                                  top: '-5vh',
                                }}
                              >
                                <SponsorItem
                                  hasBorderBottom={
                                    idx < cat.brands.length - 1 ? true : false
                                  }
                                  item={brand}
                                  backgroundColor={_cat.backgroundColor}
                                  id={`${this.dropdownSponsorItem}-${brand.brandId}`}
                                  refClick={this.handleSponsorItemClick.bind(
                                    this,
                                    _cat,
                                    brand,
                                    `${this.dropdownSponsorItem}-${brand.brandId}`
                                  )}
                                />
                              </li>
                            )
                          } else {
                            return null
                          }
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

let FONT_SIZE = '0vh'

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`

const Button = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: black;
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${props => 1.5}vh;

  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`

const EmptyBrandCircle = styled.div`
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '';
    display: inline-block;
    width: ${props => 4}vh;
    height: ${props => 4}vh;
    border-radius: 50%;
    background-color: #000000;
  }
`
const EmptyBrandCount = styled.div`
  width: 25%;
  font-family: pamainbold;
  font-size: ${props => 2}vh;
  color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
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
  width: 100%;
  height: ${props => props.height}vh;
  min-height: ${props => props.height}vh;
  position: relative;
  cursor: pointer;
`

const Item = styled.div`
  width: inherit;
  height: ${props => props.height}vh;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: black;
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${props => 1.5}vh;
  &:hover {
    background-color: ${props => hex2rgb(props.backgroundColor, 0.5)};
  }
`

const ItemName = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const CircleWrapper = styled.div`
  width: 30%;
`
const ItemOuterBorderCircle = styled.div`
  width: ${props => vhToPx(4.3)};
  height: ${props => vhToPx(4.3)};
  border-radius: 50%;
  border: ${props => vhToPx(0.3)} solid #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => 0.3}vh solid ${props => props.borderColor};
    background-color: ${props => props.circleFill};
/*
    background-image: url(${Star6Icon});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
*/
  }

  &:after {
    position: absolute;
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => 0.8 * props.height}vh;
    text-transform: uppercase;
    color: ${props => props.color};
    padding-top: ${props => 0.2}vh;
  }
`

const CountWrapper = styled.div`
  width: 25%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`
const Count = styled.div`
  font-family: pamainregular;
  font-size: ${props => 2}vh;
  color: #000000;
  font-weight: bold;
`
