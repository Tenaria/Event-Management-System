/*
  This allows you to view the events that are available for the user
 */
import { Card, Divider, Empty, Icon, Input, Row, Spin, Tooltip, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const { Search } = Input;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventViewer extends React.Component {
  state = {
    upcomingEvents: null,
    loaded: false
  };

  searchForEvents = value => {
    console.log(value);
  }

  render() {
    const { upcomingEvents, loaded } = this.state;
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

    return (
      <React.Fragment>
        <Title level={2}>Event Viewer</Title>
        <p>View a list of upcoming events made by other users. You can also search for events here</p>
        <Search
          placeholder="Name of event ..."
          onSearch={this.searchForEvents}
          enterButton
        />
        <Divider orientation="left">Events</Divider>
        <Row type="flex">
          {eventElms}
        </Row>
      </React.Fragment>
    );
  }
}

EventViewer.contextType = TokenContext;

export default EventViewer;
