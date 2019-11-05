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
