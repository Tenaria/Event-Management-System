import { Button, Card, Divider, Icon, Row, Spin, Tooltip, Typography } from 'antd';
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
          <Card
            className="my-event-card"
            key={i}
            style={cardStyle}
            size="small"
            title={[
              <Tooltip title={
                upcomingEvent.events_public ?
                  "Your event is publicly visible!" :
                  "Your event is not publicly visible"
                }
              >
                {
                  upcomingEvent.events_public ?
                    <Icon type="eye" style={{color: "#68D391", marginRight: '0.5em'}} /> :
                    <Icon type="eye-invisible" style={{color: "#E53E3E", marginRight: '0.5em'}} />
                }
              </Tooltip>,
              upcomingEvent.events_name
            ]}
          >
            <p>{upcomingEvent.events_desc ? upcomingEvent.events_desc : 'No description'}</p>
            <Row style={{textAlign: 'right'}}>
              <Button
                icon="edit"
                style={{
                  background: '#38B2AC',
                  border: 'none',
                  color: 'white',
                  marginRight: '0.5em'
                }}
              />
              <Button type="danger" icon="delete"/>
            </Row>
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
