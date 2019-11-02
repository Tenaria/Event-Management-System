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
    const { upcomingEvents, loaded } = this.state;
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let eventElms = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (loaded && upcomingEvents.length > 0) {
      eventElms = [];
      for (let i = 0; i < upcomingEvents.length; ++i) {
        const upcomingEvent = upcomingEvents[i];
        eventElms.push(
          <Card
            className="my-event-card"
            key={i}
            style={cardStyle}
            size="small"
            title={upcomingEvent.events_name}
          >
            <p>{upcomingEvent.events_desc ? upcomingEvent.events_desc : 'No description'}</p>
            <Row style={{
              position: 'absolute',
              right: '1em',
              bottom: '1em'
            }}>
              <Button type="primary">Book Event</Button>
            </Row>
          </Card>
        );
      }
    } else if (loaded) {
      eventElms = <Empty description="Could not find any events ..." style={{margin: 'auto'}} />;
    }

    return (
      <React.Fragment>
        <Title level={2}>Event Details</Title>
        <p>View a list of upcoming events made by other users. You can also search for events here</p>
        <Divider></Divider>
      </React.Fragment>
    );
  }
}

EventDetails.contextType = TokenContext;

export default EventDetails;
