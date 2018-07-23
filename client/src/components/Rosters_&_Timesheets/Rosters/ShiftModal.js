import React from 'react'
import classNames from 'classnames'
import axios from 'axios'

const api = 'http://localhost:4000/rosters/shift/'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class ShiftModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addHours: false,
      validationError: false,
      category: '',
      start: '',
      finish: ''
    }
  }

  // afterOpenModal = () => {
  //   // references are now sync'd and can be accessed.
  //   // this.subtitle.style.color = '#f00';
  //   this.setState({
  //     category: this.props.shiftCategory,
  //     start: this.props.start,
  //     finish: this.props.finish
  //   })
  // }

  render () {
    console.log(this.props, 'YOOOOOOOOOOOOOOO')
    if (!this.props.shiftAdd) {
      if (!this.props.validationError) {
        return (
          <div>
            <form id='shiftForm' onSubmit={ this.props.handleSubmit }>
              <input  name='shiftCategory'
                      placeholder={ this.props.shiftCategory }
                      onChange={this.props.shiftCatChange}
              /> <br />
              <input  name='start'
                      placeholder={ this.props.start }
                      type='time'
                      onChange={this.props.startTimeChange}
              />
              <input  name='finish'
                      placeholder={ this.props.finish }
                      type='time'
                      onChange={this.props.finishTimeChange}
              /> <br />
              <label><input type="checkbox" name="pubHol"/>Pub Hol</label><br />
              <label><input type="checkbox" name="wayne"/>Wayne Shift</label><br />
              <input type="submit" />
            </form>
          </div>
        )
      } else {
        return (
          <div>
            <p id='validation-error'>! Fill out all fields !</p>
            <form id='shiftForm' onSubmit={ this.props.handleSubmit }>
              <input  name='shiftCategory'
                      placeholder={ this.props.shiftCategory }
                      onChange={this.props.shiftCatChange}
              /> <br />
              <input  name='start'
                      placeholder={ this.props.start }
                      type='time'
                      onChange={this.props.startTimeChange}
              />
              <input  name='finish'
                      placeholder={ this.props.finish }
                      type='time'
                      onChange={this.props.finishTimeChange}
              /> <br />
              <label><input type="checkbox" name="pubHol"/>Pub Hol</label><br />
              <label><input type="checkbox" name="wayne"/>Wayne Shift</label><br />
              <input type="submit" />
            </form>
            {/* <button id='remove-shift-btn' onClick={() => this.props.removeShift(this.props.staffID, this.props.shiftID)} >Remove</button> */}
          </div>
        )
      }
    } else {
      if (!this.props.validationError) {
        return (
          <div>
            <form id='shiftForm' onSubmit={ this.props.addShiftSubmit }>
              <input  name='shiftCategory'
                      placeholder={ this.props.shiftCategory }
                      onChange={this.props.shiftCatChange}
              /> <br />
              <input  name='start'
                      placeholder={ this.props.start }
                      type='time'
                      onChange={this.props.startTimeChange}
              />
              <input  name='finish'
                      placeholder={ this.props.finish }
                      type='time'
                      onChange={this.props.finishTimeChange}
              /> <br />
              <label><input type="checkbox" name="pubHol"/>Pub Hol</label><br />
              <label><input type="checkbox" name="wayne"/>Wayne Shift</label><br />
              <input type="submit" />
            </form>
          </div>
        )
      } else {
        // validation error
        return (
          <div>
            <p id='validation-error'>! Fill out all fields !</p>
            <form id='shiftForm' onSubmit={ this.props.addShiftSubmit }>
              <input  name='shiftCategory'
                      placeholder={ this.props.shiftCategory }
                      onChange={this.props.shiftCatChange}
              /> <br />
              <input  name='start'
                      placeholder={ this.props.start }
                      type='time'
                      onChange={this.props.startTimeChange}
              />
              <input  name='finish'
                      placeholder={ this.props.finish }
                      type='time'
                      onChange={this.props.finishTimeChange}
              /> <br />
              <label><input type="checkbox" name="pubHol"/>Pub Hol</label><br />
              <label><input type="checkbox" name="wayne"/>Wayne Shift</label><br />
              <input type="submit" />
            </form>
          </div>
        )
      }
    }
  }
}

export default ShiftModal
