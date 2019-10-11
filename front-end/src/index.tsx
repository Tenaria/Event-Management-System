import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

// Import your custom components
import Card from './components/cardexample';
import AccountDetailsForm from './components/accountdetailsform';

interface IndexState {
  title: string,
  body: string
}

class Index extends React.Component<{}, IndexState> {
  state = {
    title: '',
    body: ''
  }

  componentDidMount = async () => {
    // Very basic fetch request. We are getting the title and body from the backend.
    const res = await fetch('http://localhost:8000/', {});
    if (res.status === 400) {
      this.setState({title: "400", body: "Rejected!"});
    } else {
      const data = await res.json();
      this.setState({title: data.title, body: data.body});
    }
  }

  testInput = async () => {
    const res = await fetch('http://localhost:8000/test', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({'name': 'yo'})
    });
  }

  render() {
    const { title, body } = this.state;

    return (
      <div id='hello'>
        <AccountDetailsForm/>
        <div>{ title }</div>
        <div>{ body }</div>
        <button onClick={this.testInput}>Hello</button>
        <Card name={'Bob'} email={'test@test'}/>
        <Card name={'Alice'} email={'test@test'}/>
        <Card name={'Smith'} email={'test@test'}/>
      </div>
    )
  }
};

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
