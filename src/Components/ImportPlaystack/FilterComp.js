import React, { Component } from 'react'
import styled from 'styled-components'
import { evalImage } from '@/utils'
import ArrowDownIcon from '@/assets/images/icon-arrow-down.svg'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const GameEventStore = {
  values: {
    sportType: null,
  },
  sportTypes: [],
}

@inject('ImportStore')
@observer
export default class FilterComp extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      isFindingSportType: false,
      sportTypeNoHover: false,
      args: {
        sportType: this.props.args.sportType,
        subSportGenre: '',
        stage: '',
        season: '',
        startDate: new Date(),
        endDate: '',
        dateBracket: '',
      },
      isCustomDate: false,
    })

    this.sportTypes = []
    this.seasons = []
    this.participants = []
  }

  componentDidMount() {
    this.isFindingSportType = true
    this.props.ImportStore.getImportFilterArgs({
      sportType: this.props.args.sportType,
      subSportGenre: this.props.args.subSportGenre,
    }).then(async data => {
      if (!data.data.data || (data.data.data && data.data.data.length < 1)) {
        return
      }
      for (let i = 0; i < data.data.data[0].length; i++) {
        const raw = await data.data.data[0][i]
        const existingSportType = await this.sportTypes.filter(
          o => o.id === raw.sportTypeId
        )[0]
        if (existingSportType) {
          if (
            existingSportType.subSportGenres &&
            Array.isArray(existingSportType.subSportGenres)
          ) {
            const existingSubSportGenre = await existingSportType.subSportGenres.filter(
              o => o.code === raw.subSportGenreCode
            )[0]
            if (!existingSubSportGenre) {
              existingSportType.subSportGenres.push({
                name: raw.subSportGenreName,
                code: raw.subSportGenreCode,
                sequence: raw.subSportSequence,
              })
            }
          }
        } else {
          const newSubSportGenres = []
          await newSubSportGenres.push({
            name: raw.subSportGenreName,
            code: raw.subSportGenreCode,
            sequence: raw.subSportSequence,
          })
          this.sportTypes.push({
            id: raw.sportTypeId,
            name: raw.sportTypeName,
            code: raw.sportTypeCode,
            subSportGenres: newSubSportGenres,
          })
        }
      }

      this.args.subSportGenre =
        this.sportTypes && this.sportTypes[0]
          ? this.sportTypes[0].subSportGenres[0].code
          : ''

      if (data.data.data[1] && Array.isArray(data.data.data[1])) {
        this.seasons = data.data.data[1]
      }

      if (data.data.data[2] && Array.isArray(data.data.data[2])) {
        for (let j = 0; j < data.data.data[2].length; j++) {
          const raw = await data.data.data[2][j]
          if (raw.team) {
            let vs = ''
            const ts = await raw.team.split(',')
            ts.forEach((t, idx) => {
              if (idx + 1 < ts.length) {
                vs = vs + `[${t.toUpperCase()}] vs `
              } else {
                vs = vs + `[${t.toUpperCase()}]`
              }
              raw.team = vs
            })
          }
        }

        this.participants = await data.data.data[1]
      }

      await this.setDateRange('ONE_WEEK')
      this.isFindingSportType = false
      // const d = new Date()
      // console.log(moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'));
      // console.log(      moment().subtract(1, 'weeks').endOf('week').subtract(1, 'day').format('YYYY-MM-DD')  );
      // console.log(  moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')  )
      // // console.log(  moment().subtract(1, 'month').daysInMonth('D')  )
      // console.log(  moment().subtract(1, 'months').add(0, 'day').format('YYYY-MM-DD') )
      //
      //
      // console.log(      moment().subtract(2, 'weeks').endOf('week').subtract(1, 'day').format('YYYY-MM-DD')  );

      this.handleFilterClick()
    })
  }

  handleArgsClick(e) {
    switch (e.target.name) {
      case 'stage':
        this.args.stage = e.target.value
        break
      case 'season':
        this.args.season = e.target.value
        break
    }

    this.handleFilterClick()
  }

  setDateRange(range) {
    switch (range) {
      case 'ONE_WEEK':
        this.args.startDate = new Date(
          moment()
            .subtract(1, 'weeks')
            .endOf('week')
            .subtract(1, 'day')
        )
        this.args.endDate = new Date()
        break
      case 'TWO_WEEKS':
        this.args.startDate = new Date(
          moment()
            .subtract(2, 'weeks')
            .endOf('week')
            .subtract(1, 'day')
        )
        this.args.endDate = new Date()
        break
      case 'ONE_MONTH':
        this.args.startDate = new Date(
          moment()
            .subtract(1, 'months')
            .add(0, 'day')
        )
        this.args.endDate = new Date()
        break
      default:
        break
    }
  }

  async handleSubSportGenreChange(e) {
    this.args.subSportGenre = await e.target.value
    this.handleFilterClick()
  }

  handleSportTypeHover(type) {
    const el = this[`sporttype-${type.code}`]
    const elText = this[`sporttype-text-${type.code}`]
    if (el && elText) {
      el.style.backgroundColor = '#18c5ff'
      elText.style.color = '#ffffff'
    }
  }

  handleEventTypeClick(stype, option) {
    this.args.sportType = stype.code

    if (option) {
      this.args.subSportGenre = option.code
    } else {
      this.args.subSportGenre = ''
    }

    this.sportTypeNoHover = true
    setTimeout(() => (this.sportTypeNoHover = false), 500)
  }

  handleCustomDateClick() {
    this.isCustomDate = !this.isCustomDate
    this.args.startDate = new Date()
    this.args.endDate = null

    if (!this.isCustomDate) {
      this.setDateRange('ONE_WEEK')
    }

    this.handleFilterClick()
  }

  async dateRangeOnChange(dates) {
    const [start, end] = dates
    this.args.startDate = await start
    this.args.endDate = await end

    this.handleFilterClick()
  }

  async handleDateBracketChange(e) {
    this.args.dateBracket = e.target.value
    await this.setDateRange(e.target.value)

    this.handleFilterClick()
  }

  handleFilterClick() {
    console.log('Filtering Game:', this.args)
    this.props.doFilter(this.args)
  }

  render() {
    return (
      <Container>
        <FilterWrapper>
          <FilterRow>
            <Label
              font="pamainlight"
              size="2"
              color="#d3d3d3"
              style={{ whiteSpace: 'nowrap', width: '5vw' }}
              uppercase
            >
              sport genre
            </Label>

            {!this.isFindingSportType ? (
              this.sportTypes && this.sportTypes[0] ? (
                <DDSubSportGenre
                  value={this.args.subSportGenre}
                  onChange={this.handleSubSportGenreChange.bind(this)}
                >
                  {(this.sportTypes[0].subSportGenres || '').map(etype => (
                    <option key={`${this.sportTypes[0].code}-${etype.code}`}>
                      {etype.name}
                    </option>
                  ))}
                </DDSubSportGenre>
              ) : (
                <SportTypeEmpty
                  width={'9vw'}
                  height={'4vh'}
                  text={'NOT FOUND'}
                />
              )
            ) : (
              <SportTypeEmpty
                width={'9vw'}
                height={'4vh'}
                text={'LOADING...'}
              />
            )}
            {/*
            {!this.isFindingSportType ? (
              <nav>
                <ul>
                  <li className={this.sportTypeNoHover ? 'nohover' : ''}>
                    <SportTypeButton>
                      {
                        <SportTypeSelected
                          key={`sporttype-selected-${this.args.subSportGenre ||
                            'none'}`}
                          text={this.args.subSportGenre || '--'}
                          color={'#000000'}
                          backgroundColor={'#ffffff'}
                          opacity={1}
                        />
                      }
                    </SportTypeButton>
                    <ul>
                      {this.sportTypes.map(stype => {
                        return (
                          <li
                            key={stype.code}
                            style={{
                              borderTop: `0.1vh solid #d3d3d3`,
                              borderBottom: '0.2vh solid #d3d3d3',
                            }}
                          >
                            <SportType
                              innerRef={ref =>
                                (this[`sporttype-${stype.code}`] = ref)
                              }
                              onMouseOver={this.handleSportTypeHover.bind(
                                this,
                                stype
                              )}
                            >
                              <Label
                                font={'pamainbold'}
                                size={h * 0.4}
                                color={'rgba(0,0,0,0.5)'}
                                uppercase
                                nowrap
                                innerRef={ref =>
                                  (this[`sporttype-text-${stype.code}`] = ref)
                                }
                              >
                                {stype.name}
                              </Label>
                            </SportType>

                            <ul>
                              {stype.subSportGenres.map(etype => {
                                return (
                                  <li
                                    key={`${stype.code}-${etype.code}`}
                                    style={{
                                      borderTop: `0.1vh solid #d3d3d3`,
                                      borderLeft: `0.1vh solid #d3d3d3`,
                                    }}
                                  >
                                    <EventType
                                      text={etype.name}
                                      color={'#000000'}
                                      backgroundColor={'#ffffff'}
                                      opacity={0.5}
                                      onClick={this.handleEventTypeClick.bind(
                                        this,
                                        stype,
                                        etype
                                      )}
                                    />
                                  </li>
                                )
                              })}
                            </ul>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>
            ) : (
              <SportTypeEmpty
                width={'20vh'}
                height={'4vh'}
                text={'LOADING...'}
              />
            )}
*/}

            <Label
              font="pamainlight"
              size="2"
              color="#d3d3d3"
              // style={{ whiteSpace: 'nowrap', width: '10vh', marginLeft: '3vh' }}
              style={{
                whiteSpace: 'nowrap',
                marginLeft: '1.2vw',
                marginRight: '1.1vw',
              }}
              uppercase
            >
              date range
            </Label>
            {this.isCustomDate ? (
              <DatePicker
                dateFormat="MMMM dd, yyyy"
                selected={this.args.startDate}
                onChange={this.dateRangeOnChange.bind(this)}
                startDate={this.args.startDate}
                endDate={this.args.endDate}
                selectsRange
              />
            ) : (
              <DDDateBracket
                value={this.args.dateBracket}
                onChange={this.handleDateBracketChange.bind(this)}
              >
                <option value={'ONE_WEEK'}>last 1 week</option>
                <option value={'TWO_WEEKS'}>last 2 weeks</option>
                <option value={'ONE_MONTH'}>last 1 month</option>
              </DDDateBracket>
            )}

            {/*
            <CheckContainer>
              <input
                type="checkbox"
                style={{position:'absolute',opacity:0,height:0,width:0}}
                // onChange={this.handlePlaystackCheckChange.bind(this)}
                // ref={ref => (this.playCheckboxHeader = ref)}
              />
              <CheckMark/>
            </CheckContainer>
*/}

            {/*
            <DatePicker
              dateFormat="MMMM dd, yyyy"
              selected={this.args.startDate}
              onChange={this.dateRangeOnChange.bind(this)}
              startDate={this.args.startDate}
              endDate={this.args.endDate}
              selectsRange
            />
*/}
          </FilterRow>

          <FilterRow>
            <Label
              font="pamainlight"
              size="2"
              color="#d3d3d3"
              // style={{ whiteSpace: 'nowrap', width: '10vh' }}
              style={{ whiteSpace: 'nowrap', width: '5vw' }}
              uppercase
            >
              status
            </Label>
            <DDStatus
              value={this.args.stage}
              name="stage"
              onChange={this.handleArgsClick.bind(this)}
            >
              <option value="">ALL</option>
              <option value="active">ACTIVE</option>
              <option value="public">PUBLIC</option>
              <option value="pending">PENDING</option>
              <option value="live">LIVE</option>
              <option value="postgame">POST</option>
            </DDStatus>
            <Label
              font="pamainlight"
              size="2"
              color="#d3d3d3"
              style={{ whiteSpace: 'nowrap', marginLeft: '1.2vw' }}
              uppercase
            >
              custom date
            </Label>
            <CheckMark
              checked={this.isCustomDate}
              onClick={this.handleCustomDateClick.bind(this)}
            />
            <Label
              font="pamainlight"
              size="2"
              color="#d3d3d3"
              style={{
                whiteSpace: 'nowrap',
                marginLeft: '2vw',
                marginRight: '0.6vw',
              }}
              uppercase
            >
              season
            </Label>
            {!this.isFindingSportType ? (
              <DDSeason
                value={this.args.season}
                name="season"
                onChange={this.handleArgsClick.bind(this)}
              >
                <option value="">ALL</option>
                {(this.seasons || []).map((s, idx) => {
                  return (
                    <option key={`seasons-${s.code}`} value={s.code}>
                      {s.code}
                    </option>
                  )
                })}
              </DDSeason>
            ) : (
              <SportTypeEmpty
                width={'10vw'}
                height={'4vh'}
                text={'LOADING...'}
              />
            )}
          </FilterRow>
        </FilterWrapper>
        {/*
        <FilterButton
          locked={this.isFindingSportType}
          onClick={
            this.isFindingSportType ? null : this.handleFilterClick.bind(this)
          }
        />
*/}
      </Container>
    )
  }
}

