import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import LockWhiteIcon from '@/assets/images/icon-lock-white.svg'
import PendingIndicatorIcon from '@/assets/images/pending-indicator.svg'
import NextIcon from '@/assets/images/play-next.svg'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import DDColor from '@/Components/CommandHost/Common/DDColor'
import DDFont from '@/Components/CommandHost/Common/DDFont'
import DDAnnounceSponsor from '@/Components/CommandHost/Common/DDAnnounceSponsor'
import { vhToPx } from '@/utils'

@inject(
  'PrePlayStore',
  'PlayStore',
  'GameStore',
  'CommandHostStore',
  'AutomationStore'
)
export default class AnnounceItemPreLoad extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      promptRemove: false,
      quillHeader: null,
      quillMiddle: null,
      quillBottom: null,
      reference: `announce-editor-${this.props.currentStack}-${this.props.item.index}`,
    })
    this._isMounted = false

    //AUTOMATION
    if (
      this.props.GameStore.executionType === 'recording' &&
      this.props.PrePlayStore.sessionButtons['start'] &&
      (
        this.props.PrePlayStore.sessionButtons['start'].text || ''
      ).toLowerCase() === 'resume session'
    ) {
      this.state = {
        sessionStarted: false,
      }
    } else {
      this.state = {
        sessionStarted: this.props.GameStore.isSessionStarted,
      }
    }

    this.destroyProgress = intercept(
      this.props.GameStore,
      'progress',
      change => {
        this.setState({ sessionStarted: change.newValue === 'live' })
        return change
      }
    )

    this.destroySessionMode = intercept(
      this.props.GameStore,
      'sessionMode',
      change => {
        this.setState({ sessionStarted: change.newValue === 1 })
        return change
      }
    )
  }

  handleGoClick(itemId, refId) {
    this.props.AutomationStore.addEvent({
      evt: 'click',
      refId: refId,
      wait: 1,
      playId: this.props.item.id,
    })

    if (this[`next-play-go-${itemId}`]) {
      TweenMax.set(this[`next-play-go-${itemId}`], { display: 'none' })
      TweenMax.set(this[`next-play-indicator-go-${itemId}`], {
        display: 'flex',
      })
    }

    this.props.go(this.props.item)
  }

  handleRemoveClick(refId) {
    //this.props.AutomationStore.addEvent({evt:'click', refId: refId, wait: 2, playId: this.props.item.id})
    this.promptRemove = true
    this.forceUpdate()
    setTimeout(() => {
      this.promptRemove = false
      if (this._isMounted) {
        this.forceUpdate()
      }
    }, 3000)
  }

  handlePromptRemoveClick(refId) {
    //this.props.AutomationStore.addEvent({evt:'click', refId: refId, wait: 1, playId: this.props.item.id})

    this.props.item.executionType = (
      this.props.GameStore.executionType || ''
    ).toLowerCase()
    this.props.remove(this.props.item)
  }

  handlePromptRemoveClickX1() {
    this.props.removeNextPlay()
  }

  toggleEditor(area, mode, editor, editorReadOnly) {
    if (mode === 'editing') {
      const e = document.getElementsByClassName(editor)
      const ero = document.getElementsByClassName(editorReadOnly)
      TweenMax.set(e, { display: 'block' })
      TweenMax.set(ero, { display: 'none' })
    } else {
      const e = document.getElementsByClassName(editor)
      const ero = document.getElementsByClassName(editorReadOnly)
      TweenMax.set(e, { display: 'none' })
      TweenMax.set(ero, { display: 'flex' })

      setTimeout(() => {
        if (area === 'header') {
          this.props.item.announcements[0].value = this.quillHeader.root.innerHTML
          ero[0].innerHTML = this.quillHeader.root.innerHTML
        }
        if (area === 'middle') {
          this.props.item.announcements[1].value = this.quillMiddle.root.innerHTML
          ero[0].innerHTML = this.quillMiddle.root.innerHTML
        }
        if (area === 'bottom') {
          this.props.item.announcements[2].value = this.quillBottom.root.innerHTML
          ero[0].innerHTML = this.quillBottom.root.innerHTML
        }
      }, 0)
    }
  }

  handleColorValue(newColor, area) {
    if (area === 'header') {
      if (this.quillHeader.getSelection()) {
        let index = this.quillHeader.getSelection().index
        let length = this.quillHeader.getSelection().length
        this.quillHeader.formatText(index, length, 'color', newColor, true)

        this.props.item.announcements[0].color = newColor
      }
    }

    if (area === 'middle') {
      if (this.quillMiddle.getSelection()) {
        let index = this.quillMiddle.getSelection().index
        let length = this.quillMiddle.getSelection().length
        this.quillMiddle.formatText(index, length, 'color', newColor, true)

        this.props.item.announcements[1].color = newColor
      }
    }

    if (area === 'bottom') {
      if (this.quillBottom.getSelection()) {
        let index = this.quillBottom.getSelection().index
        let length = this.quillBottom.getSelection().length
        this.quillBottom.formatText(index, length, 'color', newColor, true)

        this.props.item.announcements[2].color = newColor
      }
    }
  }

  handleFontValue(newFont, area) {
    if (area === 'header') {
      if (this.quillHeader.getSelection()) {
        let index = this.quillHeader.getSelection().index
        let length = this.quillHeader.getSelection().length
        let selectedText = this.quillHeader.getText(index, length)
        this.quillHeader.formatText(index, length, 'font', newFont, true)

        this.props.item.announcements[0].font = newFont
      }
    }

    if (area === 'middle') {
      if (this.quillMiddle.getSelection()) {
        let index = this.quillMiddle.getSelection().index
        let length = this.quillMiddle.getSelection().length
        let selectedText = this.quillMiddle.getText(index, length)
        this.quillMiddle.formatText(index, length, 'font', newFont, true)

        this.props.item.announcements[1].font = newFont
      }
    }

    if (area === 'bottom') {
      if (this.quillBottom.getSelection()) {
        let index = this.quillBottom.getSelection().index
        let length = this.quillBottom.getSelection().length
        let selectedText = this.quillBottom.getText(index, length)
        this.quillBottom.formatText(index, length, 'font', newFont, true)

        this.props.item.announcements[2].font = newFont
      }
    }
  }

  handleSelectedSponsor(val) {
    this.props.item.sponsor = val
    this.props.item.sponsorExpanded = false
    if (!val) {
      this.sponsorEnable(0, false)
    }

    this.forceUpdate()
  }

  handleSponsorClick() {
    this.sponsorEnable(1, true)
    this.forceUpdate()
  }

  sponsorEnable(val, isExpanded) {
    if (val === 1) {
      const bottomEditorReadOnly = document.getElementsByClassName(
        `${this.reference}-bottom-readonly`
      )
      const bottomEditor = document.getElementsByClassName(
        `${this.reference}-bottom`
      )
      const bottomSponsor = document.getElementsByClassName(
        `${this.reference}-sponsor`
      )
      if (bottomEditorReadOnly && bottomEditor && bottomSponsor) {
        TweenMax.set(bottomEditorReadOnly, { display: 'none' })
        TweenMax.set(bottomEditor, { display: 'none' })
        TweenMax.set(bottomSponsor, { display: 'block' })
        this.props.item.sponsorExpanded = isExpanded
      }
    } else {
      const bottomEditorReadOnly = document.getElementsByClassName(
        `${this.reference}-bottom-readonly`
      )
      const bottomEditor = document.getElementsByClassName(
        `${this.reference}-bottom`
      )
      const bottomSponsor = document.getElementsByClassName(
        `${this.reference}-sponsor`
      )
      if (bottomEditorReadOnly && bottomEditor && bottomSponsor) {
        TweenMax.set(bottomEditorReadOnly, { display: 'flex' })
        TweenMax.set(bottomEditor, { display: 'none' })
        TweenMax.set(bottomSponsor, { display: 'none' })
      }
    }
  }

  initValues() {
    this.quillHeader.root.innerHTML = this.props.item.announcements[0].value
    this.quillMiddle.root.innerHTML = this.props.item.announcements[1].value
    this.quillBottom.root.innerHTML = this.props.item.announcements[2].value

    document.getElementsByClassName(
      `${this.reference}-header-readonly`
    )[0].innerHTML = this.props.item.announcements[0].value
    document.getElementsByClassName(
      `${this.reference}-middle-readonly`
    )[0].innerHTML = this.props.item.announcements[1].value
    document.getElementsByClassName(
      `${this.reference}-bottom-readonly`
    )[0].innerHTML = this.props.item.announcements[2].value
  }

  componentWillReceiveProps(nextProps) {
    this.initValues()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.destroyProgress()
    this.destroySessionMode()
  }

  componentDidMount() {
    this._isMounted = true
    let Font = Quill.import('formats/font')
    Font.whitelist = [
      'pamainlight',
      'pamainregular',
      'pamainbold',
      'pamainextrabold',
    ]
    Quill.register(Font, true)

    this.quillHeader = new Quill(`.${this.reference}-header`, {
      modules: {
        toolbar: false,
      },
      theme: 'snow',
    })

    this.quillMiddle = new Quill(`.${this.reference}-middle`, {
      modules: {
        toolbar: false,
      },
      theme: 'snow',
    })

    this.quillBottom = new Quill(`.${this.reference}-bottom`, {
      modules: {
        toolbar: false,
      },
      theme: 'snow',
    })

    this.initValues()

    // old
    // if (this.props.item.sponsor && this.props.item.sponsor.id) {
    //   this.sponsorEnable(1, false)
    // } else {
    //   this.sponsorEnable(0, false)
    // }

    //new
    if (
      this.props.item.sponsor &&
      this.props.item.sponsor.sponsorCategory &&
      this.props.item.sponsor.sponsorItem &&
      this.props.item.sponsor.sponsorItem.brandId
    ) {
      this.sponsorEnable(1, false)
    } else {
      this.sponsorEnable(0, false)
    }

    delete this.props.item.editorEvents
    delete this.props.item.recordedAutomation
  }

  render() {
    let { item, index, GameStore } = this.props
    let { sessionStarted } = this.state
    let required = true
    let playNotStarted = this.props.GameStore.progress != 'live'

    return (
      <Container zIndex={1000 - index}>
        <Main>
          <PlayStatusWrapper backgroundColor={'#a7a9ac'} src={NextIcon} />
          <PlayTypeDD>
            <PrePlaySingle text={item.type} />
          </PlayTypeDD>
          <InputsWrapper>
            <Row>
              <RowArea key={0}>
                <EditorReadOnly
                  locked={required}
                  className={`${this.reference}-header-readonly`}
                  onClick={
                    required
                      ? null
                      : this.toggleEditor.bind(
                          this,
                          'header',
                          'editing',
                          `${this.reference}-header`,
                          `${this.reference}-header-readonly`
                        )
                  }
                />
                <Editor
                  id="announce-editor"
                  className={`${this.reference}-header`}
                  onBlur={this.toggleEditor.bind(
                    this,
                    'header',
                    'locking',
                    `${this.reference}-header`,
                    `${this.reference}-header-readonly`
                  )}
                />
                {/*
                <DDColor
                  hidden={required}
                  height={h}
                  index={'color-header' + item.index}
                  announcement={item.announcements[0]}
                  clicked={this.toggleEditor.bind(
                    this,
                    'header',
                    'editing',
                    `${this.reference}-header`,
                    `${this.reference}-header-readonly`
                  )}
                  value={this.handleColorValue.bind(this)}
                />
                <DDFont
                  hidden={required}
                  height={h}
                  index={'font-header' + item.index}
                  announcement={item.announcements[0]}
                  clicked={this.toggleEditor.bind(
                    this,
                    'header',
                    'editing',
                    `${this.reference}-header`,
                    `${this.reference}-header-readonly`
                  )}
                  value={this.handleFontValue.bind(this)}
                />
*/}
              </RowArea>

              <RowArea key={1}>
                <EditorReadOnly
                  locked={required}
                  className={`${this.reference}-middle-readonly`}
                  onClick={
                    required
                      ? null
                      : this.toggleEditor.bind(
                          this,
                          'middle',
                          'editing',
                          `${this.reference}-middle`,
                          `${this.reference}-middle-readonly`
                        )
                  }
                />
                <Editor
                  id="announce-editor"
                  className={`${this.reference}-middle`}
                  onBlur={this.toggleEditor.bind(
                    this,
                    'middle',
                    'locking',
                    `${this.reference}-middle`,
                    `${this.reference}-middle-readonly`
                  )}
                />
                {/*
                <DDColor
                  hidden={required}
                  height={h}
                  index={'color-middle' + item.index}
                  announcement={item.announcements[1]}
                  clicked={this.toggleEditor.bind(
                    this,
                    'middle',
                    'editing',
                    `${this.reference}-middle`,
                    `${this.reference}-middle-readonly`
                  )}
                  value={this.handleColorValue.bind(this)}
                />
                <DDFont
                  hidden={required}
                  height={h}
                  index={'font-middle' + item.index}
                  announcement={item.announcements[1]}
                  clicked={this.toggleEditor.bind(
                    this,
                    'middle',
                    'editing',
                    `${this.reference}-middle`,
                    `${this.reference}-middle-readonly`
                  )}
                  value={this.handleFontValue.bind(this)}
                />
*/}
              </RowArea>

              <RowArea key={2}>
                <EditorReadOnly
                  locked={required}
                  className={`${this.reference}-bottom-readonly`}
                  onClick={
                    required
                      ? null
                      : this.toggleEditor.bind(
                          this,
                          'bottom',
                          'editing',
                          `${this.reference}-bottom`,
                          `${this.reference}-bottom-readonly`
                        )
                  }
                />
                <Editor
                  id="announce-editor"
                  className={`${this.reference}-bottom`}
                  onBlur={this.toggleEditor.bind(
                    this,
                    'bottom',
                    'locking',
                    `${this.reference}-bottom`,
                    `${this.reference}-bottom-readonly`
                  )}
                />
                <DDSponsorWrapper className={`${this.reference}-sponsor`}>
                  <DDAnnounceSponsor
                    locked
                    height={h}
                    index={`${this.reference}-sponsor`}
                    selectedSponsor={item.sponsor}
                    value={this.handleSelectedSponsor.bind(this)}
                    expanded={item.sponsorExpanded}
                  />
                </DDSponsorWrapper>
                {/*
                <DDSponsorDrop
                  hidden={required}
                  onClick={this.handleSponsorClick.bind(this)}
                />
*/}
                {/*
                <DDColor
                  hidden={required}
                  locked={item.sponsor && item.sponsor.id ? true : false}
                  height={h}
                  index={'color-bottom' + item.index}
                  announcement={item.announcements[2]}
                  clicked={this.toggleEditor.bind(
                    this,
                    'bottom',
                    'editing',
                    `${this.reference}-bottom`,
                    `${this.reference}-bottom-readonly`
                  )}
                  value={this.handleColorValue.bind(this)}
                />
                <DDFont
                  hidden={required}
                  locked={item.sponsor && item.sponsor.id ? true : false}
                  height={h}
                  index={'font-bottom' + item.index}
                  announcement={item.announcements[2]}
                  clicked={this.toggleEditor.bind(
                    this,
                    'bottom',
                    'editing',
                    `${this.reference}-bottom`,
                    `${this.reference}-bottom-readonly`
                  )}
                  value={this.handleFontValue.bind(this)}
                />
*/}
              </RowArea>
            </Row>
          </InputsWrapper>
          <LastButtonWrapper>
            <RemoveGoWrapper>
              <AddToStackRemoveWrapper>
                {this.promptRemove ? (
                  <PromptRemoveButton
                    // locked={GameStore.isLockedForAllExecutionType}
                    id={`final-remove-${item.type}-${item.id}`}
                    onClick={this.handlePromptRemoveClick.bind(
                      this,
                      `final-remove-${item.type}-${item.id}`
                    )}
                  />
                ) : (
                  <RemoveButton
                    // locked={GameStore.isLockedForAllExecutionType}
                    id={`prompt-remove-${item.type}-${item.id}`}
                    onClick={this.handleRemoveClick.bind(
                      this,
                      `prompt-remove-${item.type}-${item.id}`
                    )}
                  />
                )}
              </AddToStackRemoveWrapper>
              <GoButton
                id={`go-button-Announce-${item.id}`}
                locked={!sessionStarted}
                onClick={
                  !sessionStarted
                    ? null
                    : this.handleGoClick.bind(
                        this,
                        item.id,
                        `go-button-Announce-${item.id}`
                      )
                }
                innerRef={ref => (this[`next-play-go-${item.id}`] = ref)}
              />
              <PendingIndicator
                src={PendingIndicatorIcon}
                innerRef={ref =>
                  (this[`next-play-indicator-go-${item.id}`] = ref)
                }
              />
            </RemoveGoWrapper>
          </LastButtonWrapper>
        </Main>
      </Container>
    )
  }
}

