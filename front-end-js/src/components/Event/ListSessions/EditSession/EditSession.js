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
    cancelled: this.props.cancelled,
    editing: false,
    startDateTime: this.props.start_timestamp,
    endDateTime: this.props.end_timestamp
  }

  cancelSession = async () => {
    const { id, token } = this.context;
    const sessionId = this.props.id;

    const res = await fetch('http://localhost:8000/cancel_event_sessions', {
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
      message.success('You have successfully cancelled a session!');
      this.props.refresh();
    } else {
      message.error('The system has encountered an error. Contact your admin!');
    }
  }

  uncancelSession = async () => {
    // TODO: Uncancel session
  }

  deleteSession = async () => {
    const { id, token } = this.context;
    const sessionId = this.props.id;

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
  
  editSession = async () => {
    const { id, token } = this.context;
    const sessionId = this.props.id;
    const { startDateTime, endDateTime } = this.state;

    console.log('START: ', startDateTime, ' END: ', endDateTime);
    
    this.setState({editing: false});

    const res = await fetch('http://localhost:8000/edit_event_sessions', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: id,
        session_id: sessionId,
        start_timestamp: startDateTime,
        end_timestamp: endDateTime,
        token
      })
    })

    if (res.status === 200) {
      message.success('You have successfully edited a session!');
      this.props.refresh();
    } else {
      message.error('The system has encountered an error. Contact your admin!');
    }
  }

  onOk = value => {
    this.setState({
      startDateTime: value[0].valueOf(),
      endDateTime: value[1].valueOf()
    })
  }

  toggleSession = () => this.setState({editing: !this.state.editing});

  render() {
    const { cancelled, editing, startDateTime, endDateTime } = this.state;

    return (
      <List.Item className={cancelled ? 'cancelled-session' : ''} style={{display: 'flex'}}>
        <div style={{flexGrow: 1}}>
          <RangePicker
            defaultValue={[
              moment(startDateTime),
              moment(endDateTime)
            ]}
            placeholder={['Start Time', 'End Time']}
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm' }}
            style={{width: '100%'}}
            onOk={this.onOk}
            disabled={!editing}
          />
        </div>
        <div style={{paddingLeft: '0.5em', textAlign: 'right'}}>
          {editing ?
            <React.Fragment>
              <Button
                type="danger"
                icon="cross"
                style={{
                  marginRight: '0.5em'
                }}
                onClick={this.toggleSession}
              />
              <Button
                icon="check"
                style={{
                  background: '#48BB78',
                  border: 'none',
                  color: 'white',
                }}
                onClick={this.editSession}
              />
            </React.Fragment> :
            <React.Fragment>
              <Button
                type="danger"
                icon="delete"
                style={{
                  marginRight: '0.5em'
                }}
                onClick={this.deleteSession}
              />
              <Button
                type="danger"
                icon="stop"
                style={{
                  marginRight: '0.5em'
                }}
                onClick={this.cancelSession}
                disabled={cancelled}
              />
              {cancelled ?
                <React.Fragment>
                  <Button
                    icon="undo"
                    style={{
                      background: '#38B2AC',
                      border: 'none',
                      color: 'white',
                    }}
                    onClick={this.uncancelSession}
                  />
                </React.Fragment> :
                <React.Fragment>
                  <Button
                    icon="edit"
                    style={{
                      background: '#38B2AC',
                      border: 'none',
                      color: 'white',
                    }}
                    onClick={this.toggleSession}
                  />
                </React.Fragment>
              }
            </React.Fragment>
          }
        </div>
      </List.Item>
    );
  }
}

EditSession.contextType = EventContext;

export default EditSession;
