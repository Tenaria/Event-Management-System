/*
  This allows you to view the events that are available for the user
 */
import { Button, Card, Empty, Icon, Input, Menu, Row, Spin, Typography } from 'antd';
import { Redirect } from "react-router-dom";
import React from 'react';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const { Search } = Input;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventViewer extends React.Component {
  state = {
    currentMenu: 'public',
    upcomingEvents: null,
    upcomingInvitedEvents: null,
    pastInvitedEvents: null,
    viewingEvent: false,
    loaded: false
  };

  componentDidMount = () => {
    this.loadEvents('');
  }

  loadEvents = term => {
    const token = this.context;

    const loadData = url => new Promise(async (resolve, reject) => {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search_term: term, token })
      });

      if (res.status === 200) {
        const data = await res.json();
        resolve(data);
      } else {
        resolve({events: []});
      }
    });

    this.setState({loaded: false});
    
    Promise.all([
      loadData('http://localhost:8000/get_invited_events_upcoming'),
      loadData('http://localhost:8000/get_invited_events_past'),
      loadData('http://localhost:8000/search_public_event'),
    ]).then(values => {
      console.log(values);
      this.setState({
        upcomingInvitedEvents: values[0].events,
        pastInvitedEvents: values[1].events,
        upcomingEvents: values[2].results,
        loaded: true
      });
    })
  }

  changeMenu = e => this.setState({currentMenu: e.key})

  selectEvent = id => {
    sessionStorage.setItem('event_id', id);
    this.setState({ viewingEvent: true });
  }

  render() {
    const {
      currentMenu,
      upcomingEvents,
      pastInvitedEvents,
      upcomingInvitedEvents,
      viewingEvent,
      loaded
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
    const updateDisplay = (includedElm, events) => {
      /*
        Update the display of the elements and show the cards based on what the user selected
      */
      let eventElms = ( events.length > 0 ?
        [] :
        <Empty description="Could not find any events ..." style={{margin: 'auto'}} />
      );
      // Loop through the upcoming events
      for (let i = 0; i < events.length; ++i) {
        const upcomingEvent = events[i];
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
              <Button
                type="primary"
                onClick={() => this.selectEvent(upcomingEvent.id)}
              >View Event Details</Button>
            </Row>
          </Card>
        );
      }
      return (
        <React.Fragment>
          <Menu mode="horizontal" onClick={this.changeMenu} selectedKeys={[this.state.currentMenu]}>
            <Menu.Item key="public">
              <Icon type="eye" />
              Public Events
            </Menu.Item>
            <Menu.Item key="invited">
              <Icon type="mail" />
              Invited Events
            </Menu.Item>
            <Menu.Item key="invitedPast">
              <Icon type="step-backward" />
              Past Invited Events
            </Menu.Item>
          </Menu>
          {includedElm}
          <Row type="flex">
            {eventElms}
          </Row>
        </React.Fragment>
      );
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (viewingEvent) {
      displayElm = <Redirect to="/event_details" />;
    } else if (loaded && currentMenu === 'public') {
      displayElm = updateDisplay(
        <Row style={{marginTop: '1em'}}>
          <Search
            placeholder="Name of event ..."
            onSearch={value => this.loadEvents(value)}
            enterButton
          />
        </Row>, upcomingEvents
      );
    } else if (loaded && currentMenu === 'invited') {
      displayElm = updateDisplay(null, upcomingInvitedEvents);
    } else if (loaded && currentMenu === 'invitedPast') {
      displayElm = updateDisplay(null, pastInvitedEvents);
    }

    return (
      <React.Fragment>
        <Title level={2}>Event Viewer</Title>
        <p>View a list of upcoming events made by other users. You can also search for events here</p>
        {displayElm}
      </React.Fragment>
    );
  }
}

EventViewer.contextType = TokenContext;

export default EventViewer;
