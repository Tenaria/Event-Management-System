import { Menu, Icon, Typography } from 'antd';
import React from 'react';

import Timetable from './Timetable';
import TimetableSettings from './TimetableSettings';
import OtherTimetable from './OtherTimetable';

const { Title } = Typography;

class TimetableManager extends React.PureComponent {
  state = { menu: 'your' };

  handleClick = e => this.setState({menu: e.key});

  render() {
    const { menu } = this.state;

    let displayElm = <Timetable />;
    if (menu === 'other') {
      displayElm = <OtherTimetable />;
    } else if (menu === 'settings') {
      displayElm = <TimetableSettings />;
    }

    return (
      <div>
        <div>
          <Title level={2}>Timetable Manager</Title>
          <p>Manage your timetable and view other people's public timetable.</p>
        </div>
        <Menu
          defaultSelectedKeys={[menu]}
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
          <Menu.Item key="settings">
            <Icon type="setting" />
            Timetable Settings
          </Menu.Item>
        </Menu>
        <div>{displayElm}</div>
      </div>
    );
  }
}

export default TimetableManager;