const h = 4

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const FilterRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1vh;
`
const FilterColumn = styled.div`
  display: flex;
  flex-direction: column;
`

const DDStatus = styled.select`
  // width: 18vh;
  width: 9vw;
  height: 4vh;
  outline: none;
  border: none;
  text-align-last: center;
  font-family: pamainregular;
  font-size: ${props => 2}vh;
  line-height: 1;
  text-transform: uppercase;
`

const DDSeason = styled.select`
  width: 10vw;
  height: 4vh;
  outline: none;
  border: none;
  text-align-last: center;
  font-family: pamainregular;
  font-size: ${props => 2}vh;
  line-height: 1;
`

const DDSubSportGenre = styled.select`
  // width: 18vh;
  width: 9vw;
  height: 4vh;
  outline: none;
  border: none;
  text-align-last: center;
  font-family: pamainregular;
  font-size: ${props => 2}vh;
  line-height: 1;
  text-transform: uppercase;
`

const DDDateBracket = styled.select`
  width: 16.5vw;
  height: 4vh;
  outline: none;
  border: none;
  text-align-last: center;
  font-family: pamainregular;
  font-size: ${props => 2}vh;
  line-height: 1;
  text-transform: uppercase;
`

const Label = styled.span`
  height: ${props => props.size * 0.8 || 3}vh;
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => props.size || 3}vh;
  color: ${props => props.color || '#ffffff'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => (props.nospacing ? 0 : 0.1)}vh;
  cursor: ${props => props.cursor || 'default'};
  margin-bottom: ${props => props.marginBottom || 0}%;
