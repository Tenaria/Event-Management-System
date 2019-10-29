/*
  This allows you to view the events that are available for the user
 */
import { Button, Card, Divider, Empty, Icon, Input, Row, Spin, Tooltip, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const { Search } = Input;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventViewer extends React.Component {
  state = {
    upcomingEvents: null,
    loaded: false
  };

  componentDidMount = () => {
    this.loadEvents('');
  }

  loadEvents = async term => {
    const token = this.context;

    this.setState({loaded: false});

    const res = await fetch('http://localhost:8000/search_public_event', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search_term: term,
        token
      })
    });

    const data = await res.json();

    this.setState({
      upcomingEvents: data.results,
      loaded: true
    });
  }

  render() {
    const { upcomingEvents, loaded } = this.state;
    const cardStyle = {
      margin: '1%',
      width: '30%'
    };
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
        <Title level={2}>Event Viewer</Title>
        <p>View a list of upcoming events made by other users. You can also search for events here</p>
        <Search
          placeholder="Name of event ..."
          onSearch={value => this.loadEvents(value)}
          enterButton
        />
        <Divider orientation="left">Events</Divider>
        <Row type="flex">
          {eventElms}
        </Row>
      </React.Fragment>
    );
  }
}

EventViewer.contextType = TokenContext;

export default EventViewer;
