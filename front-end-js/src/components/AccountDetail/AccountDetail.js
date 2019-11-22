import { Button, message, PageHeader, Row, Skeleton, Switch, Divider } from 'antd';
import React from 'react';

import AccountEdit from './AccountEdit';

import TokenContext from '../../context/TokenContext';

class AccountDetail extends React.Component {
  state = {
    fName: 'John',
    lName: 'Smith',
    email: 'johnsmith@temp.com',
    editing: false,
    emailOptions: null,
    accountLoaded: false,
    emailLoaded: false,
    savingEmailOptions: false
  }

  componentDidMount = () => {
    this.loadInfo();
  }

  loadInfo = async () => {
    const { token } = this.context;

    Promise.all([
      new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/get_email_notifications', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({token})
        });

        const data = await res.json();
        resolve(data);
      }),
      new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/get_account_details', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({token})
        });

        const data = await res.json();
        resolve(data);
      })
    ]).then(values => {
      console.log(values);

      this.setState({
        fName: values[1].users_fname,
        lName: values[1].users_lname,
        email: values[1].users_email,
        emailOptions: values[0].emails_blocked_data,
        accountLoaded: true,
        emailLoaded: true
      });
    });
  }

  modifyEmailNotifications = (id, checked) => {
    const { emailOptions } = this.state;
    emailOptions[id] = checked;
    this.setState({emailOptions});
  }

  updateEmailOptions = async () => {
    const { token } = this.context;
    const { emailOptions } = this.state;
    const parsedOptions = [];

    this.setState({savingEmailOptions: true});

    for(let id in emailOptions) {
      if (emailOptions[id]) {
        parsedOptions.push(parseInt(id));
      }
    }

    const res = await fetch('http://localhost:8000/save_email_notifications', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_blocks: parsedOptions,
        token
      })
    });

    if (res.status === 200) {
      message.success('Successfully saved email options!');
      this.setState({savingEmailOptions: false});
    }
  }

  render() {
    const { fName, lName, emailOptions, accountLoaded, emailLoaded, savingEmailOptions } = this.state;
    let accountElm = <Skeleton active paragraph={{ rows: 8 }} />;
    let emailElm = <Skeleton active paragraph={{ rows: 8 }} />;
    
    if (accountLoaded) {
      accountElm = <AccountEdit fName={fName} lName={lName}/>;
    }

    if (emailLoaded && emailOptions) {
      emailElm = (
        <React.Fragment>
          <Row style={{marginBottom: '0.5em'}}>
            <Switch
              checked={emailOptions[1]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(1, checked)}
            />
            Block emails about cancellations/uncancellations of events
          </Row>
          <Row style={{marginBottom: '0.5em'}}>
            <Switch
              checked={emailOptions[2]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(2, checked)}
            />
            Block emails about cancellations/uncancellations of sessions
          </Row>
          <Row style={{marginBottom: '0.5em'}}>
            <Switch
              checked={emailOptions[3]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(3, checked)}
            />
            Block emails about when you are added / removed from an event
          </Row>
          <Row style={{marginBottom: '0.5em'}}>
            <Switch
              checked={emailOptions[4]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(4, checked)}
            />
            Block emails about when an user marks themselves as going / not going to one of your events
          </Row>
          <Row style={{marginBottom: '0.5em'}}>
            <Switch
              checked={emailOptions[5]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(5, checked)}
            />
            Block emails about when a session has being added to an event that you are interested in (Events that you have marked going to in general)
          </Row>
          <Row style={{marginBottom: '0.5em'}}>
            <Switch
              checked={emailOptions[6]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(6, checked)}
            />
            Block emails about changes have been made to your account (Recommended for security)
          </Row>
          <Row style={{marginBottom: '1em'}}>
            <Switch
              checked={emailOptions[7]}
              style={{marginRight: '1em'}}
              onClick={(checked) => this.modifyEmailNotifications(7, checked)}
            />
            Block emails about you having gained or have had your access to a timetable revoked
          </Row>
          <Button
            type="primary"
            style={{width: '100%'}}
            onClick={this.updateEmailOptions}
            disabled={savingEmailOptions}
          >Update Email Options</Button>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <PageHeader
          title="Edit Account"
          subTitle="Manage your account details"
          backIcon={false}
        />
        {accountElm}
        <Divider orientation="left">Email Options</Divider>
        {emailElm}
      </React.Fragment>
    );
  }
}

AccountDetail.contextType = TokenContext;

export default AccountDetail;
