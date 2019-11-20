import { Form, Button, Icon, Input, Col, Row, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

class RegisterForm extends React.Component {
  state = { confirm: false, sending: false }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll( async (err, values) => {
      if (!err) {
        this.setState({ sending: true });

        const res = await fetch('http://localhost:8000/sign_up', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(values)
        });

        console.log(res);

        if (res.status === 200) {
          this.setState({confirm: true, sending: false});
        }
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

  registerAgain = () => this.setState({confirm: false});

  render() {
    const { confirm, sending } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="form-wrapper">
        {!confirm ? <Form onSubmit={this.handleSubmit}>
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
                  disabled={sending}
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
                  disabled={sending}
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
              disabled={sending}
            />)}
          </Form.Item>
          <Form.Item label="Password" hasFeedback>
            {getFieldDecorator('password', {
              rules: [{
                required: true,
                message: 'Please enter a password!',
              }],
            })(<Input.Password disabled={sending}/>)}
          </Form.Item>
          <Form.Item label="Confirm Password" hasFeedback>
            {getFieldDecorator('password_confirm', {
              rules: [{
                required: true,
                message: 'Please confirm your password!',
              },{
                validator: this.compareToFirstPassword
              }],
            })(<Input.Password disabled={sending}/>)}
          </Form.Item>
          <Form.Item>
            <Button.Group>
              <Button type="primary" htmlType="submit" disabled={sending}>Register</Button>
              <Button type="danger" onClick={() => this.props.toggleRegister()} disabled={sending}>Cancel</Button>
            </Button.Group>
          </Form.Item>
        </Form> : 
        <div 
          style={{
            backgroundColor: 'white',
            margin: 'auto',
            maxWidth: '720px',
            height: '100vh',
            padding: '5em 2em'
          }}
        >
          <Row type="flex" justify="center" style={{fontSize: '48px'}}>
            <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"/>
          </Row>
          <Row>
            <p style={{fontSize: '24px', margin: '1em 0em', textAlign: 'center'}}>
              Your account registeration has being confirmed. You should soon receive an email to
              activate your account.
            </p>
            <p style={{fontSize: '18px', textAlign: 'center'}}>
              <Button
                onClick={() => this.props.toggleRegister()}
                type="link"
                style={{fontSize: '18px'}}
              >Go Back</Button>
              or
              <Button
                onClick={this.registerAgain}
                type="link"
                style={{fontSize: '18px'}}
              >Register Again</Button> 
            </p>
          </Row>
        </div>}
      </div>
    );
  }
}

const WrappedRegisterForm = Form.create({name: 'account_details'})(RegisterForm);

export default WrappedRegisterForm;
