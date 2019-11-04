/*
  Edit the sessions of an event
 */
import { Button, DatePicker, List, message, Tooltip } from 'antd';
import React from 'react';
import moment from 'moment';

import TokenContext from '../../../context/TokenContext';

const { RangePicker } = DatePicker;

class BookSession extends React.Component {
  confirmSession = async () => {
    const { token } = this.context;
    const { id, event_id } = this.props;

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

    if (res.status === 200) {
      message.success('You have successfully confirmed that you are going to a session!');
    } else {
      const data = await res.json();
      message.success(data.error);
    }

    this.props.cb();
  }

  unconfirmSession = async () => {
    const { token } = this.context;
    const { id, event_id } = this.props;

    const res = await fetch('http://localhost:8000/unmark_as_going', {
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

    if (res.status === 200) {
      message.success('You have successfully confirmed that you are no longer going to a session!');
    } else {
      const data = await res.json();
      message.success(data.error);
    }

    this.props.cb();
  }

  render() {
    const { confirmed_going, start_timestamp, end_timestamp } = this.props;

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
              moment(start_timestamp),
              moment(end_timestamp)
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
          {confirmed_going ? 
            <Tooltip title="State that you are no longer going to go for this session!">
              <Button
                icon="close"
                type="danger"
                onClick={this.unconfirmSession}
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
