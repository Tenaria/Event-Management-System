/*
  This will show you a particular event that you can edit. This will act as the middle man to hold
  the two actual forms that are able to edit an event. Essentially, all this component does is
  load information and send it to the two separate forms.
 */
import { Collapse, Divider, Empty, Icon, Spin, Typography } from 'antd';
import React from 'react';

import EditEventForm from './EditEventForm';
import EditAttendee from './EditAttendees';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const { Panel } = Collapse;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class Event extends React.Component {
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
  }

  render() {
    const { id, name, desc, created, event_public, loaded, location, valid } = this.state;
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let eventElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (loaded) {
      if (valid) {
        eventElm =  (
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header="General Information" key="1">
              <EditEventForm
                id={id}
                name={name}
                desc={desc}
                event_public={event_public}
                location={location}
              />
            </Panel>
            <Panel header="Attendees" key="2">
              <EditAttendee
                id={id}
                name={name}
                desc={desc}
                event_public={event_public}
                location={location}
              />
            </Panel>
          </Collapse>
        );
      } else {
        eventElm = <Empty description={<span>No event found with the ID</span>}/>;
      }
    }

    return (
      <React.Fragment>
        <Title level={2}>Edit Event</Title>
        <p>View a single event and edit it.</p>
        <Divider orientation="left">Event</Divider>
        <div>
          { eventElm }
        </div>
      </React.Fragment>
    );
  }
}

Event.contextType = TokenContext;

export default Event;
