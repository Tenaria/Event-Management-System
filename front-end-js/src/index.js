import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import './index.scss';

// Import your custom components
import AccountDetailsForm from './components/RegisterForm';
import LoginForm from './components/LoginPage';
import RouterComponent from './components/Router';

class Index extends React.Component {
  state = {
    token: null,
    register: false
  }

  componentDidMount = () => {
    const token = sessionStorage.getItem('token');

    // TODO: Validate token is still valid.

    // Change this to get the token from the session storage
    this.setState({ token: true });
  }

  toggleRegister = () => {
    this.setState({ register: !this.state.register });
  }

  render() {
    const { token, register } = this.state;
    let displayElm = <LoginForm toggleRegister={this.toggleRegister} />;

    if (register) {
      displayElm = <AccountDetailsForm toggleRegister={this.toggleRegister} />;
    } else if (token) {
      displayElm = <RouterComponent />;
    }

    return (
      <React.Fragment>
        {displayElm}
      </React.Fragment>
    )
  }
};

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
