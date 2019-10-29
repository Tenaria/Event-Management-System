/*
  Edit the sessions of an event
 */
import { Button, DatePicker, Icon, List, message, Spin, Tooltip } from 'antd';
import React from 'react';
import moment from 'moment';
import AddSession from './AddSession';

import EventContext from '../../../context/EventContext';

const { RangePicker } = DatePicker;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EditSessions extends React.Component {
  state = {
    adding: false,
    data: [],
    loaded: false
  };

  componentDidMount = () => {
    this.loadSessions();
  }

  loadSessions = async () => {
    const { id, token } = this.context;

    const res = await fetch('http://localhost:8000/load_event_sessions', {
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
    })

    const data = await res.json();
    this.setState({data: data.sessions, loaded: true});
  }

  deleteSession = async sessionId => {
    const { id, token } = this.context;

    console.log('sessionid: ', sessionId, ' event_id: ', id)

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
      this.loadSessions();
    } else {
      message.error('The system has encountered an error. Contact your admin!');
    }
  }

  showAddModal = () => this.setState({adding: true});
  hideAddModal = () => {
    this.loadSessions();
    this.setState({adding: false});
  }

  render() {
    const { adding, data, loaded } = this.state;
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    const loader = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    return (
      <React.Fragment>
        <div className="custom-sessions" style={{position: 'relative'}}>
          <List
            bordered
            dataSource={data}
            header="Sessions"
            renderItem = {item => (
              <List.Item style={{display: 'flex'}}>
                <div style={{flexGrow: 1}}>
                  <RangePicker
                    defaultValue={[
                      moment(item.start_timestamp),
                      moment(item.end_timestamp)
                    ]}
                    placeholder={['Start Time', 'End Time']}
                    format="YYYY-MM-DD HH:mm"
                    showTime={{ format: 'HH:mm' }}
                    style={{width: '100%'}}
                    disabled
                  />
                </div>
                <div style={{paddingLeft: '0.5em', textAlign: 'right'}}>
                  <Button
                    type="danger"
                    icon="delete"
                    style={{
                      marginRight: '0.5em'
                    }}
                    onClick={() => this.deleteSession(item.id)}
                  />
                  <Button
                    icon="edit"
                    style={{
                      background: '#38B2AC',
                      border: 'none',
                      color: 'white',
                    }}
                  />
                </div>
              </List.Item>
            )}
            style={{paddingBottom: '3.5em'}}
          >
            {loaded ? null : loader}
          </List>
          <Button
            type="primary"
            shape="circle"
            icon="plus"
            size="large"
            style={{
              position: 'absolute',
              bottom: '0.5em',
              right: '0.5em'
            }}
            onClick={this.showAddModal}
          >
          </Button>
        </div>
        <AddSession
          onCancel={this.hideAddModal}
          visible={adding}
        />
      </React.Fragment>
    );
  }
}

EditSessions.contextType = EventContext;

export default EditSessions;
