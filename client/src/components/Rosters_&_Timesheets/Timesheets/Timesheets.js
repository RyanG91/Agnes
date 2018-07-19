import React, { Component } from 'react'
import axios from 'axios'
import Header from '../HeaderBar/Header'
import ColumnHeading from './Common/ColumnHeading'
import Name from './Common/Name'
import TotalsRow from './Common/TotalsRow'
import Individual from './Individual/Individual'
import  '../../../stylesheets/Timesheets.css'


class Timesheets extends Component {
  state = {
    columnHeadings: [],
    totalsRows: [],
    staffIdArray: '',
    individual: '',
    individualTotalsRow: [],
  }

  componentDidMount = () => {
    this.setTotalsRowsAndColumnHeadings()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.week !== prevProps.week) {
      this.setTotalsRowsAndColumnHeadings()
    }
  }

  setTotalsRowsAndColumnHeadings = () => {
    // Posting to the data:
     // start.timesheet, finish.timesheet, flags set to true as required
     // Flags:
     // - if they clock in late or note at all
     // - if don't clock in before end of shift (shift.finish.rostered) then set
     //    shift.start.timesheet to 1 min before rostered  finish time
     var DayShiftDefinitionClockinBeforeHours = 20
     const milliToHours = 0.00000027777777777778

    const staffIdArray = []
    var columnHeadings = []
    const totalsRows = []

    this.props.week.staff.map((staffMember) => {
      staffIdArray.push(staffMember.staffID)
      const totalsRow = {}

      staffMember.shifts.map((shift) => {
        const rStart = new Date(shift.start.rostered)
        const aStart = new Date(shift.start.actual)
        var start = ''
        const rFinish = new Date(shift.finish.rostered)
        const aFinish = new Date(shift.finish.actual)
        var finish = ''
        // set timnesheet start value. If not in db then calculate it
        shift.start.timesheet ? start = new Date(shift.start.timesheet) : start = this.timesheetEntry('start', rStart, aStart)
        // if not in db need to post start.timesheet to db without updating App state or this will rerender and don't need because we now have the info required to go forward from here
        // will have to decide how often App does a api request to update data
        // also need to post flags, which are uncovered in the timesheetEntry method
        // Same goes for finish time

        // set timnesheet finsih value. If not in data then calculate it
        shift.finish.timesheet ? finish = new Date(shift.finish.timesheet) : finish = this.timesheetEntry('finish', rFinish, aFinish)
        // shift hours are just finish - start times converted to a number of hours with two decimal places
        const shiftHours = (Number(((finish - start) * milliToHours).toFixed(2)))
        // determine the shift's payRateCategory and add it to totalsRow with the shiftHours as the value
        if (!shift.publicHoliday) {

          if (start.getHours() < DayShiftDefinitionClockinBeforeHours) {

            if (start.getDay() === 6) {
              if (shift.wayneShift) {
                totalsRow['Wayne Sat'] ? totalsRow['Wayne Sat'] += shiftHours : totalsRow['Wayne Sat'] = shiftHours
              } else {
                totalsRow['Sat'] ? totalsRow['Sat'] += shiftHours : totalsRow['Sat'] = shiftHours
              }
            } else if (start.getDay() === 0) {
                if (shift.wayneShift) {
                  totalsRow['Wayne Sun'] ? totalsRow['Wayne Sun'] += shiftHours : totalsRow['Wayne Sun'] = shiftHours
                } else {
                  totalsRow['Sun'] ? totalsRow['Sun'] += shiftHours : totalsRow['Sun'] = shiftHours
                }
            } else {
                if (shift.wayneShift) {
                  totalsRow['Wayne Ordinary'] ? totalsRow['Wayne Ordinary'] += shiftHours : totalsRow['Wayne Ordinary'] = shiftHours
                } else {
                  totalsRow['Ordinary'] ? totalsRow['Ordinary'] += shiftHours : totalsRow['Ordinary'] = shiftHours
                }
            }
          } else {
              if (shift.wayneShift) {
                totalsRow['Wayne Night'] ? totalsRow['Wayne Night'] += shiftHours : totalsRow['Wayne Night'] = shiftHours
              } else {
                totalsRow['Night'] ? totalsRow['Night'] += shiftHours : totalsRow['Night'] = shiftHours
              }
          }
        } else if (shift.publicHoliday && shift.wayneShift) {
          totalsRow['Wayne Public Holiday'] ? totalsRow['Wayne Public Holiday'] += shiftHours : totalsRow['Wayne Public Holiday'] = shiftHours

        } else {
          totalsRow['Public Holiday'] ? totalsRow['Public Holiday'] += shiftHours : totalsRow['Public Holiday'] = shiftHours
        }
      })
      // push totalsRow key to columnHeadings array
      for (let cat in totalsRow) {
        columnHeadings.push(cat)
      }
      // add staffID to totalsRow
      totalsRow.staffID = staffMember.staffID
      // push totalsRow object to totalsRows array
      totalsRows.push(totalsRow)
      console.log(totalsRow)
    })
    // // Remove duplicates from columnHeadings array and merge with entitlements array to form final column heads array
    columnHeadings = [...this.removeDuplicates(columnHeadings), ...this.props.entitlements]

    this.setState({
      columnHeadings: columnHeadings,
      totalsRows:  totalsRows,
      staffIdArray: staffIdArray,
    })
  }

  roundUp = (time) => {
    var mins = time.getMinutes()

    if (mins > 45) {
      mins = 60
    } else if (45 >= mins && mins > 30) {
      mins = 45
    } else if (30 >= mins && mins > 15) {
      mins = 30
    } else if (15 >= mins && mins > 0) {
      mins = 15
    } else {
      mins = 0
    }
    time.setMinutes(mins)
    return time
  }

  roundDown = (time) => {
    var mins = time.getMinutes()

    if (mins >= 45) {
      mins = 45
    } else if (45 > mins && mins >= 30) {
      mins = 30
    } else if (30 > mins && mins >= 15) {
      mins = 15
    } else if (15 > mins) {
      mins = 0
    }
    time.setMinutes(mins)
    return time
  }

  timesheetEntry = (startOrFinish, rostered, actual) => {
    if (actual) {

      if (actual <= rostered) {
        if (startOrFinish === 'start') {
          return rostered
        }
        if (startOrFinish === 'finish') {
          return this.roundDown(actual)
          // and post flag!!!
        }
      } else {

        if (startOrFinish === 'start') {
          return this.roundUp(actual)
          // and post flag!!!
        }
        if (startOrFinish === 'finish') {
          return rostered
        }
      }
      // If no clock time then return rostered
    } else return rostered
  }

  post = (startFinish, value) => {
    const server = 'http://localhost:4000'

    let valueObj =  {
                      weekID: this.state.weekID,
                      staffID: this.state.individual,
                      date: this.state.date,
                      shiftNumber: this.state.shift,
                      value: this.state.value,
                    }

    axios.post(server + '/timesheets/start', {valueObj}).then((response) => {
      console.log(response)
    })
  }

  removeDuplicates = (arr) => {
    let unique_array = Array.from(new Set(arr))
    return unique_array
  }

  setIndividual = (staffID) => {
    this.setState({ individual: staffID })
    this.state.totalsRows.map((row) => {
      if (row.staffID === staffID) {
        this.setState({ individualTotalsRow: row, })
      }
    })
  }

  removeIndividual = () => {
    this.setState({ individual: '' })
  }


  render() {
    const { week, prevWeek, users, goToNextWeek, goToPreviousWeek, sideBarHeading } = this.props

    if (!this.state.individual) {

      return (
        <div className="timesheets-container">

          <div className="timesheets">
            <Header weekDate={ week.date }
                    goToNextWeek={ goToNextWeek }
                    goToPreviousWeek={ goToPreviousWeek }
                    sideBarHeading={ sideBarHeading }
            />
          </div>

          <div className="column-headings-container">
            <div className="empty-column"></div>
            <div className="headings-column">
              {
                this.state.columnHeadings.map((columnHeading, index) => {
                  return (
                    <ColumnHeading key={ index } columnHeading={ columnHeading } />
                  )
                })
              }
            </div>
          </div>

          <div className="main-timesheet-container">
            <div className='names-container'>
              {
                this.state.totalsRows.map((row) => {
                return (
                  <Name key={ row.staffID }
                        staffID={ row.staffID }
                        users={ users }
                        setIndividual={ this.setIndividual }
                        removeIndividual={ this.removeIndividual }
                  />
                  )
                })
              }
            </div>
            <div className="timesheet-container">
              {
                this.state.totalsRows.map((row) => {
                  return (
                    <TotalsRow  key={ row.staffID }
                                row={ row }
                                columnHeadings={ this.state.columnHeadings }
                                setIndividual={ this.setIndividual }
                    />
                  )
                })
              }
            </div>
          </div>

        </div>
      )
    } else {
      if (!this.state.individualTotalsRow) { return '' }
      return (
        <div className="timesheets-container">

          <div className='timesheets'>
            <Header weekDate={ week.date }
                    goToNextWeek={ goToNextWeek }
                    goToPreviousWeek={ goToPreviousWeek }
                    sideBarHeading={ sideBarHeading }
            />
          </div>

          <div className='column-headings-container'>
            <div className="empty-column"></div>
            <div className="headings-column">
              {
                this.state.columnHeadings.map((columnHeading, index) => {
                  return (
                    <ColumnHeading key={ index } columnHeading={ columnHeading } />
                  )
                })
              }
            </div>
          </div>

          <div className="main-timesheet-container">
            <div className='names-container'>
              {
                this.state.staffIdArray.map((id) => {
                return (
                  <Name staffID={ id }
                        users={ users }
                        individual={ this.state.individual }
                        setIndividual={ this.setIndividual }
                        removeIndividual={ this.removeIndividual }
                  />
                  )
                })
              }
            </div>

            <div className="individual-view-container">
              <div className='timesheet-container'>
                      <TotalsRow  row={ this.state.individualTotalsRow }
                                  columnHeadings={ this.state.columnHeadings }
                                  setIndividual={ this.setIndividual }
                      />
              </div>
              <div className="individual-container">
                <Individual week={ week }
                            prevWeek={ prevWeek }
                            individual={ this.state.individual }
                            individualTotalsRow={ this.state.individualTotalsRow }
                            setIndividual={ this.setIndividual }
                            removeIndividual={ this.removeIndividual }
                />
              </div>
            </div>
          </div>

        </div>
      )
    }
  }

}

export default Timesheets
