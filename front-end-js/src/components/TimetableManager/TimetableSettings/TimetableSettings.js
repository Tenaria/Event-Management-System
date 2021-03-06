import { Button, List, Icon, message, Row, Select, Spin, Typography } from 'antd';
import React from 'react';

import TokenContext from '../../../context/TokenContext';

const { Title } = Typography;
const { Option } = Select;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class TimetableSettings extends React.Component {
  state = {
    allowedUsers: [],
    users: [],
    selectedUser: null,
    loaded: false
  }

  componentDidMount = async () => {
    const { token } = this.context;

    const res = await fetch('http://localhost:8000/get_timetable_privacy', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token})
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log(data);
      this.setState({ allowedUsers: data.users_with_access, loaded: true });
    } else {
      message.error(data.error);
    }
  }

  handleSearch = value => {
    /*
      Once an user has entered more than 2 characters in the search bar, we will perform an ajax
      request for a list of users that has an email that contains the character specified.
    */
    const { token } = this.context;

    if (value.length <= 2) return;

    fetch('http://localhost:8000/get_emails_exclude_user', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search_term: value,
        token
      })
    }).then(async res => {
      const data = await res.json();
      this.setState({users: data.results});
    });
  }
  handleChange = value => {
    this.setState({ selectedUser: value });
  }
  onSelect = (value, elm) => {
    // When we select an attendee, add them to the list of attendees
    const { allowedUsers } = this.state;

    for (let i = 0; i < allowedUsers.length; ++i) {
      if (allowedUsers[i].id === parseInt(value)) return;
    }

    allowedUsers.push({
      id: value,
      email: elm.props.children
    });
    this.setState({allowedUsers});
  }
  updateTimetable = async () => {
    const { token } = this.context;
    const { allowedUsers } = this.state;

    const userIds = allowedUsers.map(e => parseInt(e.id));

    const res = await fetch('http://localhost:8000/update_timetable_privacy', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        user_ids: userIds
      })
    });

    const data = await res.json();
    if (res.status === 200) {
      message.success('Successfully updated timetable privacy!');
    } else {
      message.error(data.error);
    }
  }
  deleteUser = id => {
    const { allowedUsers } = this.state;
    let indexOfData = -1;

    for (let i = 0; i < allowedUsers.length; ++i) {
      if (allowedUsers[i].id === id){
        indexOfData = i;
        break;
      }
    }

    if (indexOfData > -1) {
      allowedUsers.splice(indexOfData, 1);
    }

    console.log(allowedUsers);

    this.setState({ allowedUsers: [] });
    this.setState({ allowedUsers });
  }

  render() {
    const { allowedUsers, loaded, users, selectedUser } = this.state;
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    const loader = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;
    const options = users.map(d => <Option key={d.id}>{d.email}</Option>);

    return (
      <React.Fragment>
        <Title level={2}>Timetable Privacy</Title>
        <Row style={{marginBottom: '1em'}} type="flex">
          <Row style={{paddingRight: '1em'}} type="flex" justify="center" align="middle">
            Enter the email of the person you allow to view your timetable:
          </Row>
          <div style={{flexGrow: 1}}>
            <Select
              showSearch
              value={selectedUser}
              placeholder="Email of the person"
              style={{ width: '100%' }}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={this.handleSearch}
              onChange={this.handleChange}
              onSelect={this.onSelect}
              notFoundContent={null}
              disabled={!loaded}
            >
              {options}
            </Select>
          </div>
        </Row>
        <Row style={{marginBottom: '1em', textAlign: 'center'}}>
          <Button
            onClick={this.updateTimetable}
            type="primary"
            disabled={!loaded}
          >Update Timetable</Button>
        </Row>
        <Row>
          <List
            bordered
            dataSource={allowedUsers}
            header="People who have access to your timetable"
            renderItem = {item => (
              <List.Item key={item.id} style={{display: 'flex'}}>
                <div style={{flexGrow: 1}}>{item.email}</div>
                <div style={{paddingLeft: '0.5em', textAlign: 'right'}}>
                  <Button
                    type="danger"
                    icon="delete"
                    onClick={() => this.deleteUser(item.id)}
                  />
                </div>
              </List.Item>
            )}
          >
            {loaded ? null : loader}
          </List>
        </Row>
      </React.Fragment>
    );
  }
}

TimetableSettings.contextType = TokenContext;

export default TimetableSettings;
