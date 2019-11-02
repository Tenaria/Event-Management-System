/*
  This allows you to view the events that are available for the user
 */
import { Button, Card, Divider, Empty, Icon, Row, Spin, Typography } from 'antd';
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
    loaded: false,
    valid: false
  };

  componentDidMount = async () => {
    // The instant the element is added to the DOM, load the information
    const eventID = sessionStorage.getItem('event_id');
    const token = this.context;

    if (eventID) {
      const res = await fetch('http://localhost:8000/get_event_details', {
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
  
        this.setState({
          id: eventID,
          name: data.events_name,
          desc: data.events_desc,
          created: data.events_createdat,
          event_public: data.events_public,
          location: data.attributes.location,
          loaded: true,
          valid: true
        });
      } else {
        this.setState({
          loaded: true,
          valid: false
        });
      }
    } else {
      this.setState({
        loaded: true,
        valid: false
      });
    }
  }

  render() {
    const { id,
      name,
      desc,
      created,
      event_public,
      location,
      valid,
      loaded
    } = this.state;
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (loaded && valid) {
      displayElm = (
        <div>
          {name}
        </div>
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
