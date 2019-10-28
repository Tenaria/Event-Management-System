/*
  Edit the sessions of an event
 */
import { Form, Modal, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../../../context/TokenContext';

const { Title } = Typography;

class AddSession extends React.Component {
  render() {
    const { onCancel, visible } = this.props;

    return (
      <Modal
        onCancel={onCancel}
        visible={visible}
      >
        <Form>
          <Title level={2}>Create New Event</Title>
        </Form>
      </Modal>
    );
  }
}

AddSession.contextType = TokenContext;

const WrappedAddSession = Form.create({name: 'add_session_form'})(AddSession);

export default WrappedAddSession;
