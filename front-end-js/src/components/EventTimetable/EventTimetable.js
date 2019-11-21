import { Button, Empty, Icon, message, Row, Spin } from 'antd';
import React from 'react';
import moment from 'moment';

import Column from './Column';
import TokenContext from '../../context/TokenContext';

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 7  // First week of year must contain 1 January (7 + 1 - 1)
}});

const colourCombo = [
  '#F56565',
  '#ED8936',
  '#ECC94B',
  '#48BB78',
  '#38B2AC',
  '#4299E1',
  '#667EEA',
  '#9F7AEA',
  '#ED64A6'
];

class Timetable extends React.Component {
  state = {
    attendees: [],
    loaded: false,
    overlay: true,
    relativeWeek: 0,
    ttData: [],
  }

  componentDidMount = async () => {
    const { token } = this.context;
    const { relativeWeek } = this.state;
    const eventID = sessionStorage.getItem('event_id');

    const res = await fetch('http://localhost:8000/get_attendees_of_event', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: eventID,
        token
      })
    });
    
    const getTimetable = (userId, userEmail) => new Promise(async (resolve, reject) => {
      const res = await fetch('http://localhost:8000/get_ah_timetable', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          week: moment().week().valueOf(),
          user_id: userId
        })
      });

      const returnData = {};
      const data = await res.json();
      if (res.status === 200) {
        returnData[userEmail] = JSON.parse(data[0].week_data)
      } else {
        returnData[userEmail] = {
          'monday' : [],
          'tuesday' : [],
          'wednesday' : [],
          'thursday' : [],
          'friday' : [],
          'saturday' : [],
          'sunday' : []
        };
      }
      resolve(returnData);
    });

    const data = await res.json();
    const attendees = data.attendees;
    const timetableCalls = [];

    for (let k in attendees) {
      const attendee = attendees[k];
      timetableCalls.push(getTimetable(attendee.id, attendee.email));
    }

    Promise.all(timetableCalls).then(values => {
      let ttData = {};
      for (let i = 0; i < values.length; ++i) {
        for (let k in values[i]) {
          values[i][k].colour = colourCombo[i % colourCombo.length];
        }
        ttData = Object.assign(ttData, values[i]);
      }
      this.setState({ttData, loaded: true});
    })
  }

  changeWeek = async (change) => {
    const { token } = this.context;
    const { overlay, relativeWeek, selectedUser } = this.state;

    this.setState({loaded: false});

    const res = await fetch('http://localhost:8000/get_ah_timetable', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        week: moment().week().valueOf() + relativeWeek + change,
        user_id: selectedUser
      })
    });

    const data = await res.json();
    if (res.status === 200) {
      this.setState({
        relativeWeek: this.state.relativeWeek + change,
        loaded: true
      });
    }
  }

  advanceWeek = () => this.changeWeek(1);
  retreatWeek = () => this.changeWeek(-1);

  render() {
    const { ttData, loaded, relativeWeek } = this.state;
    console.log(ttData);
    const ttCols = [
      <Column key='time' title={true} name={'Time'} />,
      <Column key='monday' name="Mon" time="monday" data={ttData}/>,
      <Column key='tuesday' name="Tue" time="tuesday" data={ttData}/>,
      <Column key='wednesday' name="Wed" time="wednesday" data={ttData}/>,
      <Column key='thursday' name="Thu" time="thursday" data={ttData}/>,
      <Column key='friday' name="Fri" time="friday" data={ttData}/>,
      <Column key='saturday' name="Sat" time="saturday" data={ttData}/>,
      <Column key='sunday' name="Sun" time="sunday" data={ttData}/>
    ];
    const startDate = moment().weekday(0).add(relativeWeek, 'w');
    const endDate = moment().weekday(6).add(relativeWeek, 'w');

    let timetableElm = null;

    if (loaded) {
      timetableElm = (
        <React.Fragment>
          <Row
            type="flex"
            align="middle"
            justify="center"
            style={{margin: '0em 0em 1em 0em', position: 'relative'}}
          >
            <Button
              icon="left"
              shape="circle"
              type="primary"
              onClick={this.retreatWeek}
            />
            <div className="timetable-dates" style={{margin: '0em 1em'}}>
              {startDate.format('DD/MM/YYYY')} - {endDate.format('DD/MM/YYYY')}
            </div>
            <Button
              icon="right"
              shape="circle"
              type="primary"
              onClick={this.advanceWeek}
            />
          </Row>
          <div className="timetable">
            {ttCols}
          </div>
        </React.Fragment>
      );
    } else {
      timetableElm = (
        <div style={{textAlign: 'center'}}>
          <Spin tip="Loading..." />
        </div>
      );
    }
  
    return (
      <React.Fragment>
        { timetableElm }
      </React.Fragment>
    );
  }
}

Timetable.contextType = TokenContext;

export default Timetable;
