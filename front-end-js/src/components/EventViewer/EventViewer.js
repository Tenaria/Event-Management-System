/*
  This allows you to view the events that are available for the user
 */
import { Card, Divider, Empty, Icon, Input, Row, Spin, Tooltip, Typography } from 'antd';
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

  componentDidMount = async () => {
    const token = this.context;

    const res = await fetch('http://localhost:8000/get_upcoming_events', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token})
    });

    const data = await res.json();
    this.setState({upcomingEvents: data.events, loaded: true});
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

    if (loaded && upcomingEvents) {
      eventElms = [];
      for (let i = 0; i < upcomingEvents.length; ++i) {
        const upcomingEvent = upcomingEvents[i];

        if (!upcomingEvent.events_public) continue;

        eventElms.push(
          <Card
            className="my-event-card"
            key={i}
            style={cardStyle}
            size="small"
            title={[
              (upcomingEvent.events_cancelled ? 
                <Tooltip title="Your event is cancelled">
                  <Icon type="stop" style={{color: "white", marginRight: '0.5em'}} />
                </Tooltip> :
                <Tooltip title={upcomingEvent.events_public ?
                  "Your event is publicly visible!" :
                  "Your event is not publicly visible"
                  }
                >
                  {upcomingEvent.events_public ?
                    <Icon type="eye" style={{color: "#68D391", marginRight: '0.5em'}} /> :
                    <Icon type="eye-invisible" style={{color: "#E53E3E", marginRight: '0.5em'}} />
                  }
                </Tooltip>
              )
              ,
              upcomingEvent.events_name,
              (upcomingEvent.events_cancelled ? " (Cancelled)" : "")
            ]}
          >
            <p>{upcomingEvent.events_desc ? upcomingEvent.events_desc : 'No description'}</p>
          </Card>
        );
      }
    }

    return (
      <React.Fragment>
        <Title level={2}>Event Viewer</Title>
        <p>View a list of upcoming events made by other users. You can also search for events here</p>
        <Search placeholder="Name of event ..." onSearch={value => console.log(value)} enterButton />
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
