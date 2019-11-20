/*
  Edit the sessions of an event
 */
import { Button, Icon, List, Spin } from 'antd';
import React from 'react';

import AddSession from './AddSession';
import EditSession from './EditSession';

import EventContext from '../../../context/EventContext';

const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class ListSessions extends React.Component {
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
    this.setState({data: []});
    this.setState({data: data.sessions, loaded: true});
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

    console.log(data);

    return (
      <React.Fragment>
        <div className="custom-sessions" style={{position: 'relative'}}>
          <List
            bordered
            dataSource={data}
            header="Sessions"
            renderItem = {item => (
              <EditSession
                id={item.id}
                cancelled={item.cancelled}
                start_timestamp={item.start_timestamp}
                end_timestamp={item.end_timestamp}
                refresh={this.loadSessions}
              />
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

ListSessions.contextType = EventContext;

export default ListSessions;
