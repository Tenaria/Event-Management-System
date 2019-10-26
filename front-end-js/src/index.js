import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import './index.scss';

// Import your custom components
import AccountDetailsForm from './components/RegisterForm';
import LoginForm from './components/LoginPage';
import RouterComponent from './components/Router';

// Import contexts
import TokenContext from './context/TokenContext';

class Index extends React.Component {
  state = {
    token: null,
    register: false
  }

  componentDidMount = () => {
    const token = sessionStorage.getItem('token');

    // TODO: Validate token is still valid.

    // Change this to get the token from the session storage
    this.setState({ token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE1NzQ2NTM2MjAsImVtYWlsIjoibG9sQGxvbC5jb20iLCJuYW1lIjoidGVzdCBsb2wifQ.Ut64rR54lWcz27EI2vXg8w_N5fVsfZPxU2toax1PyDc' });
  }

  toggleRegister = () => this.setState({ register: !this.state.register });
  onLogin = (token) => {
    console.log(token);
    this.setState({ token });
  }

  render() {
    const { token, register } = this.state;
    let displayElm = <LoginForm toggleRegister={this.toggleRegister} onLogin={this.onLogin} />;

    if (register) {
      displayElm = <AccountDetailsForm toggleRegister={this.toggleRegister} />;
    } else if (token) {
      displayElm = <RouterComponent />;
    }

    return (
      <React.Fragment>
        <TokenContext.Provider value={this.state.token}>
          {displayElm}
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
