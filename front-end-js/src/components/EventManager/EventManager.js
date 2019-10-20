import { Card, Divider, Icon, Row, Typography } from 'antd';
import React from 'react';

import AddEventForm from './AddEventForm';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;

class EventManager extends React.Component {
  state = {
    addEvent: false
  }

  toggleAddForm = () => this.setState({addEvent: !this.state.addEvent})
  closeAddForm = () => this.setState({addEvent: false})

  render() {
    const { addEvent } = this.state;
    const cardStyle = {
      margin: '1em',
      width: 375
    }
    return (
      <div>
        <Title level={2}>Event Manager</Title>
        <Divider orientation="left">Your Events</Divider>
        <Row type="flex">
          <Card className="add-event-card" style={cardStyle} onClick={this.toggleAddForm}>
            <Icon type="plus" style={{fontSize: 48}} />
          </Card>
        </Row>
        <AddEventForm visible={addEvent} onCancel={this.closeAddForm} />
      </div>
    );
  }
}

EventManager.contextType = TokenContext;

export default EventManager;
