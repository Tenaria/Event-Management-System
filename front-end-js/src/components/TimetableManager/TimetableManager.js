import { Menu, Icon, Typography } from 'antd';
import React from 'react';

import Timetable from './Timetable';
import OtherTimetable from './OtherTimetable';

const { Title } = Typography;

class TimetableManager extends React.PureComponent {
  state = { yourMenu: true };

  handleClick = e => this.setState({yourMenu: e.key === 'your'});

  render() {
    const { yourMenu } = this.state;

    return (
      <div>
        <div>
          <Title level={2}>Timetable Manager</Title>
          <p>Manage your timetable and view other people's public timetable.</p>
        </div>
        <Menu
          defaultSelectedKeys={['your']}
          onClick={this.handleClick}
          mode="horizontal"
          style={{marginBottom: '1em'}}
        >
          <Menu.Item key="your">
            <Icon type="user" />
            Your Timetable
          </Menu.Item>
          <Menu.Item key="other">
            <Icon type="usergroup-add" />
            Other's Timetable
          </Menu.Item>
        </Menu>
        <div>{yourMenu ? <Timetable /> : <OtherTimetable />}</div>
      </div>
    );
  }
}

export default TimetableManager;
