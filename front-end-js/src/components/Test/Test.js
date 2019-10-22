import React from 'react';


class Test extends React.PureComponent {

  constructor(props) {
    super(props);

    this.testRef = React.createRef();
  }

  changeHello = () => {
    console.log(this.testRef);
    const test2 = this.testRef.current.querySelector('#test2');
    console.log(test2);
    console.log(test2.innerHTML);
  }

  render() {
    return (
      <div id="test" ref={this.testRef}>
        Hello
        <div id="test2">World</div>
        <button onClick={this.changeHello}>Yoo</button>
      </div>
    );
  }
}

export default Test;
