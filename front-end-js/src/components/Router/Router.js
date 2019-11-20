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
import EventManager from '../EventManager';
import Dashboard from '../Dashboard';
import Event from '../Event';
import EventViewer from '../EventViewer';
import EventDetails from '../EventDetails';
import Test from '../Test';
import TimetableManager from '../TimetableManager';

const {  Content, Sider } = Layout;

class RouterComponent extends React.PureComponent {
  state = { activeMenu: '' };

  handleClick = e => {
    if (e.key === 'logout') {
      sessionStorage.removeItem('token');
      window.location.reload();
    }
  };

  render() {
    const { activeMenu } = this.state;
    return (
      <Router>
        <Layout>
          <Sider breakpoint="lg" collapsedWidth="0" style={{minHeight: '100vh'}}>
            <div className="logo">GoMeet</div>
            <Menu
              selectedKeys={[activeMenu]}
              theme="dark"
              mode="inline"
              onClick={this.handleClick}
            >
              <Menu.Item key="1">
                <Link to="/">
                  <Icon type="home" />
                  <span className="nav-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/events_viewer">
                  <Icon type="eye" />
                  <span className="nav-text">View Events</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/events_manager">
                  <Icon type="file-add" />
                  <span className="nav-text">Manage Your Events</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="timetable">
                <Link to="/timetable">
                  <Icon type="calendar" />
                  <span className="nav-text">Your Timetable</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/account">
                  <Icon type="user" />
                  <span className="nav-text">Account Detail</span>
                </Link>
              </Menu.Item>
              <Menu.Item
                key="logout"
                style={{
                  backgroundColor: '#E53E3E',
                  color: '#FFFFFF'
              }}>
                <Icon type="logout" />
                <span className="nav-text">Log Out</span>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Content>
              <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <Switch>
                  <Route path='/test'>
                    <Test />
                  </Route>
                  <Route path='/timetable' children={({match}) => {
                    if (match) this.setState({activeMenu: 'timetable'});
                    return <TimetableManager />;
                  }} />
                  <Route path='/event'>
                    <Event />
                  </Route>
                  <Route path='/event_details'>
                    <EventDetails />
                  </Route>
                  <Route path='/events_viewer' children={({match}) => {
                    if (match) this.setState({activeMenu: '2'});
                    return <EventViewer />;
                  }} />
                  <Route path='/events_manager' children={({match}) => {
                    if (match) this.setState({activeMenu: '3'});
                    return <EventManager />;
                  }} />
                  <Route path='/account' children={({match}) => {
                    if (match) this.setState({activeMenu: '4'});
                    return <AccountDetail />;
                  }} />
                  <Route path='/' children={({match}) => {
                    if (match) this.setState({activeMenu: '1'});
                    return <Dashboard />;
                  }} />
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
