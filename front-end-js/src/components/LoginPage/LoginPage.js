import { Form, Button, Icon, Input, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

class LoginPage extends React.Component {
  state = {
    submitting: false
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({submitting: true});

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        console.log('Received values of: ', values);
        const res = await fetch('http://localhost:8000/log_in', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })

        const data = await res.json();
        this.props.onLogin(data.token);
        this.setState({submitting: false});
      }
    })
  }

  render() {
    const { submitting } = this.state
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="form-wrapper">
        <Form onSubmit={this.handleSubmit}>
          <Title level={2}>LOGIN</Title>
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
              disabled={submitting}
            />)}
          </Form.Item>
          <Form.Item label="Password">
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
                disabled={submitting}
              />,
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              disabled={submitting}
            >
              Log in
            </Button>
            <a className="login-form-forgot">
              Forgot password
            </a> Or <a onClick={() => this.props.toggleRegister()}>register now!</a>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedLoginPage = Form.create({name: 'login_form'})(LoginPage);

export default WrappedLoginPage;
