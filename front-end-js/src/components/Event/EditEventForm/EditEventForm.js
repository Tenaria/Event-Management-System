import { Button, Form, Checkbox, Icon, Input, message, Row } from 'antd';
import React from 'react';

import EventContext from '../../../context/EventContext';

const { TextArea } = Input;

class EditEventForm extends React.Component {
  state = {
    data: [],
    value: undefined
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, token } = this.context;

    this.props.form.validateFieldsAndScroll( async (err, values) => {
      if (!err) {
        console.log('Received values of: ', values);
        const sendData = {
          ...values,
          token,
          event_id: id,
          event_attendees: null
        };
        console.log(sendData);

        const res = await fetch('http://localhost:8000/edit_event', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(sendData)
        });

        if (res.status === 200) {
          message.success('You have successfully edited an event!');
        } else {
          message.error('The system has encountered an error. Contact your admin!');
        }
      }
    })
  }

  render() {
    const { name, desc, event_public, location } = this.context;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Form.Item label="Event Name">
            {getFieldDecorator('event_name', {
              initialValue: name,
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
              initialValue: location,
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
              initialValue: event_public,
              valuePropName: 'checked',
            })(<Checkbox>Public Event</Checkbox>)}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Event Description">
            {getFieldDecorator('event_desc', {
              initialValue: desc,
              rules: [{ required: false }],
            })(<TextArea placeholder="Event Description" rows={7} />)}
          </Form.Item>
        </Row>
        <Row>
          <Button type="primary" htmlType="submit" block>Update Event Details</Button>
        </Row>
      </Form>
    );
  }
}

EditEventForm.contextType = EventContext;

const WrappedEditEventForm = Form.create({name: 'edit_event_form'})(EditEventForm);

export default WrappedEditEventForm;
