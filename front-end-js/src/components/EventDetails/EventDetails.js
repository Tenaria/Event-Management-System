/*
  This allows you to view the events that are available for the user
 */
import { Avatar, Button, Card, Divider, Empty, Icon, Row, Spin, Tooltip, Typography } from 'antd';
import React from 'react';

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
    loaded: false,
    valid: false
  };

  componentDidMount = async () => {
    // The instant the element is added to the DOM, load the information
    const eventID = sessionStorage.getItem('event_id');
    const token = this.context;

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
        })
      ]).then(values => {
        console.log(values);
        this.setState({
          id: eventID,
          name: values[1].events_name,
          desc: values[1].events_desc,
          created: values[1].events_createdat,
          event_public: values[1].events_public,
          location: values[1].attributes.location,
          attendees: values[0],
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

  render() {
    const {
      id, name, desc, created, event_public, location, attendees, valid, loaded
    } = this.state;
    const attendeeElm = attendees.map(a =>
      <Tooltip key={a.id} title={a.email}>
        <Avatar icon="user" />
      </Tooltip>
    );
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (loaded && valid) {
      displayElm = (
        <React.Fragment>
          <Title level={3}>{name}</Title>
          <p><Icon type="environment" /> {location}</p>
          <p>{desc}</p>
          <Title level={3}>Event Attendees</Title>
          <div>{attendeeElm}</div>
        </React.Fragment>
      );
    } else if (loaded) {
      displayElm = <Empty description={<span>No event found with the ID</span>}/>;
    } 

    return (
      <React.Fragment>
        <Title level={2}>Event Details</Title>
        <p>View details about a single event.</p>
        <Divider></Divider>
        {displayElm}
      </React.Fragment>
    );
  }
}

EventDetails.contextType = TokenContext;

export default EventDetails;
