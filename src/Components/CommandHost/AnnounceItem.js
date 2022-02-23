import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable, observe, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import { TweenMax } from 'gsap'
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
export default class AnnounceItem extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      promptRemove: false,
      quillHeader: null,
      quillMiddle: null,
      quillBottom: null,
      quillHeaderColor: '#17c4fe',
      quillMiddleColor: '#ffb600',
      quillBottomColor: '#000000',
      quillHeaderFont: 'pamainbold',
      quillMiddleFont: 'pamainextrabold',
      quillBottomFont: 'pamainbold',
      reference: `announce-editor-${this.props.currentStack}-${this.props.item.index}`,
    })

    this.interceptedSessionStarted = false
    this.interceptedProgress = ''

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
        sessionStarted:
          this.props.GameStore.progress === 'live' &&
          !this.props.GameStore.isViewRecordedEvent,
      }
    }

    this.destroyProgress = intercept(
      this.props.GameStore,
      'progress',
      change => {
        this.setState({ sessionStarted: change.newValue === 'live' })
        if (change.newValue) {
          this.interceptedSessionStarted = change.newValue === 'live'
          this.interceptedProgress = change.newValue
          this.validateFields()
        }
        return change
      }
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.sessionStarted !== this.state.sessionStarted) {
      return true
    }
    return false
  }

  async handleAddToStackClick(refId) {
    let { GameStore, AutomationStore } = this.props
    if ('recording' === GameStore.executionType && GameStore.sessionMode) {
      const editorEvents = []
      for (let i = 0; i < this.props.AutomationStore.events.length; i++) {
        const event = this.props.AutomationStore.events[i]
        if (
          event.evt === 'click' &&
          (!event.refId.includes('brand-drop') ||
            !event.refId.includes('brand-option'))
        ) {
          const inputRefId = event.refId.replace('readonly-', '')
          const inputEvent = await this.props.AutomationStore.events.filter(
            o => o.evt === 'input' && o.refId === inputRefId
          )[0]
          if (inputEvent) {
            event.evt = 'input'
            event.value = inputEvent.value
            editorEvents.push(event)
          }
        }
        if (event.evt === 'click' && event.refId.includes('brand-drop')) {
          const exists = await editorEvents.filter(
            o => o.evt === event.evt && o.refId === event.refId
          )[0]
          if (!exists) {
            editorEvents.push(event)
            const brandOptionRefId = event.refId.replace(
              'brand-drop',
              'brand-option'
            )
            const brandOption = await this.props.AutomationStore.events.filter(
              o => o.evt === 'click' && o.refId.includes(brandOptionRefId)
            )[0]
            if (brandOption) {
              editorEvents.push(brandOption)
            }
          }
        }
      }

      this.props.item.executionType = 'recording'
      this.props.item.editorEvents = editorEvents
      this.props.item.recordedAutomation = {
        gameId: GameStore.gameId,
        evt: 'click',
        refId: refId,
        wait: 0,
        sequence: 0,
        isIncrementHeaderPlaySequence: false,
        isIncrementPlaySequence: true,
        isIncrementSequence: true,
        timestampWait: 0.5,
      }
      AutomationStore.resetCurrentTime()
    }

    if ('automation' === GameStore.executionType && GameStore.sessionMode) {
      //TODO: DAPAT INCRREMENT DIN ANG SEQUENCE NG TATLONG BESES KATULAD NG SA RECORDING
      if (GameStore.recordedPlays && GameStore.recordedPlays.length > 0) {
        const recordedPlay = await GameStore.recordedPlays.filter(
          o => o.ref_id === refId && o.event === 'click'
        )[0]
        if (recordedPlay) {
          if (!this.props.item.id) {
            this.props.item.executionType = 'automation'
            this.props.item.id = recordedPlay.play_id
          }
        }
        ++AutomationStore.sequence
      }
    }

    if (GameStore.sessionMode) {
      AutomationStore.incrementPlaySequence()
    }

    this.props.addToStackValues(this.props.item)
  }

  async handleGoClick(refId) {
    this.props.item.isNew = true

    let { GameStore, AutomationStore } = this.props
    if ('recording' === GameStore.executionType && GameStore.sessionMode) {
      const editorEvents = []
      for (let i = 0; i < this.props.AutomationStore.events.length; i++) {
        const event = this.props.AutomationStore.events[i]
        if (
          event.evt === 'click' &&
          (!event.refId.includes('brand-drop') ||
            !event.refId.includes('brand-option'))
        ) {
          const inputRefId = event.refId.replace('readonly-', '')
          const inputEvent = await this.props.AutomationStore.events.filter(
            o => o.evt === 'input' && o.refId === inputRefId
          )[0]
          if (inputEvent) {
            event.evt = 'input'
            event.value = inputEvent.value
            editorEvents.push(event)
          }
        }
        if (event.evt === 'click' && event.refId.includes('brand-drop')) {
          const exists = await editorEvents.filter(
            o => o.evt === event.evt && o.refId === event.refId
          )[0]
          if (!exists) {
            editorEvents.push(event)
            const brandOptionRefId = event.refId.replace(
              'brand-drop',
              'brand-option'
            )
            const brandOption = await this.props.AutomationStore.events.filter(
              o => o.evt === 'click' && o.refId.includes(brandOptionRefId)
            )[0]
            if (brandOption) {
              editorEvents.push(brandOption)
            }
          }
        }
      }

      this.props.item.executionType = 'recording'
      this.props.item.editorEvents = editorEvents
      this.props.item.recordedAutomation = {
        gameId: GameStore.gameId,
        evt: 'click',
        refId: refId,
        wait: 0,
        sequence: 0,
        isIncrementHeaderPlaySequence: false,
        isIncrementPlaySequence: true,
        isIncrementSequence: true,
        timestampWait: 0.5,
        isGo: true,
      }
      AutomationStore.resetCurrentTime()
    }

    if ('automation' === GameStore.executionType && GameStore.sessionMode) {
      //TODO: IT SHOULD ALSO INCREMENT THE SEQUENCE THREE TIMES JUST LIKE IN THE RECORDING
      if (GameStore.recordedPlays && GameStore.recordedPlays.length > 0) {
        const recordedPlay = await GameStore.recordedPlays.filter(
          o => o.ref_id === refId && o.event === 'click'
        )[0]
        if (recordedPlay) {
          if (!this.props.item.id) {
            this.props.item.isNew = true
            this.props.item.executionType = 'automation'
            this.props.item.id = recordedPlay.play_id
          }
        }
        ++AutomationStore.sequence
      }
    }

    /*
        if ('automation' === GameStore.executionType) {
          if (GameStore.recordedPlays && GameStore.recordedPlays.length > 0) {
            if (GameStore.recordedPlays[AutomationStore.sequence].ref_id === refId && GameStore.recordedPlays[AutomationStore.sequence].event === 'click') {
              if (!this.props.item.id) {
                this.props.item.isNew = true
                this.props.item.executionType = 'automation'
                this.props.item.id = await GameStore.recordedPlays[AutomationStore.sequence].play_id
              }
            }
            ++AutomationStore.sequence;
          }
        }
    */

    if (GameStore.sessionMode) {
      AutomationStore.incrementPlaySequence()
    }

    this.props.go(this.props.item)
  }

  toggleEditor(area, mode, editor, editorReadOnly, refId) {
    if (mode === 'editing') {
      const e = document.getElementsByClassName(editor)
      const ero = document.getElementsByClassName(editorReadOnly)
      TweenMax.set(e, { display: 'block' })
      TweenMax.set(ero, { display: 'none' })

      if (area === 'header') {
        this.quillHeader.focus()
      }
      if (area === 'middle') {
        this.quillMiddle.focus()
      }
      if (area === 'bottom') {
        this.quillBottom.focus()
      }

      this.props.AutomationStore.addTempAnnounceEvent({
        evt: 'click',
        refId: refId,
        wait: 0,
        playId: this.props.item.id,
      })
    } else {
      const e = document.getElementsByClassName(editor)
      if (e) {
        TweenMax.set(e, { display: 'none' })
      }
      const ero = document.getElementsByClassName(editorReadOnly)
      if (ero) {
        TweenMax.set(ero, { display: 'flex' })
      }

      setTimeout(() => {
        if (area === 'header') {
          this.props.item.announcements[0].value = this.quillHeader.root.innerHTML
          if (ero && ero[0]) {
            ero[0].innerHTML = this.quillHeader.root.innerHTML
          }
          this.quillHeader.blur()
        }
        if (area === 'middle') {
          this.props.item.announcements[1].value = this.quillMiddle.root.innerHTML
          if (ero && ero[0]) {
            ero[0].innerHTML = this.quillMiddle.root.innerHTML
          }
          this.quillMiddle.blur()
        }
        if (area === 'bottom') {
          this.props.item.announcements[2].value = this.quillBottom.root.innerHTML
          if (ero && ero[0]) {
            ero[0].innerHTML = this.quillBottom.root.innerHTML
          }
          this.quillBottom.blur()
        }

        //this.props.GameStore.setAnnouncementValueObservable(this.props.item)
      }, 0)

      if (refId) {
        if (area === 'header') {
          const strippedHTMLTags = this.quillHeader.root.innerHTML
            .toString()
            .replace(/(<([^>]+)>)/gi, '')
          this.props.AutomationStore.addTempAnnounceEvent({
            evt: 'input',
            refId: refId,
            wait: 0,
            value: this.quillHeader.root.innerHTML,
          })
        }
        if (area === 'middle') {
          const strippedHTMLTags = this.quillMiddle.root.innerHTML
            .toString()
            .replace(/(<([^>]+)>)/gi, '')
          this.props.AutomationStore.addTempAnnounceEvent({
            evt: 'input',
            refId: refId,
            wait: 0,
            value: this.quillMiddle.root.innerHTML,
          })
        }
        if (area === 'bottom') {
          const strippedHTMLTags = this.quillBottom.root.innerHTML
            .toString()
            .replace(/(<([^>]+)>)/gi, '')
          this.props.AutomationStore.addTempAnnounceEvent({
            evt: 'input',
            refId: refId,
            wait: 0,
            value: this.quillBottom.root.innerHTML,
          })
        }
      }
    }
  }

  handleColorValue(newColor, area) {
    try {
      if (area === 'header') {
        if (this.quillHeader.getSelection()) {
          let index = this.quillHeader.getSelection().index
          let length = this.quillHeader.getSelection().length
          this.quillHeader.formatText(index, length, 'color', newColor, true)

          this.props.item.announcements[0].color = newColor
        }
        this.quillHeader.format('color', newColor)
        this.quillHeaderColor = newColor

        /**
         * added this line to update the ReadOnly Editor immediately when the Quill Editor has triggered the blur event.
         */
        this.props.item.announcements[0].value = this.quillHeader.root.innerHTML
        const ero = document.getElementsByClassName(
          `${this.reference}-header-readonly`
        )
        ero[0].innerHTML = this.quillHeader.root.innerHTML
      }

      if (area === 'middle') {
        if (this.quillMiddle.getSelection()) {
          let index = this.quillMiddle.getSelection().index
          let length = this.quillMiddle.getSelection().length
          this.quillMiddle.formatText(index, length, 'color', newColor, true)

          this.props.item.announcements[1].color = newColor
        }
        this.quillMiddle.format('color', newColor)
        this.quillMiddleColor = newColor

        /**
         * added this line to update the ReadOnly Editor immediately when the Quill Editor has triggered the blur event.
         */
        this.props.item.announcements[1].value = this.quillMiddle.root.innerHTML
        const ero = document.getElementsByClassName(
          `${this.reference}-middle-readonly`
        )
        ero[0].innerHTML = this.quillMiddle.root.innerHTML
      }

      if (area === 'bottom') {
        if (this.quillBottom.getSelection()) {
          let index = this.quillBottom.getSelection().index
          let length = this.quillBottom.getSelection().length
          this.quillBottom.formatText(index, length, 'color', newColor, true)

          this.props.item.announcements[2].color = newColor
        }
        this.quillBottom.format('color', newColor)
        this.quillBottomColor = newColor

        /**
         * added this line to update the ReadOnly Editor immediately when the Quill Editor has triggered the blur event.
         */
        this.props.item.announcements[2].value = this.quillBottom.root.innerHTML
        const ero = document.getElementsByClassName(
          `${this.reference}-bottom-readonly`
        )
        ero[0].innerHTML = this.quillBottom.root.innerHTML
      }
    } catch (err) {}
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
      this.quillHeader.format('font', newFont)
      this.quillHeaderFont = newFont

      /**
       * added this line to update the ReadOnly Editor immediately when the Quill Editor has triggered the blur event.
       */
      this.props.item.announcements[0].value = this.quillHeader.root.innerHTML
      const ero = document.getElementsByClassName(
        `${this.reference}-header-readonly`
      )
      ero[0].innerHTML = this.quillHeader.root.innerHTML
    }

    if (area === 'middle') {
      if (this.quillMiddle.getSelection()) {
        let index = this.quillMiddle.getSelection().index
        let length = this.quillMiddle.getSelection().length
        let selectedText = this.quillMiddle.getText(index, length)
        this.quillMiddle.formatText(index, length, 'font', newFont, true)

        this.props.item.announcements[1].font = newFont
      }
      this.quillMiddle.format('font', newFont)
      this.quillMiddleFont = newFont

      /**
       * added this line to update the ReadOnly Editor immediately when the Quill Editor has triggered the blur event.
       */
      this.props.item.announcements[1].value = this.quillMiddle.root.innerHTML
      const ero = document.getElementsByClassName(
        `${this.reference}-middle-readonly`
      )
      ero[0].innerHTML = this.quillMiddle.root.innerHTML
    }

    if (area === 'bottom') {
      if (this.quillBottom.getSelection()) {
        let index = this.quillBottom.getSelection().index
        let length = this.quillBottom.getSelection().length
        let selectedText = this.quillBottom.getText(index, length)
        this.quillBottom.formatText(index, length, 'font', newFont, true)

        this.props.item.announcements[2].font = newFont
      }
      this.quillBottom.format('font', newFont)
      this.quillBottomFont = newFont

      /**
       * added this line to update the ReadOnly Editor immediately when the Quill Editor has triggered the blur event.
       */
      this.props.item.announcements[2].value = this.quillBottom.root.innerHTML
      const ero = document.getElementsByClassName(
        `${this.reference}-bottom-readonly`
      )
      ero[0].innerHTML = this.quillBottom.root.innerHTML
    }
  }

  handleSelectedSponsor(_editor, _forIdBrandDrop, _val, _refId, _strToReplace) {
    if (_val) {
      this.props.AutomationStore.addTempAnnounceEvent({
        evt: 'click',
        refId: _forIdBrandDrop,
        wait: 0.5,
        playId: this.props.item.id,
        value: undefined,
      })
    }
    this.props.AutomationStore.addTempAnnounceEvent({
      evt: 'click',
      refId: _refId,
      wait: 0.5,
      playId: this.props.item.id,
      strToReplace: _strToReplace,
      sponsor: _val,
      value: _editor ? _editor.root.innerHTML : null,
    })

    this.props.item.sponsor = _val
    this.props.item.sponsorExpanded = false
    if (!_val) {
      this.sponsorEnable(0, false)
    }

    const previewItem = Object.assign({}, this.props.item)
    this.props.GameStore.setAnnouncementValueObservable(previewItem)

    this.validateFields()
    this.forceUpdate()
  }

  async handleSponsorClick() {
    await this.sponsorEnable(1, true)
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

    const elHeader = document.getElementsByClassName(
      `${this.reference}-header-readonly`
    )
    if (elHeader && elHeader[0]) {
      elHeader[0].innerHTML = this.props.item.announcements[0].value
    }
    const elMiddle = document.getElementsByClassName(
      `${this.reference}-middle-readonly`
    )
    if (elMiddle && elMiddle[0]) {
      elMiddle[0].innerHTML = this.props.item.announcements[1].value
    }
    const elBottom = document.getElementsByClassName(
      `${this.reference}-bottom-readonly`
    )
    if (elBottom && elBottom[0]) {
      elBottom[0].innerHTML = this.props.item.announcements[2].value
    }
  }

  initValuesForColorAndFont() {
    setTimeout(() => {
      this.quillHeader.setSelection(
        0,
        this.props.item.announcements[0].value.length
      )
      this.quillHeader.formatText(
        0,
        this.props.item.announcements[0].value.length,
        'color',
        this.quillHeaderColor,
        true
      )
      this.quillHeader.formatText(
        0,
        this.props.item.announcements[0].value.length,
        'font',
        this.quillHeaderFont,
        true
      )
      this.quillHeader.format('color', this.quillHeaderColor)
      this.quillHeader.format('font', this.quillHeaderFont)
      this.props.item.announcements[0].value = this.quillHeader.root.innerHTML

      this.quillMiddle.setSelection(
        0,
        this.props.item.announcements[1].value.length
      )
      this.quillMiddle.formatText(
        0,
        this.props.item.announcements[1].value.length,
        'color',
        this.quillMiddleColor,
        true
      )
      this.quillMiddle.formatText(
        0,
        this.props.item.announcements[1].value.length,
        'font',
        this.quillMiddleFont,
        true
      )
      this.quillMiddle.format('color', this.quillMiddleColor)
      this.quillMiddle.format('font', this.quillMiddleFont)
      this.props.item.announcements[1].value = this.quillMiddle.root.innerHTML

      this.quillBottom.setSelection(
        0,
        this.props.item.announcements[2].value.length
      )
      this.quillBottom.formatText(
        0,
        this.props.item.announcements[2].value.length,
        'color',
        this.quillBottomColor,
        true
      )
      this.quillBottom.formatText(
        0,
        this.props.item.announcements[2].value.length,
        'font',
        this.quillBottomFont,
        true
      )
      this.quillBottom.format('color', this.quillBottomColor)
      this.quillBottom.format('font', this.quillBottomFont)
      this.props.item.announcements[2].value = this.quillBottom.root.innerHTML
    }, 0)
  }

  componentWillUnmount() {
    this.destroyProgress()
    this.props.GameStore.setAnnouncementValueObservable(null)
  }

  // componentWillReceiveProps(nextProps) {
  //   this.initValues()
  // }

  componentDidMount() {
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
    // this.quillHeader = new Quill(`#editor-1-Announce`, {
    //   modules: {
    //     toolbar: false,
    //   },
    //   theme: 'snow',
    // })
    this.quillHeader.on('text-change', async () => {
      const strippedHTMLTags = this.quillHeader.root.innerHTML
        .toString()
        .replace(/(<([^>]+)>)/gi, '')
      //TODO
      this.validateFields()
      if (!strippedHTMLTags) {
        this.quillHeader.format('font', this.quillHeaderFont)
        this.quillHeader.format('color', this.quillHeaderColor)
      }

      const previewItem = await Object.assign({}, this.props.item)
      previewItem.announcements[0].value = this.quillHeader.root.innerHTML
      this.props.GameStore.setAnnouncementValueObservable(previewItem)
    })

    this.quillMiddle = new Quill(`.${this.reference}-middle`, {
      modules: {
        toolbar: false,
      },
      theme: 'snow',
    })
    this.quillMiddle.on('text-change', async () => {
      const strippedHTMLTags = this.quillMiddle.root.innerHTML
        .toString()
        .replace(/(<([^>]+)>)/gi, '')
      //TODO
      this.validateFields()
      if (!strippedHTMLTags) {
        this.quillMiddle.format('font', this.quillMiddleFont)
        this.quillMiddle.format('color', this.quillMiddleColor)
      }

      const previewItem = await Object.assign({}, this.props.item)
      previewItem.announcements[1].value = this.quillMiddle.root.innerHTML
      this.props.GameStore.setAnnouncementValueObservable(previewItem)
    })

    this.quillBottom = new Quill(`.${this.reference}-bottom`, {
      modules: {
        toolbar: false,
      },
      theme: 'snow',
    })
    this.quillBottom.on('text-change', async () => {
      const strippedHTMLTags = this.quillBottom.root.innerHTML
        .toString()
        .replace(/(<([^>]+)>)/gi, '')
      //TODO
      this.validateFields()
      if (!strippedHTMLTags) {
        this.quillBottom.format('font', this.quillBottomFont)
        this.quillBottom.format('color', this.quillBottomColor)
      }

      const previewItem = await Object.assign({}, this.props.item)
      previewItem.announcements[2].value = this.quillBottom.root.innerHTML
      this.props.GameStore.setAnnouncementValueObservable(previewItem)
    })

    this.initValues()
    this.initValuesForColorAndFont()
    this.validateFields()

    if (this.props.item.sponsor && this.props.item.sponsor.id) {
      this.sponsorEnable(1, false)
    } else {
      this.sponsorEnable(0, false)
    }

    //- INITIALIZE VALUE FOR PREVIEW
    const previewItem = Object.assign({}, this.props.item)
    this.props.GameStore.setAnnouncementValueObservable(previewItem)

    //- FROM THE RESOLVED PLAY REUSE BUTTON
    /**
     * FROM THE RESOLVED PLAY REUSE BUTTON.
     * THIS TIME SPONSOR IS ATTACHED TO BOTTOM EDITOR.
     */

    let { reusePlay } = this.props.CommandHostStore
    if (reusePlay) {
      if (
        reusePlay.announcements &&
        Array.isArray(JSON.parse(JSON.stringify(reusePlay.announcements)))
      ) {
        const _announcements = JSON.parse(
          JSON.stringify(reusePlay.announcements)
        )
        this.quillHeader.root.innerHTML = _announcements[0].value
        this.quillMiddle.root.innerHTML = _announcements[1].value
        this.quillBottom.root.innerHTML = _announcements[2].value

        document.getElementsByClassName(
          `${this.reference}-header-readonly`
        )[0].innerHTML = _announcements[0].value
        document.getElementsByClassName(
          `${this.reference}-middle-readonly`
        )[0].innerHTML = _announcements[1].value
        document.getElementsByClassName(
          `${this.reference}-bottom-readonly`
        )[0].innerHTML = _announcements[2].value
      }

      if (reusePlay.sponsor && Object.keys(reusePlay.sponsor).length > 0) {
        this.handleSelectedSponsor(
          this.quillBottom,
          `editor-readonly-3-Announce-${this.props.AutomationStore.playSequence}-brand-drop`,
          reusePlay.sponsor,
          `editor-readonly-3-Announce-${this.props.AutomationStore.playSequence}-brand-option-${reusePlay.sponsor.id}`,
          `-brand-option-${reusePlay.sponsor.id}`
        )
      }
    }
  }

  validateFields() {
    const strippedHeader = this.quillHeader.root.innerHTML
      .toString()
      .replace(/(<([^>]+)>)/gi, '')
    const strippedMiddle = this.quillMiddle.root.innerHTML
      .toString()
      .replace(/(<([^>]+)>)/gi, '')
    const strippedBottom = this.quillBottom.root.innerHTML
      .toString()
      .replace(/(<([^>]+)>)/gi, '')

    // if (this.GoButtonRef) {
    //   if (
    //     strippedHeader.trim().length < 1 &&
    //     strippedMiddle.trim().length < 1 &&
    //     (strippedBottom.trim().length < 1 && !this.props.item.sponsor)
    //   ) {
    //     TweenMax.set(this.GoButtonRef, {
    //       filter: 'grayscale(1)',
    //       cursor: 'default',
    //       pointerEvents: 'none',
    //     })
    //   } else {
    //     if (this.props.GameStore.progress === 'live') {
    //       TweenMax.set(this.GoButtonRef, {
    //         filter: 'grayscale(0)',
    //         cursor: 'pointer',
    //         pointerEvents: 'auto',
    //       })
    //     } else {
    //       TweenMax.set(this.GoButtonRef, {
    //         filter: 'grayscale(1)',
    //         cursor: 'default',
    //         pointerEvents: 'none',
    //       })
    //     }
    //   }
    // }

    if (this.GoButtonRef) {
      if (
        this.interceptedSessionStarted &&
        this.interceptedProgress === 'live'
      ) {
        //START - AUTOMATION HACK FOR INTERCEPT
        if (
          strippedHeader.trim().length < 1 &&
          strippedMiddle.trim().length < 1 &&
          strippedBottom.trim().length < 1 &&
          !this.props.item.sponsor
        ) {
          TweenMax.set(this.GoButtonRef, {
            filter: 'grayscale(1)',
            cursor: 'default',
            pointerEvents: 'none',
          })
        } else {
          if (this.interceptedProgress === 'live') {
            TweenMax.set(this.GoButtonRef, {
              filter: 'grayscale(0)',
              cursor: 'pointer',
              pointerEvents: 'auto',
            })
          } else {
            TweenMax.set(this.GoButtonRef, {
              filter: 'grayscale(1)',
              cursor: 'default',
              pointerEvents: 'none',
            })
          }
        }
        //END - AUTOMATION HACK FOR INTERCEPT
      } else {
        if (
          this.props.GameStore.progress === 'live' &&
          this.props.GameStore.executionType === 'recording' &&
          this.props.PrePlayStore.sessionButtons['start'] &&
          this.props.PrePlayStore.sessionButtons['start'].text.toLowerCase() ===
            'resume session'
        ) {
          TweenMax.set(this.GoButtonRef, {
            filter: 'grayscale(1)',
            cursor: 'default',
            pointerEvents: 'none',
          })
        } else {
          //NORMAL
          if (
            strippedHeader.trim().length < 1 &&
            strippedMiddle.trim().length < 1 &&
            strippedBottom.trim().length < 1 &&
            !this.props.item.sponsor
          ) {
            TweenMax.set(this.GoButtonRef, {
              filter: 'grayscale(1)',
              cursor: 'default',
              pointerEvents: 'none',
            })
          } else {
            if (this.props.GameStore.progress === 'live') {
              TweenMax.set(this.GoButtonRef, {
                filter: 'grayscale(0)',
                cursor: 'pointer',
                pointerEvents: 'auto',
              })
            } else {
              TweenMax.set(this.GoButtonRef, {
                filter: 'grayscale(1)',
                cursor: 'default',
                pointerEvents: 'none',
              })
            }
          }
        }
      }
    }

    if (this.AddToStackButtonRef) {
      if (
        strippedHeader.trim().length < 1 &&
        strippedMiddle.trim().length < 1 &&
        strippedBottom.trim().length < 1 &&
        !this.props.item.sponsor
      ) {
        TweenMax.set(this.AddToStackButtonRef, {
          filter: 'grayscale(1)',
          cursor: 'default',
          pointerEvents: 'none',
        })
      } else {
        TweenMax.set(this.AddToStackButtonRef, {
          filter: 'grayscale(0)',
          cursor: 'pointer',
          pointerEvents: 'auto',
        })
      }
    }
  }

  render() {
    let { item, index } = this.props
    let { sessionStarted } = this.state
    const automationPlayItemAddStoStackButtonId = `playitem-addtostack-button-Announce-${this.props.AutomationStore.playSequence}`
    // const automationPlayItemGoButtonId = `go-button-Announce-${this.props.AutomationStore.playSequence}`
    const automationPlayItemGoButtonId = `go-button-Announce-`

    const editorReadOnly1Announce = `editor-readonly-1-Announce-${this.props.AutomationStore.playSequence}`
    const editorReadOnly2Announce = `editor-readonly-2-Announce-${this.props.AutomationStore.playSequence}`
    const editorReadOnly3Announce = `editor-readonly-3-Announce-${this.props.AutomationStore.playSequence}`

    const editor1Announce = `editor-1-Announce-${this.props.AutomationStore.playSequence}`
    const editor2Announce = `editor-2-Announce-${this.props.AutomationStore.playSequence}`
    const editor3Announce = `editor-3-Announce-${this.props.AutomationStore.playSequence}`

    const editor3BrandDrop = `editor-readonly-3-Announce-${this.props.AutomationStore.playSequence}-brand-drop`

    const isOtherOperatorCreatingPlay =
      this.props.GameStore.syncSessionCreatePlayResponded ||
      this.props.GameStore.syncCreateSessionResponded ||
      this.props.GameStore.syncCreateInterruptionResponded
    const otherOperator =
      (this.props.GameStore.syncSessionCreatePlayResponded &&
        this.props.GameStore.syncSessionCreatePlayResponded.operator) ||
      (this.props.GameStore.syncCreateSessionResponded &&
        this.props.GameStore.syncCreateSessionResponded.operator) ||
      (this.props.GameStore.syncCreateInterruptionResponded &&
        this.props.GameStore.syncCreateInterruptionResponded.operator)

    return (
      <Container zIndex={1000 - index}>
        <Main>
          <PlayStatusWrapper backgroundColor={'#000000'} />
          <PlayTypeDD>
            <PlayStatusWrapper backgroundColor={'#000000'} />
            <PrePlaySingle text={item.type} />
          </PlayTypeDD>
          <InputsWrapper>
            <Row>
              <RowArea key={0}>
                <EditorReadOnly
                  id={editorReadOnly1Announce}
                  className={`${this.reference}-header-readonly`}
                  onClick={this.toggleEditor.bind(
                    this,
                    'header',
                    'editing',
                    `${this.reference}-header`,
                    `${this.reference}-header-readonly`,
                    editorReadOnly1Announce
                  )}
                  style={{
                    color: this.quillHeaderColor,
                    fontFamily: this.quillHeaderFont,
                  }}
                />
                <Editor
                  //id="announce-editor"
                  id={editor1Announce}
                  className={`${this.reference}-header`}
                  onBlur={this.toggleEditor.bind(
                    this,
                    'header',
                    'locking',
                    `${this.reference}-header`,
                    `${this.reference}-header-readonly`,
                    editor1Announce
                  )}
                  style={{
                    color: this.quillHeaderColor,
                    fontFamily: this.quillHeaderFont,
                  }}
                />
                <DDColor
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
                  defaultColor={this.quillHeaderColor}
                />
                <DDFont
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
                  defaultFont={this.quillHeaderFont}
                />
              </RowArea>

              <RowArea key={1}>
                <EditorReadOnly
                  id={editorReadOnly2Announce}
                  className={`${this.reference}-middle-readonly`}
                  onClick={this.toggleEditor.bind(
                    this,
                    'middle',
                    'editing',
                    `${this.reference}-middle`,
                    `${this.reference}-middle-readonly`,
                    editorReadOnly2Announce
                  )}
                  style={{
                    color: this.quillMiddleColor,
                    fontFamily: this.quillMiddleFont,
                  }}
                />
                <Editor
                  //id="announce-editor"
                  id={editor2Announce}
                  className={`${this.reference}-middle`}
                  onBlur={this.toggleEditor.bind(
                    this,
                    'middle',
                    'locking',
                    `${this.reference}-middle`,
                    `${this.reference}-middle-readonly`,
                    editor2Announce
                  )}
                  style={{
                    color: this.quillMiddleColor,
                    fontFamily: this.quillHeaderFont,
                  }}
                />
                <DDColor
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
                  defaultColor={this.quillMiddleColor}
                />
                <DDFont
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
                  defaultFont={this.quillMiddleFont}
                />
              </RowArea>

              <RowArea key={2}>
                <EditorReadOnly
                  id={editorReadOnly3Announce}
                  className={`${this.reference}-bottom-readonly`}
                  onClick={this.toggleEditor.bind(
                    this,
                    'bottom',
                    'editing',
                    `${this.reference}-bottom`,
                    `${this.reference}-bottom-readonly`,
                    editorReadOnly3Announce
                  )}
                  style={{
                    color: this.quillBottomColor,
                    fontFamily: this.quillBottomFont,
                  }}
                />
                <Editor
                  //id="announce-editor"
                  id={editor3Announce}
                  className={`${this.reference}-bottom`}
                  onBlur={this.toggleEditor.bind(
                    this,
                    'bottom',
                    'locking',
                    `${this.reference}-bottom`,
                    `${this.reference}-bottom-readonly`,
                    editor3Announce
                  )}
                  style={{
                    color: this.quillBottomColor,
                    fontFamily: this.quillHeaderFont,
                  }}
                />
                <DDSponsorWrapper className={`${this.reference}-sponsor`}>
                  <DDAnnounceSponsor
                    height={h}
                    index={`${this.reference}-sponsor`}
                    selectedSponsor={item.sponsor}
                    value={this.handleSelectedSponsor.bind(
                      this,
                      this.quillBottom,
                      editor3BrandDrop
                    )}
                    expanded={item.sponsorExpanded}
                    forId={editorReadOnly3Announce}
                  />
                </DDSponsorWrapper>
                <DDSponsorDrop
                  id={editor3BrandDrop}
                  onClick={this.handleSponsorClick.bind(this, editor3BrandDrop)}
                />
                <DDColor
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
                  defaultColor={this.quillBottomColor}
                />
                <DDFont
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
                  defaultFont={this.quillBottomFont}
                />
              </RowArea>
            </Row>
          </InputsWrapper>
          <LastButtonWrapper>
            <RemoveGoWrapper>
              <AddToStackRemoveWrapper>
                <AddToStackButton
                  id={automationPlayItemAddStoStackButtonId}
                  onClick={this.handleAddToStackClick.bind(
                    this,
                    automationPlayItemAddStoStackButtonId
                  )}
                  innerRef={ref => (this.AddToStackButtonRef = ref)}
                />
              </AddToStackRemoveWrapper>
              <GoButton
                id={automationPlayItemGoButtonId}
                locked={!sessionStarted}
                onClick={
                  !sessionStarted
                    ? null
                    : this.handleGoClick.bind(
                        this,
                        automationPlayItemGoButtonId
                      )
                }
                innerRef={ref => (this.GoButtonRef = ref)}
              />
            </RemoveGoWrapper>
          </LastButtonWrapper>
        </Main>
        {/*
// UNCOMMENT THIS IF YOU WANT OTHER OPERATORS
// CANNOT EDIT THE PLAY YOU ARE CREATING.
        {isOtherOperatorCreatingPlay ? (
          <Blocker>
            <Bottom>
              <span>
                OPERATOR {(otherOperator || '').toUpperCase()} IS CREATING A
                PLAY.
              </span>
              <Arrow></Arrow>
            </Bottom>
          </Blocker>
        ) : null}
*/}
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
  position: relative;
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
  width: 75%;
  height: inherit;
`

const AddToStackButton = styled.div`
  width: 100%;
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
  //background-color: ${props => (props.locked ? '#18c5ff' : '#000000')};
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  -webkit-filter: ${props => (props.locked ? 'grayscale(1)' : 'grayscale(0)')};
  //opacity: ${props => (props.locked ? 0.4 : 1)};
  position: relative;
  &:after {
    content: 'GO';
    //color: ${props => (props.locked ? '#000000' : '#18c5ff')};
    color: #18c5ff;
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
  flex-direction: row;
  justify-content: space-between;
`

const DDSponsorWrapper = styled.div`
  width: 100%;
  position: relative;
  display: none;
`
const DDSponsorDrop = styled.div`
  width: ${props => 2}vh;
  height: ${props => h}vh;
  background-color: #bcbec0;
  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-size: ${props => 1.5}vh;
  background-position: bottom;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`

const Blocker = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  padding-right: 2vh;
`

const Bottom = styled.div`
  width: 40vh;
  top: 7vh;
  padding: 10px 20px;
  // color:#444444;
  // background-color:#EEEEEE;
  color: #fff;
  background-color: #ff0000;
  font-family: pamainregular;
  font-weight: normal;
  font-size: 2.2vh;
  border-radius: 1vh;
  position: absolute;
  z-index: 99999999;

  box-sizing: border-box;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;
`

const Arrow = styled.div`
  position: absolute;
  bottom: 100%;
  left: 70%;
  width: 4vh;
  height: 2vh;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    width: 2vh;
    height: 2vh;
    left: 50%;
    transform: translate(-50%, 50%) rotate(45deg);
    background-color: #ff0000;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
  }
`
