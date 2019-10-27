import { Avatar, Button, Row, Select, Tooltip } from 'antd';
import React from 'react';

import TokenContext from '../../../context/TokenContext';

const { Option } = Select;

class EditAttendees extends React.Component {
  state = {
    data: [],
    value: undefined,
    attendees: [],
    disabled: false
  };

  handleSearch = value => {
    const token = this.context;

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
      this.setState({data: data.results});
    });
  }

  handleChange = value => {
    this.setState({ value });
  }

  onSelect = (value, elm) => {
    const { attendees } = this.state;

    for (let i = 0; i < attendees.length; ++i) {
      if (attendees[i].id === value) return;
    }

    attendees.push({
      id: value,
      email: elm.props.children
    });
    this.setState({attendees})
  }

  render() {
    const { attendees, data, disabled, value } = this.state;
    const options = data.map(d => <Option key={d.id}>{d.email}</Option>);
    const attendeeElm = attendees.map(a =>
      <Tooltip key={a.id} title={a.email}>
        <Avatar icon="user" style={{margin: '1em 0.5em 0em 0em'}} />
      </Tooltip>
    );
    return (
      <React.Fragment>
        <Row>
            <Select
            showSearch
            value={value}
            placeholder="Enter name of the person you want to invite ..."
            style={{ width: '100%' }}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={this.handleSearch}
            onChange={this.handleChange}
            onSelect={this.onSelect}
            notFoundContent={null}
            disabled={disabled}
          >
            {options}
          </Select>
        </Row>
        <Row>{attendeeElm}</Row>
        <Row>
          <Button type="primary" style={{marginTop: '1em', width: '100%'}}>Update Attendees</Button>
        </Row>
      </React.Fragment>
    );
  }
}

EditAttendees.contextType = TokenContext;

export default EditAttendees;
