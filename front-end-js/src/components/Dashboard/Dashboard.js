import { Button, Card, Collapse, Empty, Icon, Row, Spin, Tag, Typography, Col } from 'antd';
import React from 'react';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const { Panel } = Collapse;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class Dashboard extends React.Component {
  state = {
    upcomingEventsMe: [],
    upcomingEventsInvited: [],
    upcomingEventsPublic: [],
    loaded: false
  }

  componentDidMount = () => {
    const { token } = this.context;
    
    const loadData = url => new Promise(async (resolve, reject) => {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (res.status === 200) {
        const data = await res.json();
        console.log(url, data);
        resolve(data);
      } else {
        resolve({events: []});
      }
    });

    Promise.all([
      loadData('http://localhost:8000/get_upcoming_events'),
      loadData('http://localhost:8000/get_invited_events_upcoming'),
      loadData('http://localhost:8000/search_public_event'),
    ]).then(values => {
      this.setState({
        upcomingEventsMe: values[0].events,
        upcomingEventsInvited: values[1].events,
        upcomingEventsPublic: values[2].results,
        loaded: true
      });
    })
  }

  render() {
    const { upcomingEventsMe, upcomingEventsInvited, upcomingEventsPublic, loaded } = this.state;
  
    const cardStyle = {
      margin: '1%',
      width: '30%'
    };

    const spinStyle = {
      padding: '2em',
      textAlign: 'center'
    }

    const myUpcomingEventElms = [];
    const myUpcomingInvitedElms = [];
    const upcomingElms = [];

    for (let i in upcomingEventsMe) {
      let event = upcomingEventsMe[i];

      const tagElms = event.events_tags.map(tag =>
        <Tag>{tag}</Tag>
      );

      myUpcomingEventElms.push(
        <Card
          className="my-event-card"
          key={i}
          style={cardStyle}
          size="small"
          title={event.events_name}
        >
          <div>{tagElms}</div>
          <p>{event.events_desc ? event.events_desc : 'No description'}</p>
          <Row style={{
            position: 'absolute',
            right: '1em',
            bottom: '1em'
          }}>
            <Button
              icon="eye"
              type="primary"
              onClick={() => this.selectEvent(event.events_id)}
            />
          </Row>
        </Card>
      );
    }

    for (let i in upcomingEventsMe) {
      let event = upcomingEventsMe[i];

      const tagElms = event.events_tags.map(tag =>
        <Tag>{tag}</Tag>
      );

      myUpcomingEventElms.push(
        <Card
          className="my-event-card"
          key={i}
          style={cardStyle}
          size="small"
          title={event.events_name}
        >
          <div>{tagElms}</div>
          <p>{event.events_desc ? event.events_desc : 'No description'}</p>
          <Row style={{
            position: 'absolute',
            right: '1em',
            bottom: '1em'
          }}>
            <Button
              icon="eye"
              type="primary"
              onClick={() => this.selectEvent(event.events_id)}
            />
          </Row>
        </Card>
      );
    }

    for (let i in upcomingEventsMe) {
      let event = upcomingEventsMe[i];

      const tagElms = event.events_tags.map(tag =>
        <Tag>{tag}</Tag>
      );

      myUpcomingEventElms.push(
        <Card
          className="my-event-card"
          key={i}
          style={cardStyle}
          size="small"
          title={event.events_name}
        >
          <div>{tagElms}</div>
          <p>{event.events_desc ? event.events_desc : 'No description'}</p>
          <Row style={{
            position: 'absolute',
            right: '1em',
            bottom: '1em'
          }}>
            <Button
              icon="eye"
              type="primary"
              onClick={() => this.selectEvent(event.events_id)}
            />
          </Row>
        </Card>
      );
    }
  
    return (
      <div>
        <Title level={2}>Dashboard</Title>
        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel header="My Upcoming Events" key="1">
            {myUpcomingEventElms}
          </Panel>
          <Panel header="My Upcoming Invited Events" key="2">
          </Panel>
          <Panel header="Upcoming Public Events" key="3">
          </Panel>
        </Collapse>
      </div>
    );
  }
}

Dashboard.contextType = TokenContext;

export default Dashboard;