const h = 5
let FONT_SIZE = '1.8vh'

const Container = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
  margin-top: ${props => 0.1}vh;
  margin-bottom: 0.1;
  z-index: ${props => props.zIndex};
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const Main = styled.div`
  width: inherit;
  height: ${props => h}vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
`

const PlayTypeDD = styled.div`
  width: 8%;
  height: ${props => h}vh;
  display: flex;
`
const PlayStatusWrapper = styled.div`
  width: 3%;
  height: ${props => h}vh;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 50%;
  background-position: center;
`

const PrePlaySingle = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: #231f20;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: white;
  line-height: 1;
  text-transform: uppercase;
  &:after {
    content: '${props => props.text}';
  }
`

const InputsWrapper = styled.div`
  width: 79%;
  height: ${props => h}vh;
`

const Row = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  flex-direction: row;
`

const RowArea = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  flex-direction: row;
`

const Editor = styled.div`
  width: 100%;
  height: inherit;
  background-color: #ffffff;
  display: none;
`

const EditorReadOnly = styled.div`
  width: 100%;
  height: inherit;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  text-indent: ${props => 2}vh;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  padding-top: ${props => 1.5}vh;
  margin-left: ${props => 0.2}vh;
  text-transform: uppercase;
  font-family: pamainlight;
