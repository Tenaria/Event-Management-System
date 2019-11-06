import { Avatar, Button, Divider, Row, Skeleton, Typography } from 'antd';
import React from 'react';

import AccountEdit from './AccountEdit';
import AccountInfo from './AccountInfo';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;

class AccountDetail extends React.Component {
  state = {
    fName: 'John',
    lName: 'Smith',
    email: 'johnsmith@temp.com',
    editing: false,
    loaded: false,
  }

  componentDidMount = () => {
    this.loadInfo();
  }

  loadInfo = async () => {
    const { token } = this.context;

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

    this.setState({
      fName: data.users_fname,
      lName: data.users_lname,
      email: data.users_email,
      loaded: true
    });
  }

  toggleEdit = () => {
    this.loadInfo();
    this.setState({ editing: !this.state.editing });
  }

  render() {
    const { fName, lName, email, editing, loaded } = this.state;
    let displayElm = <Skeleton avatar active paragraph={{ rows: 14 }} />;
    
    if (loaded) {
      displayElm = (
        <React.Fragment>
          <div>
            <Row type="flex">
              <Avatar size={64} icon="user" />
              <div style={{margin: "0.5em"}}></div>
              <Row type="flex" justify="center" style={{flexDirection: "column"}}>
                <Title level={4} style={{margin: 0}}>{fName} {lName}</Title>
                <div>{email}</div>
              </Row>
            </Row>
            <Divider orientation="left">Details</Divider>
            <Row style={{marginBottom: '1em'}}>
              Lorem ipsum dolor sit amet, veri movet id est, usu te temporibus instructior. Omnis regione epicurei et per, in qui errem tamquam fierent. Id quem fuisset ius. Assum erant definitionem ad eam, apeirian expetenda duo ex. Fugit omittantur conclusionemque sit no, qui te augue abhorreant. Agam legere vis ei.
            </Row>
            <AccountEdit fName={fName} lName={lName} toggleEdit={this.toggleEdit} />;
          </div>
        </React.Fragment>
      );
    }

    return displayElm;
  }
}

AccountDetail.contextType = TokenContext;

export default AccountDetail;
