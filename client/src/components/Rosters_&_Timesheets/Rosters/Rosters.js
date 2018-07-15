import React, { Component } from 'react'
import Header from '../HeaderBar/Header'
import Roster from './Roster'
import Flags from './Flags'



class Rosters extends Component {
  constructor(props) {
    super(props)


  }

  render() {
    const { week, users, nextWeek, previousWeek, sideBarHeading } = this.props

    return (
      <div>

        <div>
          <Header weekDate={week.date}
                  nextWeek={nextWeek}
                  previousWeek={previousWeek}
                  sideBarHeading={sideBarHeading}
          />
        </div>

        <div>
          <Flags staff={week.staff} />
        </div>

        <div>
          <Roster users={users}
                  staff={week.staff}
                  weekDate={week.date}
          />
        </div>

      </div>
    )
  }
}



export default Rosters
