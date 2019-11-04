/*
  This is a component that is responsible for managing your event. So you are able to view a list
  of events you host.
 */
import { Button, Card, Empty, Icon, Menu, Row, Spin, Tooltip, Typography } from 'antd';
import React from 'react';
import { Redirect } from "react-router-dom";

import AddEventForm from './AddEventForm';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventManager extends React.Component {
  state = {
    addEvent: false,
    currentMenu: 'current',
    loaded: false,
    pastEvents: null,
    upcomingEvents: null,
    editingEvent: false,
  }

  componentDidMount = () => { this.loadData(); }

  loadData = async () => {
    const { token } = this.context;
    const loadData = url => new Promise(async (resolve, reject) => {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token})
      });
      if (res.status === 200) {
        const data = await res.json();
        resolve(data);
      } else {
        resolve({events: []});
      }
    });

    Promise.all([
      loadData('http://localhost:8000/get_upcoming_events'),
      loadData('http://localhost:8000/get_past_events')
    ]).then(values => {
      console.log(values);
      this.setState({
        upcomingEvents: values[0].events,
        pastEvents: values[1].events,
        loaded: true
      });
    })
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
    const { token } = this.context;

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

  uncancelEvent = async id => {
    // Sets an event to be cancelled
    const { token } = this.context;

    const res = await fetch('http://localhost:8000/uncancel_event', {
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

  changeMenu = e => this.setState({currentMenu: e.key})

  render() {
    const {
      addEvent, currentMenu, loaded, pastEvents, upcomingEvents, editingEvent
    } = this.state;
    const cardStyle = {
      margin: '1%',
      width: '30%'
    };
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    const updateDisplay = (initialCard, events) => {
      /*
        Update the display of the elements and show the cards based on what the user selected
      */
      let eventElms = ( events.length > 0 ?
        [initialCard] :
        <Empty description="Could not find any events ..." style={{margin: 'auto'}} />
      );
      // Loop through the upcoming events
      for (let i = 0; i < events.length; ++i) {
        const upcomingEvent = events[i];
        eventElms.push(
          <Card
            className={upcomingEvent.events_cancelled ? "my-event-cancelled" : "my-event-card"}
            key={i}
            style={cardStyle}
            size="small"
            title={[
              (upcomingEvent.events_cancelled ? 
                <Tooltip key={i} title="Your event is cancelled">
                  <Icon type="stop" style={{color: "white", marginRight: '0.5em'}} />
                </Tooltip> :
                <Tooltip key={i} title={upcomingEvent.events_public ?
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
                  marginRight: (upcomingEvent.events_cancelled ? '0.5em' : '0.5em')
                }}
                onClick={() => this.selectEvent(upcomingEvent.events_id)}
              />
              {upcomingEvent.events_cancelled ?
                <Button
                  type="dashed"
                  icon="meh"
                  onClick={() => this.uncancelEvent(upcomingEvent.events_id)}
                /> :
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
      return (
        <React.Fragment>
          <Menu mode="horizontal" onClick={this.changeMenu} selectedKeys={[this.state.currentMenu]}>
            <Menu.Item key="current">
              <Icon type="caret-right" />
              Current Events
            </Menu.Item>
            <Menu.Item key="past">
              <Icon type="step-backward" />
              Past Events
            </Menu.Item>
          </Menu>
          <Row type="flex" style={{marginTop: '1em'}}>
            {eventElms}
          </Row>
        </React.Fragment>
      );
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (editingEvent) {
      displayElm = <Redirect to="/event" />
    } else if (loaded && currentMenu === 'current') {
      displayElm = updateDisplay(
        <Card key={-1} className="add-event-card" style={cardStyle} onClick={this.toggleAddForm}>
          <Icon type="plus" style={{fontSize: 48}} />
        </Card>
        , upcomingEvents
      );
    } else if (loaded && currentMenu === 'past') {
      displayElm = updateDisplay(null, pastEvents)
    } 

    return (
      <div>
        <Title level={2}>Event Manager</Title>
        <p>Manage the events you have made.</p>
        {displayElm}
        <AddEventForm visible={addEvent} onCancel={this.closeAddForm} />
      </div>
    );
  }
}

EventManager.contextType = TokenContext;

export default EventManager;
