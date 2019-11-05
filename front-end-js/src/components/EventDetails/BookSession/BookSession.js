/*
  Edit the sessions of an event
 */
import { Avatar, Button, DatePicker, List, message, Col, Row, Tooltip, Typography } from 'antd';
import React from 'react';
import moment from 'moment';

import TokenContext from '../../../context/TokenContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

class BookSession extends React.Component {
  state = {
    showAttendees: false
  }

  confirmSession = async () => {
    const { token } = this.context;
    const { id, event_id } = this.props;

    const res = await fetch('http://localhost:8000/mark_as_going', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
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
      message.error(data.error);
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
      headers: { 'Content-Type': 'application/json' },
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
      message.error(data.error);
    }

    this.props.cb();
  }

  toggleShowAttendees = () => this.setState({showAttendees: !this.state.showAttendees});

  render() {
    const { showAttendees } = this.state;
    const { attendees, confirmed_going, start_timestamp, end_timestamp } = this.props;

    const attendeeElm = attendees.map(a =>
      <Tooltip key={a.id} title={a.email}>
        <Avatar icon="user" style={{marginRight: '0.5em'}} />
      </Tooltip>
    );

    return (
      <List.Item style={{flexDirection: 'column'}}>
        <Row type="flex" style={{width: '100%'}}>
          <Col span={2}>
            <div style={{paddingRight: '0.5em'}}>
              <Button
                icon={showAttendees ? 'down' : 'right'}
                shape="circle"
                onClick={this.toggleShowAttendees}
              />
            </div>
          </Col>
          <Col span={20}>
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
          </Col>
          <Col span={2}>
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
          </Col>
        </Row>
        {showAttendees ?
          <Row style={{marginTop: '0.5em', width: '100%'}}>
            <Title level={4}>Session Attendees</Title>
            {attendeeElm}
          </Row> :
          null
        }
      </List.Item>
    );
  }
}

BookSession.contextType = TokenContext;

export default BookSession;
