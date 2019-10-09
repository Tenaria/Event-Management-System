import React from 'react';

interface Props {
  name: string,
  email: string
}

interface State {
  name: string
}

class Card extends React.Component<Props, State> {
  state: State = {
    name: this.props.name
  }

  changeName = () => {
    this.setState({
      name: 'Mark'
    });
  }

  render() {
    const { email } = this.props;
    const { name } = this.state;
    return (
      <div>
        My name is, {name}, email is {email}
        <button onClick={this.changeName}>Hi</button>
      </div>
    );
  }
}

export default Card;
