import { Form, Button, Icon, Input, Col, Row, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import React from 'react';

const { Title } = Typography;

class RegisterForm extends React.Component<FormComponentProps, {}> {

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of: ', values);
      }
    })
  }

  compareToFirstPassword = (rule : any, value : any, callback : any) => {
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
                {getFieldDecorator('first_name', {
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
                {getFieldDecorator('last_name', {
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
            {getFieldDecorator('confirm_password', {
              rules: [{
                required: true,
                message: 'Please confirm your password!',
              },{
                validator: this.compareToFirstPassword
              }],
            })(<Input.Password />)}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Register</Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedRegisterForm = Form.create({name: 'account_details'})(RegisterForm);

export default WrappedRegisterForm;
