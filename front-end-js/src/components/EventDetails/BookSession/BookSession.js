/*
  Edit the sessions of an event
 */
import { Button, DatePicker, List, Tooltip } from 'antd';
import React from 'react';
import moment from 'moment';

import EventContext from '../../../context/EventContext';

const { RangePicker } = DatePicker;

class BookSession extends React.Component {
  state = {
    startDateTime: this.props.start_timestamp,
    endDateTime: this.props.end_timestamp
  }

  render() {
    const { startDateTime, endDateTime } = this.state;

    return (
      <List.Item style={{display: 'flex'}}>
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
          <Tooltip title="Confirm you are going for this session!">
            <Button
              icon="check"
              style={{
                background: '#48BB78',
                border: 'none',
                color: 'white',
              }}
              onClick={this.toggleSession}
            />
          </Tooltip>
        </div>
      </List.Item>
    );
  }
}

BookSession.contextType = EventContext;

export default BookSession;
