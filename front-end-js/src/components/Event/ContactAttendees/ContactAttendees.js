import { Form, Checkbox, Icon, Input, message, Modal, Row, Select, Typography} from 'antd';
import React from 'react';

import TokenContext from '../../../context/TokenContext';

const { Title } = Typography;
const { TextArea } = Input;

class ContactAttendees extends React.Component {
  handleCreate = () => {
    const { id, token } = this.context;

    this.props.form.validateFieldsAndScroll( async (err, values) => {
      if (!err) {
        console.log('Received values of: ', values);

        console.log(values);
        const eventID = sessionStorage.getItem('event_id');
        
        const sendData = {...values, event_id: eventID, token};

        console.log(sendData);

        //console.log(id);
        const res = await fetch('http://localhost:8000/notify_attendees', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(sendData)
        });

        if (res.status === 200) {
          message.success('You have successfully notified the attendees!');
          this.props.onCancel();
        } else {
          message.error('The system has encountered an error. Contact your admin!');
        }
      }
    })
  }

  render() {
    const { onCancel, visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        onOk={this.handleCreate}
        onCancel={onCancel}
        visible={visible}
      >
        <Form onSubmit={this.handleSubmit}>
          <Title level={2}>Contact Attendees</Title>
          <Row>
            <Form.Item label="Subject">
              {getFieldDecorator('subject', {
                rules: [{
                  required: true,
                  message: 'Please enter a subject for the email!',
                }],
              })(<Input
                placeholder="Subject"
                prefix={<Icon type="tag" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />)}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="Body">
              {getFieldDecorator('body', {
                rules: [{
                  required: true,
                  message: 'Please set a body for the email!',
                }],
              })(<TextArea
                placeholder="Body"
                prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />)}
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  }
}

ContactAttendees.contextType = TokenContext;

const WrappedContactAttendees = Form.create({name: 'add_event_form'})(ContactAttendees);

export default WrappedContactAttendees;
