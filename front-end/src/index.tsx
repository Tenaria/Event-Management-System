import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

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
    const data = await res.json();

    this.setState({title: data.title, body: data.body});
  }

  render() {
    const { title, body } = this.state;

    return (
      <div>
        <div>{ title }</div>
        <div>{ body }</div>
      </div>
    )
  }
};

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
