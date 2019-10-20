import { Card, Divider, Row } from 'antd';
import React from 'react';
import Slider from 'react-slick';

import TokenContext from '../../context/TokenContext';

class Dashboard extends React.Component {
  state = {
  }

  render() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow: <button type="button" class="">Previous</button>,
      nextArrow: <button type="button" class="slick-prev">Next</button>
    };

    const sliderStyle = {
      backgroundColor: '#2D3748',
      padding: '0em 2.2em',
      marginBottom: '2em'
    };

    return (
      <div>
        <Divider orientation="left">Recently Added Events</Divider>
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
