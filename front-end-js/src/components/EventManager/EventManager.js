import { Card, Divider, Icon, Row, Spin, Typography } from 'antd';
import React from 'react';

import AddEventForm from './AddEventForm';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventManager extends React.Component {
  state = {
    addEvent: false,
    upcomingEvents: null,
    loaded: false
  }

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

  toggleAddForm = () => this.setState({addEvent: !this.state.addEvent})
  closeAddForm = () => this.setState({addEvent: false})

  render() {
    const { addEvent, loaded, upcomingEvents } = this.state;
    const cardStyle = {
      margin: '1em',
      width: '30%'
    };
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let eventElms = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (upcomingEvents && loaded) {
      eventElms = [
        <Card className="add-event-card" style={cardStyle} onClick={this.toggleAddForm}>
          <Icon type="plus" style={{fontSize: 48}} />
        </Card>
      ];
      for (let i = 0; i < upcomingEvents.length; ++i) {
        const upcomingEvent = upcomingEvents[i];
        eventElms.push(
          <Card key={i} style={cardStyle}>
            <p>{upcomingEvent.events_name}</p>
            <p>{upcomingEvent.events_desc}</p>
          </Card>
        );
      }
    }

    return (
      <div>
        <Title level={2}>Event Manager</Title>
        <p>Manage the events you have made.</p>
        <Divider orientation="left">Your Events</Divider>
        <Row type="flex">
          {eventElms}
        </Row>
        <AddEventForm visible={addEvent} onCancel={this.closeAddForm} />
      </div>
    );
  }
}

EventManager.contextType = TokenContext;

export default EventManager;
