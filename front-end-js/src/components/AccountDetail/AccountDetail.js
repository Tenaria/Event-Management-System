import { Skeleton } from 'antd';
import React from 'react';

import AccountEdit from './AccountEdit';
import AccountInfo from './AccountInfo';

import TokenContext from '../../context/TokenContext';

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
    const token = this.context;

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
      if (editing) {
        displayElm = <AccountEdit fName={fName} lName={lName} toggleEdit={this.toggleEdit} />;
      } else {
        displayElm = <AccountInfo fName={fName} lName={lName} email={email} toggleEdit={this.toggleEdit} />;
      }
    }

    return (
      <React.Fragment>
        { displayElm }
      </React.Fragment>
    );
  }
}

AccountDetail.contextType = TokenContext;

export default AccountDetail;
