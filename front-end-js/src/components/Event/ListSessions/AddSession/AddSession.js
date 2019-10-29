/*
  Edit the sessions of an event
 */
import { DatePicker, Form, InputNumber, message, Modal, Row, Typography } from 'antd';
import React from 'react';

import EventContext from '../../../../context/EventContext';

const { RangePicker } = DatePicker;
const { Title } = Typography;

class AddSession extends React.Component {
  state = {
    disabled: false,
    startDateTime: null,
    endDateTime: null
  }

  onOk = value => {
    this.setState({
      startDateTime: value[0].valueOf(),
      endDateTime: value[1].valueOf()
    })
  }

  submitSession = async () => {
    const { id, token } = this.context;
    const { disabled, startDateTime, endDateTime } = this.state;

    if (disabled) return;
    console.log('Not disabled!');
    this.setState({disabled: true});

    const res = await fetch('http://localhost:8000/create_event_sessions', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: id,
        start_timestamp: startDateTime,
        end_timestamp: endDateTime,
        token
      })
    });

    this.setState({disabled: false});

    if (res.status === 200) {
      message.success('You have successfully added a session!');
      this.props.onCancel();
    } else {
      message.error('The system has encountered an error. Contact your admin!');
    }
  }

  render() {
    const { onCancel, visible } = this.props;

    return (
      <Modal
        onCancel={onCancel}
        onOk={this.submitSession}
        visible={visible}
      >
        <Title level={2}>Create New Event</Title>
        <Row>
          <Form.Item label="Session Date" style={{margin: 0}}>
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder={['Start Time', 'End Time']}
              style={{width: '100%'}}
              onOk={this.onOk}
            />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Recurrences" style={{margin: 0}}>
            <InputNumber defaultValue={1} min={1} />
          </Form.Item>
        </Row>
      </Modal>
    );
  }
}

AddSession.contextType = EventContext;

export default AddSession;
