import { Layout, Menu, Icon } from 'antd';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// Import our components to show via the routing
import AccountDetail from '../AccountDetail';

const { Header, Content, Footer, Sider } = Layout;

class RouterComponent extends React.PureComponent {
  render() {
    return (
      <Router>
        <Layout>
          <Sider breakpoint="lg" collapsedWidth="0" >
            <div className="logo" />
            <Menu theme="dark" mode="inline">
              <Menu.Item key="1">
                <Link to="/">
                  <Icon type="home" />
                  <span className="nav-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/account">
                  <Icon type="user" />
                  <span className="nav-text">Account Detail</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Content>
              <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <Switch>
                  <Route path='/'>
                    <AccountDetail />
                  </Route>
                  <Route path='/account'>
                    <AccountDetail />
                  </Route>
                </Switch>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}

export default RouterComponent;
