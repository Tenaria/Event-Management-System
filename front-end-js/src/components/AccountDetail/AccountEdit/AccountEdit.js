import { Form, Button, Icon, Input, message, Popconfirm, Col, Row, Switch, Typography} from 'antd';
import React from 'react';

import TokenContext from '../../../context/TokenContext';

const { Title } = Typography;

class AccountEdit extends React.Component {
  state = {
    editPassword: false
  }

  handleSubmit = e => {
    e.preventDefault();

    const token = this.context;

    this.props.form.validateFieldsAndScroll( async (err, values) => {
      if (!err) {
        console.log('Received values of: ', values);

        const sendData = {
          fname: values.fname,
          lname: values.lname,
          password: (values.password ? values.password : null),
          password: (values.password_confirm ? values.password_confirm : null),
          token
        }

        console.log(sendData);

        const res = await fetch('http://localhost:8000/edit_account', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(sendData)
        });

        console.log(res);
        if (res.status === 200) {
          message.success('You have successfully editted your account!');
          this.props.toggleEdit()
        } else {
          message.error('The system has encountered an error. Contact your admin!');
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

  togglePassword = () => this.setState({ editPassword: !this.state.editPassword })

  render() {
    const { fName, lName } = this.props;
    const { editPassword } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Title level={2}>Edit Account</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="First Name">
                {getFieldDecorator('fname', {
                  initialValue: fName,
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
                  initialValue: lName,
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
          <Row style={{marginBottom: '1em'}}>
            <span>Change Password? </span>
            <Switch
              onChange={this.togglePassword}
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
            />
          </Row>
          {editPassword ?
            <React.Fragment>
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
            </React.Fragment> : ''
          }
          <Form.Item>
            <Row gutter={6}>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{width: '100%'}}
                >Edit Account</Button>
              </Col>
              <Col span={12}>
                <Popconfirm
                  title="Are you sure you want to stop editting?"
                  onConfirm={() => this.props.toggleEdit()}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="danger" style={{width: '100%'}}>Cancel</Button>
                </Popconfirm>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

AccountEdit.contextType = TokenContext;

const WrappedAccountEdit = Form.create({name: 'account_edit'})(AccountEdit);

export default WrappedAccountEdit;
