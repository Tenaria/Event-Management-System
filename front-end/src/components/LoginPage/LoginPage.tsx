import { Form, Button, Icon, Input, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import React from 'react';

const { Title } = Typography;

class LoginPage extends React.Component<FormComponentProps, {}> {

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of: ', values);
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="form-wrapper">
        <Form onSubmit={this.handleSubmit}>
          <Title level={2}>LOGIN</Title>
          <Form.Item label="Username">
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Username"
              />,
            )}
          </Form.Item>
          <Form.Item label="Password">
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
              />,
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
            <a className="login-form-forgot" href="">
              Forgot password
            </a> Or <a href="">register now!</a>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedLoginPage = Form.create({name: 'login_form'})(LoginPage);

export default WrappedLoginPage;
