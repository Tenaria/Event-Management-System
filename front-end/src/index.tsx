import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import './index.scss';

// Import your custom components
import AccountDetailsForm from './components/AccountDetailsForm';
import LoginForm from './components/LoginPage';

interface IndexState {}

class Index extends React.Component<{}, IndexState> {
  render() {
    return (
      <div id='hello'>
        <LoginForm />
      </div>
    )
  }
};

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
