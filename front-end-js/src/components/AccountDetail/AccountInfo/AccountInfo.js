import { Avatar, Button, Divider, Row, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

class AccountDetail extends React.Component {
  render() {
    const { fName, lName, email } = this.props;
    return (
      <div>
        <Row type="flex">
          <Avatar size={64} icon="user" />
          <div style={{margin: "0.5em"}}></div>
          <Row type="flex" justify="center" style={{flexDirection: "column"}}>
            <Title level={4} style={{margin: 0}}>{fName} {lName}</Title>
            <div>{email}</div>
          </Row>
        </Row>
        <Divider orientation="left">Details</Divider>
        <Row>
          Lorem ipsum dolor sit amet, veri movet id est, usu te temporibus instructior. Omnis regione epicurei et per, in qui errem tamquam fierent. Id quem fuisset ius. Assum erant definitionem ad eam, apeirian expetenda duo ex. Fugit omittantur conclusionemque sit no, qui te augue abhorreant. Agam legere vis ei.
        </Row>
        <Divider orientation="left">Account Actions</Divider>
        <Row>
          <Button type="primary" onClick={() => this.props.toggleEdit()} block>
            Edit
          </Button>
        </Row>
      </div>
    );
  }
}

export default AccountDetail;
