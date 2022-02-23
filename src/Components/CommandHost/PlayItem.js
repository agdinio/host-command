import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable, runInAction, intercept } from 'mobx'
import styled, { keyframes } from 'styled-components'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import LockIcon from '@/assets/images/icon-lock-black.svg'
import DDSponsorBrand from '@/Components/CommandHost/Common/DDSponsorBrand'
import DDStar from '@/Components/CommandHost/Common/DDStar'
import DDAward from '@/Components/CommandHost/Common/DDAward'
import DDTeam from '@/Components/CommandHost/Common/DDTeam'
import TeamItem from '@/Components/CommandHost/Common/TeamItem'
import { vhToPx, guid } from '@/utils'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@inject(
  'PrePlayStore',
  'PlayStore',
  'GameStore',
  'CommandHostStore',
  'AutomationStore'
)
@observer
export default class PlayItem extends Component {
  constructor(props) {
    super(props)
    FONT_SIZE = this.props.CommandHostStore.fontSize + 'vh'
    extendObservable(this, {
      required: false,
      multiplier: 1,
      optionCount: 1,
      preItem: null,
      initStarValue: false,
      show: false,
      values: {
        index: 0,
        type: '',
        playTitle: { id: 0, value: '' },
        preset: {},
        choices: [],
        multiplierChoices: [],
        stars: 0,
        length: 0,
        award: '',
        team: {},
        sponsor: { length: 5 },
        showNextPlayAd: false,
        nextPlayType: null,
        isPresetTeamChoice: false,
        lockedReuse: false,
        starMax: 0,
      },
      syncStarObj: {
        isSync: false,
        value: 0,
      },
      syncSponsorObj: {
        isSync: false,
        value: null,
      },
      syncTeamObj: {
        isSync: false,
        value: null,
      },
    })

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
          this.checkRequired()
        }
        return change
      }
    )

    this.destroySyncInput = intercept(
      this.props.GameStore,
      'syncInput',
      change => {
        if (change.newValue) {
          this.syncQuestionChange(change.newValue)
        }
        return change
      }
    )
    this.destroySyncDD = intercept(this.props.GameStore, 'syncDD', change => {
      if (change.newValue) {
        this.syncStarObj = {
          isSync: false,
          value: 0,
        }
        this.syncSponsorObj = {
          isSync: false,
          value: null,
        }
        this.syncTeamObj = {
          isSync: false,
          value: null,
        }
        this.values.stars = 0

        switch (change.newValue.args.comp) {
          case 'preset':
            const el = document.querySelector(
              '.' + change.newValue.args.className
            )
            if (el) {
              el.value = change.newValue.args.value
              el.dispatchEvent(new Event(change.newValue.args.event))
              this.updateChoices(change.newValue.args.value)
            }
            break
          case 'star':
            // this.syncStarObj = {
            //   isSync: true,
            //   value: change.newValue.args.value,
            // }
            // this.initStarValue = false
            // this.values.stars = change.newValue.args.value
            // this.props.previewValue(this.values)
            if (
              change.newValue.operator &&
              change.newValue.operator !== this.props.GameStore.operator
            ) {
              this.handleStarValue({
                syncGuid: change.newValue.syncGuid,
                value: change.newValue.args.value,
              })
            }
            break
          case 'sponsor':
            this.syncSponsorObj = {
              isSync: true,
              value: change.newValue.args.value,
            }
            this.values.sponsor = change.newValue.args.value
            break
          case 'team':
            this.syncTeamObj = {
              isSync: true,
              value: change.newValue.args.value,
            }
            break
        }
      }
      return change
    })

    this.destroySyncCreatePlayStar = intercept(
      this.props.GameStore,
      'syncCreatePlayStar',
      change => {
        if (change.newValue) {
          if (
            change.newValue.operator &&
            change.newValue.operator !== this.props.GameStore.operator
          ) {
            this.handleStarValue({
              syncGuid: change.newValue.syncGuid,
              value: change.newValue.args.value,
            })
          }
        }
        return change
      }
    )
  }

  setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set
    const prototype = Object.getPrototypeOf(element)
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      'value'
    ).set

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value)
    } else {
      valueSetter.call(element, value)
    }
  }

  updateChoices(opVal) {
    if (opVal > 0) {
      this.preItem = this.props.PrePlayStore.presetItems.filter(
        o => o.id === parseInt(opVal)
      )[0]
      if (this.preItem) {
        this.values.preset = this.preItem
        this.values.isPresetTeamChoice = this.preItem.preset.match('TEAMS')
          ? true
          : false

        this.values['playTitle'].id = this.preItem.id
        this.values['playTitle'].value =
          (this.values.type || '').toUpperCase() !== 'LIVEPLAY'
            ? this.values['playTitle'].value
            : this.preItem.question
        this.optionCount = this.preItem.choices.length
        this.props.PrePlayStore.pullMultiplierChoices(parseInt(opVal)).then(
          data => {
            this.props.PrePlayStore.getStarMax(data).then(res => {
              this.values['starMax'] = res
            })

            this.values.multiplierChoices = data
            if (this.values.isPresetTeamChoice) {
              for (let i = 0; i < this.values.multiplierChoices.length; i++) {
                this.values.multiplierChoices[i].choices = JSON.parse(
                  JSON.stringify(this.values.choices)
                )
              }
            }
          }
        )

        this.resetChoiceInputs()
        this.checkRequired()
        this.props.previewValue(this.values)
      }
    }
  }

  handleDDOptionChange(refId) {
    if (refId) {
      this.props.GameStore.syncRequest({
        processName: 'DD_CHANGE',
        syncGuid: 'ddpreset123',
        operator: this.props.GameStore.operator,
        args: {
          comp: 'preset',
          className: 'playitem-dd-preset',
          event: 'change',
          value: this.refDDPreset.value,
        },
      })
    }

    let optionValue = 0
    let reusePlayTitle = '',
      reuseStars = 0,
      reuseSponsor = null
    if (
      this.props.CommandHostStore.reusePlay &&
      this.props.CommandHostStore.reusePlay.preset &&
      this.props.CommandHostStore.reusePlay.preset.id
    ) {
      optionValue = this.props.CommandHostStore.reusePlay.preset.id
      reusePlayTitle = this.props.CommandHostStore.reusePlay.playTitle
        ? this.props.CommandHostStore.reusePlay.playTitle.value
        : ''
      reuseStars = this.props.CommandHostStore.reusePlay.stars || 0
      reuseSponsor = this.props.CommandHostStore.reusePlay.sponsor
      this.props.PrePlayStore.setSelectedSponsor(
        this.props.CommandHostStore.reusePlay.sponsor
      )
      this.props.CommandHostStore.setReusePlay(null)
      this.initStarValue = false
    } else {
      const ddoption = document.getElementById(refId)
      if (ddoption) {
        optionValue = ddoption.value
      }
      this.props.PrePlayStore.setSelectedSponsor(null)
      this.initStarValue = true
    }

    if (optionValue > 0) {
      this.preItem = this.props.PrePlayStore.presetItems.filter(
        o => o.id === parseInt(optionValue)
      )[0]
      if (this.preItem) {
        this.props.AutomationStore.addEvent({
          evt: 'select',
          refId: refId,
          wait: 0.5,
          value: optionValue,
        })
        this.values.preset = this.preItem
        this.values.isPresetTeamChoice = this.preItem.preset.match('TEAMS')
          ? true
          : false

        this.values['playTitle'].id = this.preItem.id
        //this.values['playTitle'].value = this.preItem.question || this.values['playTitle'].value
        if (reusePlayTitle) {
          this.values['playTitle'].value = reusePlayTitle
        } else {
          this.values['playTitle'].value =
            (this.values.type || '').toUpperCase() !== 'LIVEPLAY'
              ? this.values['playTitle'].value
              : this.preItem.question
        }
        this.values['stars'] = reuseStars
        this.values['sponsor'] = reuseSponsor || null
        this.values['sponsorId'] = reuseSponsor ? reuseSponsor.id : 0
        this.optionCount = this.preItem.choices.length
        this.props.PrePlayStore.pullMultiplierChoices(
          parseInt(optionValue)
        ).then(data => {
          this.props.PrePlayStore.getStarMax(data).then(res => {
            this.values['starMax'] = res
          })

          this.values.multiplierChoices = data
          if (this.values.isPresetTeamChoice) {
            for (let i = 0; i < this.values.multiplierChoices.length; i++) {
              this.values.multiplierChoices[i].choices = JSON.parse(
                JSON.stringify(this.values.choices)
              )
            }
          }
        })

        this.resetChoiceInputs()
        this.checkRequired()
        this.props.previewValue(this.values)
      }
    }
  }

  handleDDTimerModeChange(e) {
    this.values['length'] = parseInt(e.target.value)
  }

  syncQuestionChange(params) {
    this.values['playTitle'].value = params.args.input
    this.checkRequired()
    this.props.previewValue(this.values)
  }

  handleQuestionChange(e) {
    this.values['playTitle'].value = e.target.value
    this.checkRequired()
    this.props.previewValue(this.values)

    this.props.GameStore.syncRequest({
      processName: 'INPUT_CHANGE',
      syncGuid: 'input123',
      operator: this.props.GameStore.operator,
      args: { input: e.target.value },
    })
  }

  handleQuestionBlur(refId, e) {
    this.props.AutomationStore.addTempPlayEvent({
      evt: 'input',
      refId: refId,
      wait: 0.5,
      value: e.target.value,
    })
  }

  handleStarValue(val) {
    let _val = 0

    if (/^\d*\.?\d+$/.test(val)) {
      _val = val
      this.props.GameStore.syncRequest({
        processName: 'DD_CHANGE_STAR',
        syncGuid: guid(),
        operator: this.props.GameStore.operator,
        args: { comp: 'star', value: _val },
      })
    } else {
      _val = val.value
    }

    this.initStarValue = false
    this.values.stars = _val
    this.props.previewValue(this.values)
  }

  handleAutomationAddEvent(params) {
    this.props.AutomationStore.addTempPlayEvent(params)
  }

  handleAutomationAddEventBrand(params) {
    this.props.AutomationStore.addTempPlayEvent(params)
  }

  handleSponsorValue(val) {
    this.values.sponsor = val

    this.props.GameStore.syncRequest({
      processName: 'DD_CHANGE',
      syncGuid: 'sponsor123',
      operator: this.props.GameStore.operator,
      args: { comp: 'sponsor', value: val },
    })
  }

  handleChoiceClick(i, e) {
    this.values.choices[i].value = e.target.value
    this.checkRequired()
  }

  handleChoiceBlur(refId, e) {
    //this.props.AutomationStore.addEvent({evt:'input', refId: refId, wait: 0.5, value: e.target.value})
    this.props.AutomationStore.addTempPlayEvent({
      evt: 'input',
      refId: refId,
      wait: 0.5,
      value: e.target.value,
    })
  }

  handleTeamValue(val) {
    this.values.team = val
    this.props.previewValue(this.values)

    this.props.GameStore.syncRequest({
      processName: 'DD_CHANGE',
      syncGuid: 'sponsor123',
      operator: this.props.GameStore.operator,
      args: { comp: 'team', value: val },
    })
  }

  async handleAddToStackClick(refId) {
    let { GameStore, AutomationStore } = this.props

    if ('recording' === GameStore.executionType && GameStore.sessionMode) {
      const editorEvents = []
      for (
        let i = 0;
        i < this.props.AutomationStore.tempPlayEvents.length;
        i++
      ) {
        const event = this.props.AutomationStore.tempPlayEvents[i]

        if (
          event.evt === 'input' &&
          event.refId.includes('playitem-choice-input')
        ) {
          editorEvents.push(event)
        }
        if (
          event.evt === 'input' &&
          event.refId.includes('playitem-question-input')
        ) {
          editorEvents.push(event)
        }
        if (
          event.evt === 'click' &&
          event.refId.includes('dropdown-star-select')
        ) {
          if (!event.doNotSave) {
            editorEvents.push(event)
          }
          const starOption = await this.props.AutomationStore.tempPlayEvents.filter(
            o => o.refId.includes('dropdown-star-option')
          )[0]
          if (starOption) {
            editorEvents.push(starOption)
          }
        }
        if (
          event.evt === 'click' &&
          event.refId.includes('dropdown-sponsor-select')
        ) {
          editorEvents.push(event)
          const eventOption = await this.props.AutomationStore.tempPlayEvents.filter(
            o => o.refId.includes('dropdown-sponsor-option')
          )[0]
        }
        if (
          event.evt === 'click' &&
          event.refId.includes('dropdown-team-select')
        ) {
          editorEvents.push(event)
          const teamOption = await this.props.AutomationStore.tempPlayEvents.filter(
            o => o.refId.includes('dropdown-team-option')
          )[0]
          if (teamOption) {
            editorEvents.push(teamOption)
          }
        }
      }

      this.values.executionType = 'recording'
      this.values.editorEvents = editorEvents
      /*
      COMMENTED BY: AURELIO
      DATE: 09012021
      this.values.recordedAutomation = {
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
*/
      AutomationStore.resetCurrentTime()
    }

    if ('automation' === GameStore.executionType && GameStore.sessionMode) {
      if (GameStore.recordedPlays && GameStore.recordedPlays.length > 0) {
        const recordedPlay = await GameStore.recordedPlays.filter(
          o => o.ref_id === refId && o.event === 'click'
        )[0]
        if (recordedPlay) {
          if (!this.values.id) {
            this.values.executionType = 'automation'
            this.values.id = recordedPlay.play_id
          }
        }
        ++AutomationStore.sequence
      }
    }

    if (GameStore.sessionMode) {
      AutomationStore.incrementPlaySequence()
    }

    this.props.addToStackValues(this.values)
  }

  handleInitAwardValueChange(val) {
    this.values.award = val
    this.values.points =
      val.awardValues && val.awardValues.points ? val.awardValues.points : 0
    this.values.tokens =
      val.awardValues && val.awardValues.tokens ? val.awardValues.tokens : 0
  }

  handleAwardValueChange(val) {
    this.values.award = val
    this.values.points =
      val.awardValues && val.awardValues.points ? val.awardValues.points : 0
    this.values.tokens =
      val.awardValues && val.awardValues.tokens ? val.awardValues.tokens : 0
  }

  setRequired(val) {
    this.required = val ? false : true
  }

  checkRequired() {
    this.required = false
    if (!this.values['playTitle'].value) {
      this.required = true
    }

    for (let i = 0; i < this.values.choices.length; i++) {
      if (!this.values.choices[i].value) {
        this.required = true
      }
    }
  }

  async handleGoClick(refId) {
    this.values.isNew = true

    let { GameStore, AutomationStore } = this.props
    if ('recording' === GameStore.executionType && GameStore.sessionMode) {
      this.values.executionType = 'recording'
      this.values.recordedAutomation = {
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

    if (GameStore.sessionMode) {
      AutomationStore.incrementPlaySequence()
    }

    this.props.go(this.values)
  }

  resetChoiceInputs() {
    // this.values.choices = []
    // for (let i = 0; i < this.preItem.choices.length; i++) {
    //   let inputVal =this.preItem.choices[i]
    //   this.values.choices.push(inputVal)
    // }

    this.values.choices = JSON.parse(JSON.stringify(this.preItem.choices))
  }

  OptionInputs() {
    let comp = []
    let reference = 'playitem-choice-'

    if (this.preItem) {
      if ('A-B (TEAMS)' === this.preItem.preset.trim().toUpperCase()) {
        //if ('A-B (TEAMS), A-B (Y/N)'.match(this.preItem.preset.trim().toUpperCase())) {
        for (let i = 0; i < this.props.PrePlayStore.teams.length; i++) {
          const automationChoiceBlurId = `playitem-choice-input-${i}-${this.props.AutomationStore.playSequence}-ab`
          const t = this.props.PrePlayStore.teams[i]
          runInAction(
            () => (this.values.choices[i] = { id: t.id, value: t.teamName })
          )
          comp.push(
            <TeamItemWrapper
              key={reference + i}
              marginRight={i < this.props.PrePlayStore.teams.length - 1}
            >
              <TeamItem
                team={t}
                backgroundColor={PlayColors[this.values.type]}
              />
            </TeamItemWrapper>
          )
        }
      } else {
        for (let i = 0; i < this.preItem.choices.length; i++) {
          const automationChoiceBlurId = `playitem-choice-input-${i}-${this.props.AutomationStore.playSequence}-multi`
          comp.push(
            <OptionInputDiv
              key={reference + i}
              marginRight={i < this.preItem.choices.length - 1}
            >
              <OptionInput
                id={automationChoiceBlurId}
                readOnly={this.preItem.readOnly}
                color={'#ffffff'}
                backgroundColor={PlayColors[this.values.type]}
                value={
                  this.values.choices[i]
                    ? this.values.choices[i].value || ''
                    : ''
                }
                onChange={this.handleChoiceClick.bind(this, i)}
                onBlur={this.handleChoiceBlur.bind(
                  this,
                  automationChoiceBlurId
                )}
              />
            </OptionInputDiv>
          )
        }
      }

      return comp
    }

    return null
  }

  componentDidUpdate(prevProps) {
    // if (
    //   !deepEqual(this.values.sponsor, this.props.PrePlayStore.selectedSponsor)
    // ) {
    //   this.values.sponsor = this.props.PrePlayStore.selectedSponsor
    // }
  }

  initialize() {
    return new Promise(async resolve => {
      if (this.props.resetValue.preset) {
        // const byRef = await this.props.PrePlayStore.getPresetItemById(this.props.resetValue.preset.id)
        // if (byRef) {
        //   if (!byRef.type.match(new RegExp('live', 'gi'))) {
        //     byRef.question = ''
        //   }
        // }
        const byRef = await this.props.PrePlayStore.presetItems.filter(
          o => o.id === this.props.resetValue.preset.id
        )[0]
        if (byRef) {
          if (this.props.resetValue.type.toLowerCase() !== 'liveplay') {
            byRef.question = ''
          }
        }
        this.preItem = JSON.parse(JSON.stringify(byRef))
        this.values['type'] = this.props.resetValue.type
        this.values['playTitle'] = this.props.resetValue.playTitle
        this.values['preset'] = this.props.resetValue.preset
        this.values['choices'] = this.props.resetValue.choices
        this.values['stars'] = this.props.resetValue.stars
        this.values['length'] = this.props.resetValue.length
        this.values['award'] = this.props.resetValue.award
        this.values['team'] = this.props.resetValue.team
        this.values['sponsor'] = this.props.resetValue.sponsor
        this.values['showNextPlayAd'] = this.props.resetValue.showNextPlayAd
        this.values['starMax'] = this.props.resetValue.starMax
      } else {
        const byRef = await this.props.PrePlayStore.presetItems.filter(
          o => o.type.match(this.props.resetValue.type) && !o.isMultiplier
        )[0]
        if (byRef) {
          if (this.props.resetValue.type.toLowerCase() !== 'liveplay') {
            byRef.question = ''
          }
          this.preItem = JSON.parse(JSON.stringify(byRef))
          this.values['playTitle'].id = this.preItem.id
          this.values['playTitle'].value = this.preItem.question
          this.values['preset'] = byRef
        }

        this.values['type'] = this.props.resetValue.type
        this.resetChoiceInputs()

        this.values['length'] = 0
        this.values['team'] = this.props.PrePlayStore.selectedTeam
        this.values['starMax'] = this.props.resetValue.starMax
      }

      await this.props.PrePlayStore.pullMultiplierChoices(
        parseInt(this.preItem.id)
      ).then(data => {
        this.values.multiplierChoices = data
        this.props.PrePlayStore.getStarMax(data).then(res => {
          this.values['starMax'] = res
        })
      })

      await this.setRequired(this.values.playTitle)
      await this.setRequired(this.preItem.question)

      return resolve(true)
    })
  }

  componentWillUnmount() {
    this.preItem = null
    this.show = false
    this.props.previewValue({})
    try {
      this.destroyProgress()
      this.destroySyncInput()
      this.destroySyncDD()
      this.destroySyncCreatePlayStar()
    } catch (e) {}
  }

  componentDidMount() {
    //-----------------------------this.handleDDOptionChange()
    this.initialize().then(async next => {
      if (next) {
        delete this.values.editorEvents

        if (
          this.props.CommandHostStore.reusePlay &&
          this.props.CommandHostStore.reusePlay.preset &&
          this.props.CommandHostStore.reusePlay.preset.id
        ) {
          await this.handleDDOptionChange(
            `header-dd-option-${this.values.index}-${this.props.AutomationStore.playSequence}`
          )
        }

        this.show = true
      }
    })
  }

  render() {
    let { sessionStarted } = this.state
    let preItems = this.props.PrePlayStore.getPresetItemsByType(
      this.values.type
    )
    let bg = PlayColors[this.values.type]
    const teamEmpty =
      !this.values.team || (this.values.team && !this.values.team.id)
    const isGameNotStarted =
      this.props.GameStore.progress === 'live' ? false : true

    const headerDDSelectTypeId = `header-dd-option-${this.values.index}-${this.props.AutomationStore.playSequence}`
    const automationPlayItemAddStoStackButtonId = `playitem-addtostack-button-${this.values.type}-${this.props.AutomationStore.playSequence}`
    const automationQuestionInputId = `playitem-question-input-${this.values.type}-${this.props.AutomationStore.playSequence}`
    const automationPlayItemGoButtonId = `go-button-${this.values.type}-`

    if (!this.show) {
      return null
    }

    return (
      <Container>
        <Main>
          <PlayStatusWrapper />
          <PlayTypeDD>
            <PrePlaySingle backgroundColor={bg} text={this.values.type} />
          </PlayTypeDD>
          <DDSelectType
            innerRef={ref => (this.refDDPreset = ref)}
            id={headerDDSelectTypeId}
            className="playitem-dd-preset"
            onChange={this.handleDDOptionChange.bind(
              this,
              headerDDSelectTypeId
            )}
            value={this.preItem.id}
          >
            {preItems.map((item, i) => {
              return (
                <option key={i} value={item.id}>
                  {item.preset}
                </option>
              )
            })}
          </DDSelectType>
          <QuestionInput
            id={automationQuestionInputId}
            type="text"
            value={this.values.playTitle.value}
            onChange={this.handleQuestionChange.bind(this)}
            onBlur={this.handleQuestionBlur.bind(
              this,
              automationQuestionInputId
            )}
          />
          <OptionInputsWrapper>{this.OptionInputs()}</OptionInputsWrapper>
          <StarWrapper>
            <DDStar
              key={`playitem-star-${this.values.stars}`}
              initStarVal={this.initStarValue}
              item={this.values}
              height={h}
              index={'playitem-' + this.values.index}
              value={this.handleStarValue.bind(this)}
              // syncStarObj={this.syncStarObj}
              automationAddEvent={this.handleAutomationAddEvent.bind(this)}
            />
          </StarWrapper>
          <SponsorBrandWrapper>
            <DDSponsorBrand
              item={this.values}
              height={h}
              index={'playitem-' + this.values.index}
              selectedSponsor={this.props.PrePlayStore.selectedSponsor}
              value={this.handleSponsorValue.bind(this)}
              syncSponsorObj={this.syncSponsorObj}
              automationAddEvent={this.handleAutomationAddEventBrand.bind(this)}
              isPlayItem={true}
            />
          </SponsorBrandWrapper>
          <AwardWrapper>
            <DDAward
              item={this.values}
              height={h}
              index={'playitem-' + this.values.index}
              initValue={this.handleInitAwardValueChange.bind(this)}
              value={this.handleAwardValueChange.bind(this)}
            />
          </AwardWrapper>
          <PlayOrTimerWrapper>
            <PlayMode src={LockIcon} />
          </PlayOrTimerWrapper>
          {/*
          <PlayOrTimerWrapper>
            {'LIVEPLAY' === this.values.type.toUpperCase() ? (
              <PlayMode src={LockIcon} />
            ) : (
              <DDTimerMode
                value={this.values.length}
                onChange={this.handleDDTimerModeChange.bind(this)}
              >
                <option value={0}>PLAY</option>
                <option value={10}>10 s</option>
                <option value={15}>15 s</option>
              </DDTimerMode>
            )}
          </PlayOrTimerWrapper>
*/}
          <TeamWrapper>
            <DDTeam
              //for future use: presetToNone={this.values.isPresetTeamChoice}
              //for future use: locked={this.values.isPresetTeamChoice}
              item={this.values}
              height={h}
              index={'playitem-' + this.values.index}
              teams={this.props.PrePlayStore.teams}
              syncTeamObj={this.syncTeamObj}
              playItemValue={this.handleTeamValue.bind(this)}
              headerSelectedTeam={this.props.headerSelectedTeam}
              automationAddEvent={this.handleAutomationAddEvent.bind(this)}
            />
          </TeamWrapper>
          <LastButtonWrapper>
            <AddToStackButton
              id={automationPlayItemAddStoStackButtonId}
              locked={this.required || teamEmpty}
              onClick={
                this.required || teamEmpty
                  ? null
                  : this.handleAddToStackClick.bind(
                      this,
                      automationPlayItemAddStoStackButtonId
                    )
              }
            />
            <GoButton
              //locked={this.required || teamEmpty || isGameNotStarted}
              //onClick={this.required || teamEmpty || isGameNotStarted ? null : this.handleGoClick.bind(this)}
              // locked={true}
              id={automationPlayItemGoButtonId}
              locked={this.required || teamEmpty || !sessionStarted}
              onClick={
                this.required || teamEmpty || !sessionStarted
                  ? null
                  : this.handleGoClick.bind(this, automationPlayItemGoButtonId)
              }
            />
          </LastButtonWrapper>
        </Main>

        <Sub id={`sub-container-${this.values.index}`} />

        {/*
// UNCOMMENT THIS IF YOU WANT OTHER OPERATORS
// CANNOT EDIT THE PLAY YOU ARE CREATING.
        {this.props.GameStore.syncSessionCreatePlayResponded ? (
          <Blocker>
            <Bottom>
              <span>
                OPERATOR{' '}
                {(
                  this.props.GameStore.syncSessionCreatePlayResponded
                    .operator || ''
                ).toUpperCase()}{' '}
                IS CREATING A PLAY.
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
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
  margin-top: ${props => 0.1}vh;
  margin-bottom: ${props => 0.1}vh;
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

const Sub = styled.div`
  width: 90%;
  background: yellow;
`

const PrePlaySingle = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: ${props => props.backgroundColor};
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

const PlayTypeDD = styled.div`
  width: 8%;
  display: flex;
`
const PlayStatusWrapper = styled.div`
  width: 3%;
  height: ${props => h}vh;
  background: black;
`

const QuestionInput = styled.input`
  width: 16%;
  height: inherit;
  border: ${props => 0.05}vh;
  outline: none;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  //--border: ${props => 0.1}vh solid #231f20;
  text-indent: 1vh;
`

const DDSelectType = styled.select`
  width: 7%;
  height: ${props => h}vh;
  background-color: #e5e5e5;
  outline: none;
  border: none;
  -webkit-appearance: none;

  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => -0.5}vh right;
  background-size: ${props => 2}vh;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  color: #000000;
  line-height: 1;
  text-transform: uppercase;
  text-align-last: center;
`

const OptionInputsWrapper = styled.div`
  width: 20%;
  height: inherit;
  display: flex;
  justify-content: space-between;
`

const OptionInputDiv = styled.div`
  width: 100%;
  height: inherit;
  ${props => (props.marginRight ? `margin-right:${0.2}vh` : ``)};
`

const OptionInput = styled.input`
  width: 100%;
  height: inherit;
  background-color: ${props => props.backgroundColor};
  text-align: center;
  border: none;
  outline: none;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: ${props => props.color};
`

const StarWrapper = styled.div`
  width: 2.6%;
  height: ${props => h}vh;
  position: relative;
`
const SponsorBrandWrapper = styled.div`
  width: 13%;
  height: ${props => h}vh;
  position: relative;
`

const AwardWrapper = styled.div`
  width: 8%;
  height: ${props => h}vh;
  position: relative;
`

const PlayOrTimerWrapper = styled.div`
  width: 4.4%;
  height: inherit;
`

const TeamWrapper = styled.div`
  width: 8%;
  height: inherit;
  border-left: ${props => 0.2}vh solid black;
  position: relative;
`

const TeamItemWrapper = styled.div`
  width: 100%;
  height: inherit;
  ${props => (props.marginRight ? `margin-right:${0.2}vh` : ``)};
`

const PlayMode = styled.div`
  width: 100%;
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
    background-size: 45%;
    background-position: center;
  }
`

const DDTimerMode = styled.select`
  width: inherit;
  height: inherit;
  outline: none;
  border: none;
  -webkit-appearance: none;

  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom -0.5vh right;
  background-size: 2vh;
  font-family: pamainbold;
  color: #000000;
  line-height: 1;
  text-align-last: center;
  font-weight: bold;
`

const AddToStackButton = styled.div`
  width: 75%;
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
  position: relative;
  &:after {
    content: 'GO';
    color: #18c5ff;
  }
`

const LastButtonWrapper = styled.div`
  width: 10%;
  display: flex;
  justify-content: space-between;
`

const Blocker = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
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
