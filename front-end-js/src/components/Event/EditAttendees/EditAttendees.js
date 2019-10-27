import { Select } from 'antd';
import React from 'react';

import TokenContext from '../../../context/TokenContext';

class EditAttendees extends React.Component {
  state = {
    data: [],
    value: undefined,
  };

  handleSearch = value => {
    console.log(value);

    fetch('http://localhost:8000/get_event_details', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: eventID,
        token
      })
    }).then(res => console.log(res));
  }

  handleChange = value => {
    this.setState({ value });
  }

  render() {
    return (
      <div>
          <Select
          showSearch
          value={this.state.value}
          placeholder="Enter name of the person you want to invite ..."
          style={{ width: '100%' }}
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
          notFoundContent={null}
        >
        </Select>
      </div>
    );
  }
}

EditAttendees.contextType = TokenContext;

export default EditAttendees;
