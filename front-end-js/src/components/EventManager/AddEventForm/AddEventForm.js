import { Form, Checkbox, Icon, Input, message, Modal, Row, Typography} from 'antd';
import React from 'react';

import TokenContext from '../../../context/TokenContext';

const { Title } = Typography;
const { TextArea } = Input;

class AddEventForm extends React.Component {
  handleCreate = () => {
    const { token } = this.context;

    this.props.form.validateFieldsAndScroll( async (err, values) => {
      if (!err) {
        console.log('Received values of: ', values);

        const sendData = {...values, token};

        console.log(sendData);

        const res = await fetch('http://localhost:8000/create_event', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(sendData)
        });

        if (res.status === 200) {
          message.success('You have successfully added an event!');
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
          <Title level={2}>Create New Event</Title>
          <Row>
            <Form.Item label="Event Name">
              {getFieldDecorator('event', {
                rules: [{
                  required: true,
                  message: 'Please enter a name for the event!',
                }],
              })(<Input
                placeholder="Event Name"
                prefix={<Icon type="tag" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />)}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="Event Location">
              {getFieldDecorator('event_location', {
                rules: [{
                  required: true,
                  message: 'Please set a location to have the event!',
                }],
              })(<Input
                placeholder="Event Location"
                prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />)}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item style={{margin: 0}}>
              {getFieldDecorator('event_public', {
                valuePropName: 'checked',
                initialValue: false,
              })(<Checkbox>Public Event</Checkbox>)}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="Event Description">
              {getFieldDecorator('desc', {
                initialValue: '',
                rules: [{ required: false }],
              })(<TextArea placeholder="Event Description" rows={7} />)}
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  }
}

AddEventForm.contextType = TokenContext;

const WrappedAddEventForm = Form.create({name: 'add_event_form'})(AddEventForm);

export default WrappedAddEventForm;
