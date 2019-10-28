/*
  Edit the sessions of an event
 */
import { DatePicker, Form, InputNumber, Modal, Row, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../../../context/TokenContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

class AddSession extends React.Component {
  render() {
    const { onCancel, visible } = this.props;

    return (
      <Modal
        onCancel={onCancel}
        visible={visible}
      >
        <Title level={2}>Create New Event</Title>
        <Row>
          <Form.Item label="Session Date">
            <RangePicker style={{width: '100%'}}/>
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Recurrences">
            <InputNumber defaultValue={1} min={1} />
          </Form.Item>
        </Row>
      </Modal>
    );
  }
}

AddSession.contextType = TokenContext;

export default AddSession;
