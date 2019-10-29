/*
  Edit the sessions of an event
 */
import { Button, DatePicker, List, message } from 'antd';
import React from 'react';
import moment from 'moment';

import EventContext from '../../../../context/EventContext';

const { RangePicker } = DatePicker;

class EditSession extends React.Component {
  state = {
    editing: false
  }

  deleteSession = async sessionId => {
    const { id, token } = this.context;

    const res = await fetch('http://localhost:8000/remove_event_sessions', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: id,
        session_id: sessionId,
        token
      })
    })

    if (res.status === 200) {
      message.success('You have successfully deleted a session!');
      this.props.refresh();
    } else {
      message.error('The system has encountered an error. Contact your admin!');
    }
  }

  toggleSession = () => this.setState({editing: !this.state.editing});

  render() {
    const { editing } = this.state;
    const { id, start_timestamp, end_timestamp } = this.props;

    return (
      <List.Item style={{display: 'flex'}}>
        <div style={{flexGrow: 1}}>
          <RangePicker
            defaultValue={[
              moment(start_timestamp),
              moment(end_timestamp)
            ]}
            placeholder={['Start Time', 'End Time']}
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm' }}
            style={{width: '100%'}}
            disabled={!editing}
          />
        </div>
        <div style={{paddingLeft: '0.5em', textAlign: 'right'}}>
          {editing ?
            <Button
              type="danger"
              icon="stop"
              style={{
                marginRight: '0.5em'
              }}
              onClick={this.toggleSession}
            /> :
            <Button
              type="danger"
              icon="delete"
              style={{
                marginRight: '0.5em'
              }}
              onClick={() => this.deleteSession(id)}
            />
          }
          {editing ?
            <Button
              icon="check"
              style={{
                background: '#48BB78',
                border: 'none',
                color: 'white',
              }}
            /> :
            <Button
              icon="edit"
              style={{
                background: '#38B2AC',
                border: 'none',
                color: 'white',
              }}
              onClick={this.toggleSession}
            />
          }
        </div>
      </List.Item>
    );
  }
}

EditSession.contextType = EventContext;

export default EditSession;
