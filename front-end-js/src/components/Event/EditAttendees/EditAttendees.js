/*
  Edit the attendees of an event.
 */
import { Avatar, Button, Icon, message, Row, Select, Spin, Tooltip } from 'antd';
import React from 'react';

import EventContext from '../../../context/EventContext';

const { Option } = Select;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EditAttendees extends React.Component {
  state = {
    data: [],
    value: undefined,
    attendees: [],
    loaded: false
  };

  componentDidMount = async () => {
    const { id, token } = this.context;

    const res = await fetch('http://localhost:8000/get_attendees_of_event', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: id,
        token
      })
    });

    const data = await res.json();
    if (res.status === 200) {
      this.setState({attendees: data.attendees, loaded: true});
    } else {
      this.setState({attendees: [], loaded: true});
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
      this.setState({data: data.results});
    });
  }

  handleChange = value => {
    this.setState({ value });
  }

  onSelect = (value, elm) => {
    // When we select an attendee, add them to the list of attendees
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

  removeAttendee = id => {
    const { attendees } = this.state;
    for (let i = 0; i < attendees.length; ++i) {
      if (attendees[i].id === id) {
        attendees.splice(i, 1);
        break;
      }
    }
    this.setState({attendees});
  }

  updateAttendees = async () => {
    /*
      We are going to update the attendees by hijacking the general edit event URL. This url will
      ignore attendees updates if it is set to NULL but we will provide an actual value.
     */
    const { id, name, desc, event_public, location, token } = this.context;
    const { attendees } = this.state;

    const attendeeIDs = attendees.map(a => parseInt(a.id));

    console.log(attendeeIDs);

    const res = await fetch('http://localhost:8000/edit_event', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        token,
        event_id: id,
        event_name: name,
        event_desc: desc,
        event_location: location,
        event_attendees: attendeeIDs,
        event_public
      })
    });

    if (res.status === 200) {
      message.success('You have successfully edited an event\'s attendance!');
    } else {
      message.error('The system has encountered an error. Contact your admin!');
    }
  }

  render() {
    const { userId } = this.context;
    const { attendees, data, value, loaded } = this.state;
    const options = data.map(d => <Option key={d.id}>{d.email}</Option>);
    const attendeeElm = attendees.map(a => (userId === a.id ?
      <Tooltip key={a.id} title={a.email}>
        <div style={{display: 'inline-block', margin: '1em 0.5em 0em 0em'}}>
          <Avatar icon="user" />
        </div>
      </Tooltip> :
      <Tooltip key={a.id} title={a.email}>
        <div
          className="attendee"
          style={{margin: '1em 0.5em 0em 0em'}}
          onClick={() => this.removeAttendee(a.id)}
        >
          <Icon className="delete" type="close-circle" theme="twoTone" twoToneColor="#ff0000"/>
          <Avatar icon="user" />
        </div>
    </Tooltip>
    ));
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    let displayElm = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    if (loaded) {
      displayElm = (
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
            >
              {options}
            </Select>
          </Row>
          <Row>{attendeeElm}</Row>
          <Row>
            <Button
              type="primary"
              style={{marginTop: '1em'}}
              onClick={this.updateAttendees}
              block
            >Update Attendees</Button>
          </Row>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {displayElm}
      </React.Fragment>
    );
  }
}

EditAttendees.contextType = EventContext;

export default EditAttendees;
