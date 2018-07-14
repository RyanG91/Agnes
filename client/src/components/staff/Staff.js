import React, { Component } from 'react'
import StaffRow from './StaffRow'
import SideBar from './SideBar'
import axios from 'axios'

const api = 'http://localhost:4000'

class Staff extends Component {
  constructor() {
    super()
    this.state = {
      revealed: '',
      staffData: [],
      staffRosters: [],
      rosteredTotals: [],
      totals: ''
    }
    this.fetchStandard()
  }

  clickHandler = (event) => {
    if (this.state.revealed === event.target.getAttribute('name') || this.state.revealed === event.target.innerText) {
      this.setState({revealed: ''})
    } else {
      this.setState({
        revealed: event.target.getAttribute('name') || event.target.innerText
      })
    }
  }

  fetchStandard = () => {
    axios.get(api + '/standardHours').then((response) => {
      for (let staff of response.data) {
        staff.totalHours = parseInt(localStorage.getItem(`${staff.name}`))
      }
      return response
    }).then((result) => {
      this.fetchRosters(result.data)
    })
  }

  fetchRosters = (staffData) => {
    axios.get(api + '/rosters').then((response) => {
      for (let obj of response.data) {
        if (obj.date === '2018-07-01T14:00:00.000Z') {
          return obj
        }
      }
    }).then((obj) => {
      this.calcRosters(obj, staffData)
    })
  }

  calcRosters = (roster, staffData) => {
    let totals = []
    const DayShiftDefinitionClockinBeforeHours = 20
    const milliToHours = 0.00000027777777777778
    for (let staff of roster.staff) {
      let totalsRow = {}
      for (let shift of staff.shifts) {
        let finish = new Date(shift.finish.rostered)
        let start = new Date(shift.start.rostered)
        const shiftHours = (Number(((finish - start) * milliToHours).toFixed(2)))
        if (!shift.publicHoliday) {

          if (start.getHours() < DayShiftDefinitionClockinBeforeHours) {

            if (start.getDay() === 6) {
              if (shift.wayneShift) {
                totalsRow['WayneSat'] ? totalsRow['WayneSat'] += shiftHours : totalsRow['WayneSat'] = shiftHours
              } else {
                totalsRow['Sat'] ? totalsRow['Sat'] += shiftHours : totalsRow['Sat'] = shiftHours
              }
            } else if (start.getDay() === 0) {
                if (shift.wayneShift) {
                  totalsRow['WayneSun'] ? totalsRow['WayneSun'] += shiftHours : totalsRow['WayneSun'] = shiftHours
                } else {
                  totalsRow['Sun'] ? totalsRow['Sun'] += shiftHours : totalsRow['Sun'] = shiftHours
                }
            } else {
                if (shift.wayneShift) {
                  totalsRow['WayneOrdinary'] ? totalsRow['WayneOrdinary'] += shiftHours : totalsRow['WayneOrdinary'] = shiftHours
                } else {
                  totalsRow['Ordinary'] ? totalsRow['Ordinary'] += shiftHours : totalsRow['Ordinary'] = shiftHours
                }
            }
          } else {
              if (shift.wayneShift) {
                totalsRow['WayneNight'] ? totalsRow['WayneNight'] += shiftHours : totalsRow['WayneNight'] = shiftHours
              } else {
                totalsRow['Night'] ? totalsRow['Night'] += shiftHours : totalsRow['Night'] = shiftHours
              }
          }
        } else if (shift.publicHoliday && shift.wayneShift) {
          totalsRow['WaynePublicHoliday'] ? totalsRow['WaynePublicHoliday'] += shiftHours : totalsRow['WaynePublicHoliday'] = shiftHours

        } else {
          totalsRow['PublicHoliday'] ? totalsRow['PublicHoliday'] += shiftHours : totalsRow['PublicHoliday'] = shiftHours
        }
      }
      console.log(totalsRow, 'THLHLKLKL')
      totals.push({...totalsRow, staffID: staff.staffID})
    }
    console.log(totals)
    this.setState({staffData: staffData, totals: totals})
    console.log(staffData)
  }

  categoryChecker = (key) => {
    switch (key) {
      case 'Ordinary':
        return 'Ordinary'
      case 'Sunday':
        return 'Sun'
      case 'Saturday':
        return 'Sat'
      case 'Night':
        return 'Night'
      case 'Public Holiday':
        return 'PublicHoliday'
      case 'Wayne Ordinary':
        return 'WayneOrdinary'
      case 'Wayne Saturday':
        return 'WayneSat'
      case 'Wayne Sunday':
        return 'WayneSun'
      case 'Wayne Night':
        return 'WayneNight'
      case 'Wayne Public Holiday':
        return 'WaynePublicHoliday'
    }
  }
  
  passTotal = (total) => {
    let name = ''
    let currentTotal = ''
    let plus = ''
    let diff = ''
    let staffData = [...this.state.staffData]
    if (total.orgHours < total.hours) {
      plus = true
      diff = total.hours - total.orgHours
    } else if (total.orgHours > total.hours) {
      plus = false
      diff = total.hours - total.orgHours
    } else {
      plus = null
      diff = total.orgHours
    }
    for (let obj of staffData) {
      if (obj._id === total.standardID) {
        name = obj.name
        currentTotal = parseInt(localStorage.getItem(`${name}`))
        for (let cat of obj.categories) {
          if (cat._id === total.id) {
            cat.hoursWorked = total.hours
            if (plus) {
              currentTotal = currentTotal + diff
            } else if (plus === false) {
              currentTotal = currentTotal + diff
            }
          }
        }
      }
    }
    localStorage.setItem(`${name}`, currentTotal)
    this.setState({staffData})
  }
  
  render() {
    console.log(this.state.totals, 'HHHHHHHHHHHHHHHHHHHHHHHHHHHHLLLLLLLLL')
    return (
      <div className="staff-container" >
        <SideBar staffData={this.state.staffData} handleClick={this.clickHandler} revealed={this.state.revealed} fetchStandard={this.fetchStandard} totals={this.state.totals} />
        <div className="staff-row-container" >
          <StaffRow staffData={this.state.staffData} revealed={this.state.revealed} fetchStandard={this.fetchStandard} passTotal={this.passTotal} rosteredTotals={this.state.totals} />
        </div>
      </div>
    )
  }
}

export default Staff