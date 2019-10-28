/*
  Edit the sessions of an event
 */
import { Button, DatePicker, Icon, List, message, Row, Select, Spin, Tooltip } from 'antd';
import React from 'react';
import WrappedAddSession from './AddSession';

import TokenContext from '../../../context/TokenContext';

const { RangePicker } = DatePicker;
const spinIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class EditSessions extends React.Component {
  state = {
    adding: false,
    loaded: true
  };

  showAddModal = () => this.setState({adding: true});
  hideAddModal = () => this.setState({adding: false});

  render() {
    const { adding, loaded } = this.state;
  
    const spinStyle = {
      padding: '2em',
      textAlign: 'center',
      width: '100%'
    };
    const loader = <div style={spinStyle}><Spin indicator={spinIcon}/></div>;

    return (
      <React.Fragment>
        <div class="custom-sessions" style={{position: 'relative'}}>
          <List
            bordered
            header="Sessions"
            renderItem = {item => (
              <List.Item>
              </List.Item>
            )}
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
        <WrappedAddSession
          onCancel={this.hideAddModal}
          visible={adding}
        />
      </React.Fragment>
    );
  }
}

EditSessions.contextType = TokenContext;

export default EditSessions;
