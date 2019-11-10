import { Card, Collapse, Empty, Icon,  Spin, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
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
      console.log(values);
      this.setState({
        upcomingEventsMe: values[0].events,
        upcomingEventsInvited: values[1].events,
        upcomingEventsPublic: values[2].results,
        loaded: true
      });
    })
  }

  render() {
    const { upcomingEventsMe, upcomingEventsInvited, upcomingEventsPublic } = this.state;

    const sliderStyle = {
      backgroundColor: '#2D3748',
      padding: '0em 2.2em',
      marginBottom: '2em'
    };

    const spinStyle = {
      padding: '2em',
      textAlign: 'center'
    }
  
    return (
      <div>
        <Title level={2}>Dashboard</Title>
      </div>
    );
  }
}

Dashboard.contextType = TokenContext;

export default Dashboard;
