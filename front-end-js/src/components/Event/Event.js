import { Divider, Empty, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

class Event extends React.Component {
  constructor(props) {
    super(props);

    const eventID = sessionStorage.getItem('event_id');

    this.state = { eventID };
  }

  render() {
    const { eventID } = this.state;
    let eventElm = <Empty description={<span>No event found with the ID</span>}/>;

    if (eventID) {
      eventElm = <div>{ eventID }</div>;
    }

    return (
      <React.Fragment>
        <Title level={2}>Event</Title>
        <p>View a single event and edit it.</p>
        <Divider orientation="left">Event</Divider>
        <div>
          { eventElm }
        </div>
      </React.Fragment>
    );
  }
}

export default Event;