`

const SportTypeButton = styled.div`
  width: ${props => 20}vh;
  height: ${props => h}vh;
  display: flex;
  cursor: pointer;
  border: ${props => 0.1}vh solid #ffffff;
  background-color: #ffffff;
`

const SportTypeSelected = styled.div`
  width: 100%;
  height: ${props => h * 0.95}vh;
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: ${props => 1}vh;
  &:after {
    content: '${props => props.text}';
    font-family: pamainregular;
    text-transform: uppercase;
    font-size: ${props => 2}vh;
    height: ${props => 2 * 0.8}vh;
    line-height: 1;
    color: ${props => props.color};
    opacity: ${props => props.opacity};
  }

`

const SportTypeEmpty = styled.div`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100%'};
  display: flex;
  background-color: #ffffff;
  align-items: center;
  justify-content: center;
  &:after {
    content: '${props => props.text || `SELECT A SPORT TYPE`}';
    font-family: pamainregular;
    font-size: ${props => h * 0.4}vh;
    color: #000000;
    line-height: 1;
  }
`

const SportType = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding-left: ${props => 1.5}vh;
`

const SportTypeImage = styled.img`
  height: ${props => h * 0.7}vh;
  margin: 0 ${props => 1.5}vh 0 ${props => 1.5}vh;
`

