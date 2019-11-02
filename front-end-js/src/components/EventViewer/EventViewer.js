/*
  This allows you to view the events that are available for the user
 */
import { Button, Card, Empty, Icon, Input, Menu, Row, Spin, Typography } from 'antd';
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
    loaded: false
  };

  componentDidMount = () => {
    this.loadEvents('');
  }

  loadEvents = term => {
    const token = this.context;

    this.setState({loaded: false});

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
        resolve([]);
      }
    });

    Promise.all([
      loadData('http://localhost:8000/get_invited_events_upcoming'),
      loadData('http://localhost:8000/search_public_event'),
    ]).then(values => {
      console.log(values);
      this.setState({
        upcomingInvitedEvents: values[0].events,
        upcomingEvents: values[1].results,
        loaded: true
      });
    })
  }

  changeMenu = e => this.setState({currentMenu: e.key})

  render() {
    const { currentMenu, upcomingEvents, upcomingInvitedEvents, loaded } = this.state;
    const cardStyle = {
      margin: '1%',
      width: '30%'
    };
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (loaded && currentMenu === 'public') {
      let eventElms = ( upcomingEvents.length > 0 ?
        [] :
        <Empty description="Could not find any events ..." style={{margin: 'auto'}} />
      );
      // Loop through the upcoming events
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
              <Button type="primary" style={{marginRight: '1em'}}>Confirm Going</Button>
              <Button type="primary">View Event Detail</Button>
            </Row>
          </Card>
        );
      }
      displayElm = (
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
          </Menu>
          <Row style={{marginTop: '1em'}}>
            <Search
              placeholder="Name of event ..."
              onSearch={value => this.loadEvents(value)}
              enterButton
            />
          </Row>
          <Row type="flex" style={{marginTop: '1em'}}>
            {eventElms}
          </Row>
        </React.Fragment>
      );
    } else if (loaded && currentMenu === 'invited') {
      let eventElms = ( upcomingInvitedEvents.length > 0 ?
        [] :
        <Empty description="Could not find any events ..." style={{margin: 'auto'}} />
      );
      // Loop through the upcoming events
      for (let i = 0; i < upcomingInvitedEvents.length; ++i) {
        const upcomingEvent = upcomingInvitedEvents[i];
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
              <Button type="primary" style={{marginRight: '1em'}}>Confirm Going</Button>
              <Button type="primary">View Event Detail</Button>
            </Row>
          </Card>
        );
      }
      displayElm = (
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
          </Menu>
          <Row style={{marginTop: '1em'}}>
            <Search
              placeholder="Name of event ..."
              onSearch={value => this.loadEvents(value)}
              enterButton
            />
          </Row>
          <Row type="flex" style={{marginTop: '1em'}}>
            {eventElms}
          </Row>
        </React.Fragment>
      );
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
