import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
import LockWhiteIcon from '@/assets/images/icon-lock-white.svg'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import DDAnnounceSponsor from '@/Components/CommandHost/Common/DDAnnounceSponsor'
import { vhToPx } from '@/utils'

@inject('PrePlayStore', 'CommandHostStore', 'GameStore', 'AutomationStore')
export default class AnnounceItemLoad extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      promptRemove: false,
      quillHeader: null,
      quillMiddle: null,
      quillBottom: null,
    })

    //this.reference = `announceitemload-editor-${this.props.item.index}`
    this.reference = `announceitemload-editor-${this.props.item.id}`

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

    this.destroySessionMode = intercept(
      this.props.GameStore,
      'sessionMode',
      change => {
        this.setState({ sessionStarted: change.newValue === 1 })
        return change
      }
    )
  }

  async handleEndAnnounceClick(refId) {
    let { PrePlayStore } = this.props

    /*
    if ('recording' === this.props.GameStore.executionType) {
      await _editorEvents.push({
        gameId: this.props.GameStore.gameId,
        playId: null,
        evt: 'delay',
        refId: refId,
        wait: 0,
        sequence: 0,
        isIncrementHeaderPlaySequence: false,
        isIncrementPlaySequence: false,
        isIncrementSequence: true,
        timestampWait: 0,
        isPreviousPlayEnded: true,
        isUseGlobalTimestampWait: true
      })


      await _editorEvents.push({
        gameId: this.props.GameStore.gameId,
        playId: this.props.item.id,
        evt: 'click',
        refId: refId,
        wait: 0,
        sequence: 0,
        isIncrementHeaderPlaySequence: false,
        isIncrementPlaySequence: false,
        isIncrementSequence: true,
        timestampWait: 0,
        isPreviousPlayEnded: false
      })

      if (PrePlayStore.nextPlayItem && PrePlayStore.nextPlayItem.id) {
        await _editorEvents.push({
          gameId: this.props.GameStore.gameId,
          playId: PrePlayStore.nextPlayItem.id,
          evt: 'click',
          refId: `go-button-${PrePlayStore.nextPlayItem.type}-${PrePlayStore.nextPlayItem.id}`,
          wait: 0,
          sequence: 0,
          isIncrementHeaderPlaySequence: false,
          isIncrementPlaySequence: false,
          isIncrementSequence: true,
          timestampWait: 0,
          isPreviousPlayEnded: true,
        })
      }
    }
*/

    this.props.AutomationStore.addEvent({
      evt: 'click',
      refId: refId,
      wait: 1,
      playId: this.props.item.id,
    })
    if (PrePlayStore.nextPlayItem && PrePlayStore.nextPlayItem.id) {
      this.props.AutomationStore.addEvent({
        evt: 'click',
        refId: `go-button-${PrePlayStore.nextPlayItem.type}-${PrePlayStore.nextPlayItem.id}`,
        wait: 1,
        playId: PrePlayStore.nextPlayItem.id,
        isPreviousPlayEnded: true,
      })
    }

    //await this.props.item.editorEvents = ('recording' === this.props.GameStore.executionType) ? _editorEvents : null
    this.props.endAnnouncement(this.props.item)
  }

  handleSelectedSponsor(val) {
    this.props.item.sponsor = val
    this.props.item.sponsorExpanded = false
    if (!val) {
      this.sponsorEnable(0, false)
    }

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

  componentWillUnmount() {
    this.destroySessionMode()
  }

  componentDidMount() {
    try {
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
    } catch (err) {
      console.error('Sportoco - HostCommand Error: ', err)
    }

    delete this.props.item.editorEvents
  }

  render() {
    let { item, index } = this.props
    let required = true
    let locked = true

    return (
      <Container zIndex={1000 - index}>
        <Wrapper>
          <Main>
            <PlayStatusWrapper />
            <PlayTypeDD>
              <PrePlaySingle text={item.type} />
            </PlayTypeDD>
            <InputsWrapper>
              <Row>
                <RowArea key={0}>
                  <EditorReadOnly
                    locked
                    className={`${this.reference}-header-readonly`}
                    onClick={
                      locked
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
                </RowArea>

                <RowArea key={1}>
                  <EditorReadOnly
                    locked
                    className={`${this.reference}-middle-readonly`}
                    onClick={
                      locked
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
                </RowArea>

                <RowArea key={2}>
                  <EditorReadOnly
                    locked
                    className={`${this.reference}-bottom-readonly`}
                    onClick={
                      locked
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
                </RowArea>
              </Row>
            </InputsWrapper>
            <LastButtonWrapper>
              <EndAnnounceButton
                locked={!this.state.sessionStarted}
                id={`end-button-Announce-${item.id}`}
                onClick={
                  !this.state.sessionStarted
                    ? null
                    : this.handleEndAnnounceClick.bind(
                        this,
                        `end-button-Announce-${item.id}`
                      )
                }
              />
            </LastButtonWrapper>
          </Main>
        </Wrapper>
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
  margin-bottom: ${props => 0.1}vh;
  z-index: ${props => props.zIndex};
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1}
`

const Wrapper = styled.div`
  width: inherit;
  height: inherit;
  margin-top: ${props => 0.1}vh;
  margin-bottom: ${props => 0.1}vh;
  padding: ${props => 5}vh 0 ${props => 5}vh 0;
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
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-image: url(${LockWhiteIcon});
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

const LastButtonWrapper = styled.div`
  width: 10%;
  height: inherit;
  display: flex;
`

const EndAnnounceButton = styled.div`
  width: 100%;
  height: 100%;
  background-color: #c61818;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  filter: grayscale(${props => (props.locked ? 1 : 0)});
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
