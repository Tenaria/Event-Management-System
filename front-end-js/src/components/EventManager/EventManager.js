/*
  This is a component that is responsible for managing your event. So you are able to view a list
  of events you host.
 */
import { Button, Card, Divider, Icon, Row, Spin, Tooltip, Typography } from 'antd';
import React from 'react';
import { Redirect } from "react-router-dom";

import AddEventForm from './AddEventForm';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventManager extends React.Component {
  state = {
    addEvent: false,
    loaded: false,
    upcomingEvents: null,
    editingEvent: false,
  }

  componentDidMount = () => { this.loadData(); }

  loadData = async () => {
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

  // Collection of functions used to show/hide the add event form modal
  toggleAddForm = () => this.setState({addEvent: !this.state.addEvent})
  closeAddForm = () => {
    this.setState({addEvent: false});
    this.loadData();
  }

  selectEvent = id => {
    // This function will remember the id of the event selected in the session memory then redirect
    // the user to the event editor view where you can edit a single event.
    sessionStorage.setItem('event_id', id);
    this.setState({ editingEvent: true });
  }
  
  cancelEvent = async id => {
    // Sets an event to be cancelled
    const token = this.context;

    const res = await fetch('http://localhost:8000/cancel_event', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, event_id: id })
    });
    this.loadData();
  }

  render() {
    const { addEvent, loaded, upcomingEvents, editingEvent } = this.state;
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

    if (upcomingEvents && loaded && !editingEvent) {
      eventElms = [
        <Card key={-1} className="add-event-card" style={cardStyle} onClick={this.toggleAddForm}>
          <Icon type="plus" style={{fontSize: 48}} />
        </Card>
      ];
      for (let i = 0; i < upcomingEvents.length; ++i) {
        const upcomingEvent = upcomingEvents[i];
        eventElms.push(
          <Card
            className={upcomingEvent.events_cancelled ? "my-event-cancelled" : "my-event-card"}
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
            <Row style={{
              position: 'absolute',
              right: '1em',
              bottom: '1em'
            }}>
              <Button
                icon="edit"
                style={{
                  background: '#38B2AC',
                  border: 'none',
                  color: 'white',
                  marginRight: (upcomingEvent.events_cancelled ? '' : '0.5em')
                }}
                onClick={() => this.selectEvent(upcomingEvent.events_id)}
              />
              {upcomingEvent.events_cancelled ?
                '' :
                <Button
                  type="danger"
                  icon="stop"
                  onClick={() => this.cancelEvent(upcomingEvent.events_id)}
                />
              }
            </Row>
          </Card>
        );
      }
    } else if (editingEvent) {
      eventElms = <Redirect to="/event" />
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
