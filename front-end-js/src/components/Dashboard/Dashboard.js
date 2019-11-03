import { Card, Divider, Empty, Icon, Row, Spin, Typography } from 'antd';
import React from 'react';
import Slider from 'react-slick';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class Dashboard extends React.Component {
  state = {
    upcomingEvent: null
  }

  componentDidMount = async () => {
    const { token } = this.context;

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
    this.setState({upcomingEvent: data.events});
  }

  render() {
    const {upcomingEvent} = this.state;

    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    const sliderStyle = {
      backgroundColor: '#2D3748',
      padding: '0em 2.2em',
      marginBottom: '2em'
    };

    const spinStyle = {
      padding: '2em',
      textAlign: 'center'
    }

    let upcomingEventsElm = (
      <div style={spinStyle}>
        <Spin indicator={spinIcon} style={{color: 'white'}} />
      </div>
    );

    if (upcomingEvent) {
      if (upcomingEvent.length > 0) {
        upcomingEventsElm = [];
        upcomingEventsElm.push(
          <Card>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card>
        );
      } else {
        upcomingEventsElm = <div style={spinStyle}><Empty style={{color: 'white'}} /></div>;
      }
    }

    return (
      <div>
        <Title level={2}>Dashboard</Title>
        <Divider orientation="left">Recently Added Events</Divider>
        <Row style={sliderStyle}>{upcomingEventsElm}</Row>
        <Divider orientation="left">Your Upcoming Events</Divider>
        <Row style={sliderStyle}>
          <Slider {...settings}>
            <Card>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
            <Card>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </Slider>
        </Row>
        <Divider orientation="left">Events You Manage</Divider>
        <Row style={sliderStyle}>
          <Slider {...settings}>
            <Card>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
            <Card>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </Slider>
        </Row>
      </div>
    );
  }
}

Dashboard.contextType = TokenContext;

export default Dashboard;
