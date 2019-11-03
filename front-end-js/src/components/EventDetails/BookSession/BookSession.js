/*
  Edit the sessions of an event
 */
import { Button, DatePicker, List, Tooltip } from 'antd';
import React from 'react';
import moment from 'moment';

import TokenContext from '../../../context/TokenContext';

const { RangePicker } = DatePicker;

class BookSession extends React.Component {
  
  constructor(props, context) {
    super(props);
    
    const { attendees } = this.props;
    const { userEmail } = context;
    let confirmedGoing = false;

    if (attendees) {
      for(const user of attendees) {
        console.log(`user.email: ${user.email}, userEmail: ${userEmail}`)
        if (user.email === userEmail) {
          confirmedGoing = true;
        }
      }
    }

    this.state = {
      startDateTime: this.props.start_timestamp,
      endDateTime: this.props.end_timestamp,
      confirmedGoing
    }
  }

  confirmSession = async () => {
    const { token } = this.context;
    const { id, event_id } = this.props;

    console.log(`Information passed token: ${token}, session_id: ${id}, event_id: ${event_id}`);

    const res = await fetch('http://localhost:8000/mark_as_going', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: event_id,
        session_id: id,
        token
      })
    });

    this.props.cb();
  }

  render() {
    const { confirmedGoing, startDateTime, endDateTime } = this.state;

    return (
      <List.Item style={{display: 'flex'}}>
        {/* <div style={{paddingRight: '0.5em'}}>
          <Button
            icon="down"
            shape="circle"
          />
        </div> */}
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
            disabled={true}
          />
        </div>
        <div style={{paddingLeft: '0.5em', textAlign: 'right'}}>
          {confirmedGoing ? 
            <Tooltip title="Confirm you are going for this session!">
              <Button
                icon="close"
                type="danger"
                onClick={this.confirmSession}
              />
            </Tooltip> :
            <Tooltip title="Confirm you are going for this session!">
              <Button
                icon="check"
                style={{
                  background: '#48BB78',
                  border: 'none',
                  color: 'white',
                }}
                onClick={this.confirmSession}
              />
            </Tooltip>
          }
        </div>
      </List.Item>
    );
  }
}

BookSession.contextType = TokenContext;

export default BookSession;
