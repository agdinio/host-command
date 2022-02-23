import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import Star6Icon from '@/assets/images/preplay-sponsor-star6.svg'
import { vhToPx, hex2rgb } from '@/utils'
import '@/styles/sponsor-dropdown.css'
import SponsorItem from '@/Components/CommandHost/Common/SponsorItem'

@inject('PrePlayStore', 'AutomationStore')
@observer
export default class DDAnnounceSponsor extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selectedItem: null,
      sponsors: this.props.PrePlayStore.sponsors,
      sportTypeNoHover: false,
    })
    this.reference = 'announce-sponsor-option-'

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
        TweenMax.to(option, 0.3, { visibility: 'hidden' })
        document.removeEventListener('click', func)
        if (!this.selectedItem) {
          this.props.value(null)
        }
      }
    }

    if (mode === 0) {
      document.removeEventListener('click', func)
    } else {
      document.addEventListener('click', func)
    }
  }

  handleExpanded(expanded) {
    const option = this[`${this.reference}${this.props.index}`]

    if (expanded) {
      if (option) {
        setTimeout(() => {
          this.initOptionEventListener(1)
          option.className += ' open' //added 050312021
          TweenMax.to(option, 0.3, { visibility: 'visible' })
        }, 0)
      }
    } else {
      if (option) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '') //added 050312021
        TweenMax.to(option, 0.3, { visibility: 'hidden' })
      }
    }
  }

  handleOptionItemClick(val, refId, strToReplace) {
    const option = this[`${this.reference}${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.selectedItem = val
      this.props.value(val, refId, strToReplace)
    }
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

  componentWillReceiveProps(nextProps) {
    this.handleExpanded(nextProps.expanded)
  }

  componentWillMount() {
    if (this.props.selectedSponsor) {
      this.selectedItem = this.props.selectedSponsor
    } else {
      this.selectedItem = null
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
    let { locked, forId, item } = this.props

    const optionIdNone = `${forId}-brand-option-0`

    return (
      <Scrolling>
        {!this.selectedItem ? (
          <Button
            locked={locked}
            height={this.props.height}
            onClick={this.handleSponsorBrandClick.bind(
              this,
              this.dropdownSelectId
            )}
          >
            <ItemName>{'NONE'}</ItemName>
          </Button>
        ) : this.selectedItem.sponsorItem ? (
          <Button
            locked={locked}
            height={this.props.height}
            backgroundColor={this.selectedItem.sponsorCategory.backgroundColor}
            onClick={
              locked
                ? null
                : this.handleSponsorBrandClick.bind(this, this.dropdownSelectId)
            }
            justifyContent="center"
          >
            <ItemInner>
              <SponsorItem
                locked={locked}
                hasBorderBottom={false}
                item={this.selectedItem.sponsorItem}
                backgroundColor={
                  this.selectedItem.sponsorCategory.backgroundColor
                }
              />
            </ItemInner>
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
                <li>
                  <OptionItem
                    id={optionIdNone}
                    key={-1}
                    onClick={this.handleOptionItemClick.bind(
                      this,
                      null,
                      optionIdNone,
                      '-brand-option-0'
                    )}
                  >
                    <Item height={this.props.height}>NONE</Item>
                  </OptionItem>
                </li>
                {this.sponsors.map((cat, idx) => {
                  const optionId = `${forId}-brand-option-${cat.id}`
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
                      key={`li-sponsor-category-announce-${idx}`}
                      ref={ref =>
                        (this[`refSponsorCategoryAnnounce-${idx}`] = ref)
                      }
                      className={this.sportTypeNoHover ? 'nohover' : ''}
                    >
                      <OptionItem
                        id={this.dropdownOptionId}
                        // onClick={this.handleOptionItemClick.bind(
                        //   this,
                        //   cat,
                        //   optionId,
                        //   `-brand-option-${cat.id}`
                        // )}
                      >
                        <Item
                          height={this.props.height}
                          text={cat.name}
                          backgroundColor={cat.backgroundColor}
                        >
                          <ItemInner>
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
                          </ItemInner>
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
                                <div style={{ width: '65%', height: '100%' }}>
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
                                </div>
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
            {/*
            <OptionItem
              id={optionIdNone}
              key={-1}
              onClick={this.handleOptionItemClick.bind(
                this,
                null,
                optionIdNone,
                '-brand-option-0'
              )}
            >
              <Item height={this.props.height}>NONE</Item>
            </OptionItem>
            {this.sponsors.map((val, idx) => {
              const optionId = `${forId}-brand-option-${val.id}`
              return (
                <OptionItem
                  id={optionId}
                  key={idx}
                  onClick={this.handleOptionItemClick.bind(
                    this,
                    val,
                    optionId,
                    `-brand-option-${val.id}`
                  )}
                >
                  <Item
                    height={this.props.height}
                    text={val.name}
                    backgroundColor={val.backgroundColor}
                  >
                    <ItemName>{val.name}</ItemName>
                    <CircleWrapper>
                      <ItemOuterBorderCircle
                        borderColor={val.circleBorderColor}
                        circleFill={val.circleFill}
                        color={val.initialColor}
                        text={val.initial}
                        height={this.props.height}
                      />
                    </CircleWrapper>
                    <CountWrapper>
                      <Count>{val.count}</Count>
                    </CountWrapper>
                  </Item>
                </OptionItem>
              )
            })}
*/}
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const FONT_SIZE = '1.8vh'

const Scrolling = styled.div`
  width: inherit;
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
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent}` : ''};
  padding-left: ${props => 1.5}vh;
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
  position: relative; /* added. so that all brands will appear on hover */
`

const Item = styled.div`
/*
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
    opacity: 0.7;
  }
*/

  width: inherit;
  height: ${props => props.height}vh;
  background-color: ${props => props.backgroundColor || '#ffffff'};
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: ${props =>
      props.backgroundColor ? hex2rgb(props.backgroundColor, 0.5) : '#ffffff'};
  }
`

const ItemInner = styled.div`
  //width: 70%;
  width: ${props => 26}vh;
  height: 100%;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${props => 1.5}vh;
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
  width: ${props => 4.3}vh;
  height: ${props => 4.3}vh;
  border-radius: 50%;
  border: ${props => 0.3}vh solid #ffffff;
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
