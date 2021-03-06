/*
  This allows you to view the events that are available for the user
 */
import {
  Avatar, Empty, Icon, List, message, PageHeader, Row, Col, Spin, Tooltip, Typography
} from 'antd';
import { Redirect } from "react-router-dom";
import React from 'react';

import BookSession from './BookSession';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventDetails extends React.Component {
  state = {
    id: 0,
    name: '',
    desc: '',
    created: null,
    event_public: false,
    location: '',
    attendees: [],
    sessions: [],
    loaded: false,
    valid: false,
    goBack: false
  };

  updateSessions = async () => {
    const eventID = sessionStorage.getItem('event_id');
    const { token } = this.context;
    const res = await fetch('http://localhost:8000/load_event_sessions', {
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
    if (res.status === 200) {
      this.setState({sessions: []});
      this.setState({sessions: data.sessions});
    } else {
      message.error(data.error);
    }
  }

  updateEventAttendees = async () => {
    const eventID = sessionStorage.getItem('event_id');
    const { token } = this.context;
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
    if (res.status === 200) {
      this.setState({attendees: []});
      this.setState({attendees: data.attendees});
    } else {
      message.error(data.error);
    }
  }

  componentDidMount = async () => {
    // The instant the element is added to the DOM, load the information
    const eventID = sessionStorage.getItem('event_id');
    const { token } = this.context;

    if (eventID) {
      Promise.all([
        new Promise(async (resolve, reject) => {
          const res = await fetch('http://localhost:8000/get_attendees_of_event', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({event_id: eventID, token})
          });

          if (res.status === 200) {
            const data = await res.json();
            resolve(data.attendees);
          } else {
            resolve([]);
          }
        }),
        new Promise(async (resolve, reject) => {
          const res = await fetch('http://localhost:8000/get_event_details', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({event_id: eventID, token})
          });

          if (res.status === 200) {
            const data = await res.json();
            resolve(data);
          } else {
            resolve([]);
          }
        }),
        new Promise(async (resolve, reject) => {
          const eventID = sessionStorage.getItem('event_id');
          const { token } = this.context;
          const res = await fetch('http://localhost:8000/load_event_sessions', {
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
      
          if (res.status === 200) {
            const data = await res.json();
            resolve(data);
          } else {
            resolve([]);
          }
        })
      ]).then(values => {
        this.setState({
          id: eventID,
          name: values[1].events_name,
          desc: values[1].events_desc,
          created: values[1].events_createdat,
          event_public: values[1].events_public,
          location: values[1].attributes.location,
          attendees: values[0],
          sessions: values[2].sessions,
          loaded: true,
          valid: true
        });
      });
    } else {
      this.setState({
        loaded: true,
        valid: false
      });
    }
  }

  updateSessionCB = () => {
    this.updateSessions();
    this.updateEventAttendees();
  }

  goBack = () => this.setState({goBack: true});

  render() {
    const {
      id, name, desc, location, attendees, sessions, valid, loaded, goBack
    } = this.state;
    const { userEmail } = this.context;
    const attendeeElm = attendees.map(a =>
      <Tooltip key={a.id} title={a.email}>
        <Avatar icon="user" style={{marginRight: '0.5em'}} />
      </Tooltip>
    );
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (goBack) {
      displayElm = <Redirect to="/events_viewer" />;
    } else if (loaded && valid) {
      displayElm = (
        <React.Fragment>
          <Row gutter={32} type="flex">
            <Col sm={{span: 24, order: 1}} md={{span: 12, order: 2}}>
              <Title level={3}>{name}</Title>
              <p><Icon type="environment" /> {location}</p>
              <p>{desc}</p>
              <Title level={3}>Event Attendees</Title>
              <div>{attendeeElm}</div>
            </Col>
            <Col sm={{span: 24, order: 2}} md={{span: 12, order: 1}}>
              <List
                bordered
                className="custom-sessions"
                dataSource={sessions}
                header="Sessions"
                style={{marginTop: '1em'}}
                renderItem={item => {
                  let confirmedGoing = false;
                  if (item.attendees_going) {
                    for(const attendee of item.attendees_going) {
                      if (attendee.email === userEmail) {
                        confirmedGoing = true;
                      }
                    }
                  }

                  return (
                    <BookSession
                      id={item.id}
                      event_id={id}
                      start_timestamp={item.start_timestamp}
                      end_timestamp={item.end_timestamp}
                      confirmed_going={confirmedGoing}
                      attendees={item.attendees_going}
                      cb={this.updateSessionCB}
                    />
                  );
                }}
              >
              </List>
            </Col>
          </Row>
        </React.Fragment>
      );
    } else if (loaded) {
      displayElm = <Empty description={<span>No event found with the ID</span>}/>;
    } 

    return (
      <React.Fragment>
        <PageHeader
          title="Event Details"
          subTitle="View details about a single event"
          onBack={this.goBack}
        />
        {displayElm}
      </React.Fragment>
    );
  }
}

EventDetails.contextType = TokenContext;

export default EventDetails;
