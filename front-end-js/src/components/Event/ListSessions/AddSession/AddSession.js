/*
  Edit the sessions of an event
 */
import { DatePicker, Form, InputNumber, message, Modal, Row, Col, Select, Typography } from 'antd';
import React from 'react';

import EventContext from '../../../../context/EventContext';

const { RangePicker } = DatePicker;
const { Title } = Typography;

class AddSession extends React.Component {
  state = {
    disabled: false,
    startDateTime: null,
    endDateTime: null,
    freq: 1,
    freqType: 'null'
  }

  changeFreq = value => this.setState({ freq: value });
  changeFreqType = value => this.setState({ freqType: value });

  onOk = value => {
    this.setState({
      startDateTime: value[0].valueOf(),
      endDateTime: value[1].valueOf()
    })
  }

  submitSession = async () => {
    const { id, token } = this.context;
    const { disabled, freq, freqType, startDateTime, endDateTime } = this.state;

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
        recurring: freq,
        recurring_descriptor: (freqType === 'null' ? null : freqType),
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
    const { freqType } = this.state;
    const { onCancel, visible } = this.props;

    return (
      <Modal
        onCancel={onCancel}
        onOk={this.submitSession}
        visible={visible}
      >
        <Title level={2}>Create New Session</Title>
        <Row>
          <Form.Item label="Session Date" style={{margin: 0}}>
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder={['Start Time', 'End Time']}
              style={{width: '100%'}}
              onChange={this.onOk}
            />
          </Form.Item>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Frequency" style={{margin: 0}}>
              <InputNumber
                defaultValue={1}
                min={1}
                style={{width: '100%'}}
                onChange={this.changeFreq}
                disabled={freqType === 'null' ? true : false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Type" style={{margin: 0}}>
              <Select
                defaultValue={freqType}
                style={{width: '100%'}}
                onChange={this.changeFreqType}
              >
                <Select.Option value="null">No Repeats</Select.Option>
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="fortnightly">Fortnightly</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
                <Select.Option value="yearly">Yearly</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    );
  }
}

AddSession.contextType = EventContext;

export default AddSession;
