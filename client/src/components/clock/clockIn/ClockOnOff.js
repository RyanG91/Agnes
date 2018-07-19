import React, { Component } from 'react'
import axios from 'axios'

// Pulls the week data from seed.js through App.js and Clock.js

class Clock extends Component {
  // Null is used to determine the time.
  state = {
    user: '',
    rosteredStart: null,
    rosteredFinish: null,
    clockedOn: null,
    clockedOff: null,
  }

  constructor(props) {
    super(props)
  }

// Handles when users click the clock on button
  clockingOn = () => {
    const staffID = this.props.user.staffID
    this.setState({ user: staffID })

    // The rostered and actual clock on time
    const shiftsStartRoster = this.props.week.staff[0].shifts[0].start.rostered
    const shiftsStartActual = this.props.week.staff[0].shifts[0].start.actual

    this.setState({ rosteredStart: new Date(shiftsStartRoster).toLocaleString() })
    this.setState({ clockedOn: new Date(shiftsStartActual).toLocaleString() })

// Axios needs work
    // axios.patch('http://localhost:4000/').then(console.log('axios'))
  }

// Handles when users click the clock off button
  clockingOff = () => {
    const staffID = this.props.user.name
    this.setState({ user: staffID })

    const shiftFinishRoster = this.props.week.staff[0].shifts[0].finish.rostered
    const shiftFinishActual = this.props.week.staff[0].shifts[0].finish.actual

    this.setState({ rosteredFinish: new Date(shiftFinishRoster).toLocaleString() })
    this.setState({ clockedOff: new Date(shiftFinishActual).toLocaleString() })
  }

  render() {
    // Buttons change once a user clicks 'Clock on' and is removed once a user clicks 'Clock off'
    if (this.state.clockedOn === null) {
      return(
        <div>
          <button onClick={this.clockingOn}>Clock on</button>
        </div>
      )
    } else if (this.state.clockedOn !== null && this.state.clockedOff === null) {
      return (
        <div>
          <button onClick={this.clockingOff}>Clock off</button>
          { this.state.clockedOn ? <p> You ({ this.state.user }) clocked on at: { this.state.clockedOn } and were rostered to start at: {this.state.rosteredStart} </p> : '' }
        </div>
      )
    } else {
      return (
        <div>
          <br />
          { this.state.clockedOff ? <p> { this.state.user } clocked off at: { this.state.clockedOff } and were rostered to finish at: {this.state.rosteredFinish} </p> : '' }
          { this.state.clockedOn ? <p> You ({ this.state.user }) clocked on at: { this.state.clockedOn } and were rostered to start at: {this.state.rosteredStart} </p> : '' }
        </div>
      )
    }
  }
}

export default Clock