const EventType = styled.div`
  width: 100%;
  height: ${props => h}vh;
  background-color: ${props => props.backgroundColor};
  display: flex;
  align-items: center;
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    text-transform: uppercase;
    font-size: ${props => h * 0.4}vh;
    height: ${props => h * 0.4 * 0.8}vh;
    line-height: 1;
    color: ${props => props.color};
    opacity: ${props => props.opacity};
  }
  padding-left: ${props => 1.5}vh;

  &:hover {
    background-color: #18c5ff;
    &:after {
      color: #ffffff;
      opacity: 1;
    }
  }

`

const DatePickerInput = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`

const FormattedDateWrap = styled.div`
  display: flex;
  align-items: flex-end;
`

const FilterButton = styled.div`
  width: 15vh;
  height: 5vh;
  background-color: #19c5ff;
  margin-left: 2vh;
  cursor: ${props => (props.locked ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.2vh;
  &:after {
    content: 'SEARCH';
    font-family: pamainregular;
    font-size: 2.5vh;
    line-height: 1;
    height: ${props => 2.5 * 0.8}vh;
  }
`

const CheckContainer = styled.div`
  display: block;
  position: relative;
  userselect: none;
  &:input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  &:hover {
    ${props => CheckMark} {
      background-color: #ccc;
    }
  }
  &:input ${props => CheckMark}:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`

const CheckMark = styled.div`
  width: 2.5vh;
  height: 2.5vh;
  background-color: ${props => (props.checked ? '#2196F3' : '#eee')};
  margin-left: 0.5vw;
  &:after {
    display: inline-block;
    content: '';
    width: 100%;
    height: 100%;
    background-image: url(${props =>
      props.checked ? evalImage('check-icon.svg') : null});
    background-repeat: no-repeat;
    background-size: 60%;
    background-position: center;
  }
`
