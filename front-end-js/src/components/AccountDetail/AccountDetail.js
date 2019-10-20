import { Avatar, Row, Typography  } from 'antd';
import React from 'react';

const { Title } = Typography;

class AccountDetail extends React.Component {
  render() {
    return (
      <Row type="flex">
        <Avatar size={64} icon="user" />
        <div style={{margin: "0.5em"}}></div>
        <Row type="flex" align="middle">
          <Title level={3} style={{margin: 0}}>My Wife</Title>
        </Row>
      </Row>
    );
  }
}

export default AccountDetail;