`

const AddToStackRemoveWrapper = styled.div`
  width: 75%
  height: inherit;
`

const AddToStackButton = styled.div`
  width: ${props => 15}vh;
  height: inherit;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: ${props => (props.locked ? 'grayscale(1)' : 'grayscale(0)')};
  &:after {
    content: 'ADD TO STACK';
    color: white;
  }
`

const GoButton = styled.div`
  width: 25%;
  height: ${props => h}vh;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: ${props => (props.locked ? 'grayscale(1)' : 'grayscale(0)')};
  opacity: ${props => (props.locked ? 0.4 : 1)};
  position: relative;
  &:after {
    content: 'GO';
    color: #18c5ff;
  }
`

const xGoButton = styled.div`
  width: ${props => `${h}vh`};
  height: ${props => `${h}vh`};
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: ${props => (props.locked ? 'grayscale(1)' : 'grayscale(0)')};
  position: relative;
  &:after {
    content: 'GO';
    color: #18c5ff;
  }
`

const RemoveButton = styled.div`
  width: 100%;
  height: inherit;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: grayscale(1);
  opacity: 0.3;
  &:after {
    content: 'REMOVE';
    color: black;
  }
`

const PromptRemoveButton = styled.div`
  width: 100%;
  height: inherit;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: 'REMOVE PLAY?';
    color: black;
  }
`

const LastButtonWrapper = styled.div`
  width: 10%;
  height: inherit;
  display: flex;
`

const RemoveGoWrapper = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const EndAnnounceButton = styled.div`
  width: 100%;
  height: 100%;
  background-color: #c61818;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'END ANNOUNCEMENT';
    color: #ffffff;
  }
`

const DDSponsorWrapper = styled.div`
  width: 100%;
  position: relative;
  display: none;
`
const DDSponsorDrop = styled.div`
  width: 2vh;
  height: ${props => `${h}vh`};
  background-color: #bcbec0;
  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-size: 1.5vh;
  background-position: bottom;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
`

const PendingIndicator = styled.div`
  width: ${props => h}vh;
  height: ${props => h}vh;
  background-color: #000000;
  display: none;
  align-items: center;
  &:after {
    content: '';
    display: block;
    width: ${props => h}vh;
    height: ${props => h}vh;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
    animation: ${props => pendingRotate} 5s linear infinite;
    transformorigin: center center;
  }
`

const pendingRotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`
