import { Icon, message, Row, Spin } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from "react-router-dom";

import './index.scss';

// Import your custom components
import AccountDetailsForm from './components/RegisterForm';
import LoginForm from './components/LoginPage';
import RouterComponent from './components/Router';

// Import contexts
import TokenContext from './context/TokenContext';

class VerifyAccountParams extends React.Component {
  state = { verified: false }

  componentDidMount = async () => {
    const token = this.props.match.params.token;
    const user_id = this.props.match.params.user_id;

    console.log(this.props.match);
    console.log(this.props.match.user_id);

    const res = await fetch('http://localhost:8000/verify_acc', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verification_token: token,
        user_id: user_id,
      })
    });

    if (res.status === 200) {
      this.setState({verified: true});
      message.success('Successfully verified!');
    } else {
      message.error('Unable to verify your account. Please check your email for the verification link!');
    }
  }

  render() {
    const { verified } = this.state;
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    let verifyObj = null;

    if (verified) {
      verifyObj = <Redirect to='/'/>
    }

    return (
      <div className="form-wrapper">
        {verifyObj}
        <div 
          style={{
            backgroundColor: 'white',
            margin: 'auto',
            maxWidth: '720px',
            height: '100vh',
            padding: '5em 2em'
          }}
        >
          <Row type="flex" justify="center" style={{fontSize: 48}}>
            <Spin indicator={antIcon} />
          </Row>
          <Row>
            <p style={{fontSize: '24px', margin: '1em 0em', textAlign: 'center'}}>
              We are currently activating your account! Please do not leave this page.
            </p>
          </Row>
        </div>
      </div>
    );
  }
}

class Index extends React.Component {
  state = {
    token: null,
    userEmail: null,
    userId: null,
    register: false
  }

  componentDidMount = () => {
    const token = sessionStorage.getItem('token');
    let userEmail, userId;

    // Split the token and check the main body of the token to retrieve information relating to
    // the user's id and email.
    if (token) {
      const data = token.split('.');
      if (data.length > 1) {
        const jsonData = JSON.parse(atob(data[1]));
        userEmail = jsonData.email;
        userId = jsonData.user_id;
      }
    }

    // Change this to get the token from the session storage
    this.setState({token, userEmail, userId});
  }

  toggleRegister = () => this.setState({ register: !this.state.register });
  onLogin = (token) => {
    sessionStorage.setItem('token', token);
    this.setState({ token });
  }

  render() {
    const { token, userEmail, userId, register } = this.state;
    let displayElm = <LoginForm toggleRegister={this.toggleRegister} onLogin={this.onLogin} />;

    if (register) {
      displayElm = <AccountDetailsForm toggleRegister={this.toggleRegister} />;
    } else if (token) {
      displayElm = <RouterComponent />;
    }

    return (
      <React.Fragment>
        <TokenContext.Provider value={{
          token,
          userEmail,
          userId
        }}>
          <Router>
            <Switch>
              <Route path='/verify/:user_id/:token' component={VerifyAccountParams} />
              <Route path='/'>
                {displayElm}
              </Route>
            </Switch>
          </Router>
        </TokenContext.Provider>
      </React.Fragment>
    )
  }
};

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
