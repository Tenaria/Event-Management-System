import { Menu, Icon } from 'antd';
import React from 'react';

const { SubMenu } = Menu;

class TimetableManager extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Menu defaultSelectedKeys={['your']} mode="horizontal">
          <Menu.Item key="your">
            <Icon type="user" />
            Your Timetable
          </Menu.Item>
          <Menu.Item key="other">
            <Icon type="usergroup-add" />
            Other's Timetable
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default TimetableManager;
