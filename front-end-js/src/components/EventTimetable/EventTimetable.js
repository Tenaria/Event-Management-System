import { Button, Icon, PageHeader, Row, Spin, Tooltip } from 'antd';
import React from 'react';
import { Redirect } from "react-router-dom";
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

const getTimetable = (userId, userEmail, token, change) => new Promise(async (resolve, reject) => {
  const res = await fetch('http://localhost:8000/get_ah_timetable', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      week: moment().week().valueOf() + change,
      user_id: userId
    })
  });

  const returnData = {};
  const data = await res.json();
  if (res.status === 200) {
    returnData[userEmail] = (
      data[0] ? JSON.parse(data[0].week_data) : {
        'monday' : [],
        'tuesday' : [],
        'wednesday' : [],
        'thursday' : [],
        'friday' : [],
        'saturday' : [],
        'sunday' : [],
        'allowed' : false
      });
    returnData[userEmail].allowed = true;
  } else {
    returnData[userEmail] = {
      'monday' : [],
      'tuesday' : [],
      'wednesday' : [],
      'thursday' : [],
      'friday' : [],
      'saturday' : [],
      'sunday' : [],
      'allowed' : false
    };
  }
  resolve(returnData);
});

class Timetable extends React.Component {
  state = {
    attendees: [],
    loaded: false,
    overlay: true,
    relativeWeek: 0,
    ttData: [],
    goBack: false
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

    const data = await res.json();
    const attendees = data.attendees;
    const timetableCalls = [];

    for (let k in attendees) {
      const attendee = attendees[k];
      timetableCalls.push(getTimetable(attendee.id, attendee.email, token, 0));
    }

    Promise.all(timetableCalls).then(values => {
      let ttData = {};
      for (let i = 0; i < values.length; ++i) {
        for (let k in values[i]) {
          if (values[i][k].allowed)
            values[i][k].colour = colourCombo[i % colourCombo.length];
        }
        ttData = Object.assign(ttData, values[i]);
      }
      this.setState({attendees, ttData, loaded: true});
    })
  }

  changeWeek = async (change) => {
    const { token } = this.context;
    const { attendees, relativeWeek } = this.state;

    this.setState({loaded: false});

    const timetableCalls = [];

    for (let k in attendees) {
      const attendee = attendees[k];
      timetableCalls.push(getTimetable(attendee.id, attendee.email, token, relativeWeek + change));
    }

    Promise.all(timetableCalls).then(values => {
      let ttData = {};
      for (let i = 0; i < values.length; ++i) {
        for (let k in values[i]) {
          if (values[i][k].allowed)
            values[i][k].colour = colourCombo[i % colourCombo.length];
        }
        ttData = Object.assign(ttData, values[i]);
      }
      this.setState({attendees, relativeWeek: relativeWeek + change, ttData, loaded: true});
    })
  }

  advanceWeek = () => this.changeWeek(1);
  retreatWeek = () => this.changeWeek(-1);
  goBack = () => this.setState({goBack: true});

  render() {
    const { ttData, loaded, relativeWeek, goBack } = this.state;
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
      let legendElms = [];
      for (let k in ttData) {
        if (ttData[k].allowed) {
          legendElms.push(
            <div key={k} className="legend">
              <div className="colour-indicator" style={{backgroundColor: ttData[k].colour}}/>
              {k}
            </div>
          );
        } else {
          legendElms.push(
            <Tooltip
              key={k}
              title="This user did not allow you to view their timetable"
              placement="topLeft"
            >
              <div className="legend">
                <div className="colour-indicator" style={{backgroundColor: ttData[k].colour}}>
                  <Icon type="stop" theme="twoTone" style={{fontSize: 25}} twoToneColor="#ff0000"/>
                </div>
                <strike>{k}</strike>
              </div>
            </Tooltip>
          );
        }
      }
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
          <div style={{border: '1px solid grey', padding: '0.5em', margin: '0.5em 0em'}}>
            <div style={{fontWeight: 'bold'}}>Timetable Legend</div>
            <div className="timetable-legend">{legendElms}</div>
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
        {goBack ? <Redirect to="/events_manager" /> : null}
        <PageHeader
          onBack={this.goBack}
          title="Event Timetable"
          subTitle="This will show the timetables for all of the attendees that made theirs public!"
        />
        { timetableElm }
      </React.Fragment>
    );
  }
}

Timetable.contextType = TokenContext;

export default Timetable;
