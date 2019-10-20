import { Form, Button, Icon, Input, Col, Row, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

class RegisterForm extends React.Component {

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll( async (err, values) => {
      if (!err) {
        console.log('Received values of: ', values);

        const res = await fetch('http://localhost:8000/sign_up', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(values)
        });

        console.log(res);
      }
    })
  }

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('Your passwords do not match!')
    } else {
      callback();
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="form-wrapper">
        <Form onSubmit={this.handleSubmit}>
          <Title level={2}>REGISTER FORM</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="First Name">
                {getFieldDecorator('fname', {
                  rules: [{
                    required: true,
                    message: 'Please enter your first name!',
                  }],
                })(<Input
                  placeholder="First Name"
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name">
                {getFieldDecorator('lname', {
                  rules: [{
                    required: true,
                    message: 'Please enter your last name!',
                  }],
                })(<Input
                  placeholder="Last Name"
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Email">
            {getFieldDecorator('email', {
              rules: [{
                type: 'email',
                message: 'The input is not valid E-mail!',
              },{
                required: true,
                message: 'Please input your E-mail!',
              }],
            })(<Input
              placeholder="Email"
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />)}
          </Form.Item>
          <Form.Item label="Password" hasFeedback>
            {getFieldDecorator('password', {
              rules: [{
                required: true,
                message: 'Please enter a password!',
              }],
            })(<Input.Password />)}
          </Form.Item>
          <Form.Item label="Confirm Password" hasFeedback>
            {getFieldDecorator('password_confirm', {
              rules: [{
                required: true,
                message: 'Please confirm your password!',
              },{
                validator: this.compareToFirstPassword
              }],
            })(<Input.Password />)}
          </Form.Item>
          <Form.Item>
            <Button.Group>
              <Button type="primary" htmlType="submit">Register</Button>
              <Button type="danger" onClick={() => this.props.toggleRegister()}>Cancel</Button>
            </Button.Group>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedRegisterForm = Form.create({name: 'account_details'})(RegisterForm);

export default WrappedRegisterForm;
