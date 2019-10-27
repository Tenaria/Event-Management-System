/*
  This allows you to view the events that are available for the user
 */
import { Divider, Empty, Icon, Spin, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EventViewer extends React.Component {
  state = {
  };

  render() {
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let eventElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    return (
      <React.Fragment>
        <Title level={2}>Event Viewer</Title>
        <p>View a list of upcoming events made by other users. You can also search for events here</p>
        <Divider orientation="left">Events</Divider>
      </React.Fragment>
    );
  }
}

EventViewer.contextType = TokenContext;

export default EventViewer;
