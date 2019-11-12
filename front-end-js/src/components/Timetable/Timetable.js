import { Modal } from 'antd';
import React from 'react';

import TokenContext from '../../context/TokenContext';

const NUM_OF_HOURS = 24;
const NUM_OF_DAYS = 7;

class Column extends React.Component {
  render() {
    const { title, name, selected, mouseDown, toggleCell } = this.props;
    const cells = [
      <div key={'title'} className="timetable-cell title">{name}</div>
    ];

    for (let i = 0; i < NUM_OF_HOURS; ++i) {
      if (!title && selected.includes(i)) {
        const cell = (
          <div
            key={name + '-' + i}
            className="timetable-cell selected"
            onClick={!title ? () => toggleCell(i) : null}
            onMouseEnter={!title & mouseDown ? () => toggleCell(i) : null}
          >
          </div>
        );
        cells.push(cell);
      } else {
        const cell = (
          <div
            key={name + '-' + i}
            className={"timetable-cell " + (title ? 'label' : '')}
            onClick={!title ? () => toggleCell(i) : null}
            onMouseEnter={!title & mouseDown ? () => toggleCell(i) : null}
          >
            {title ? i+':00' : ''}
          </div>
        );
        cells.push(cell);
      }
    }

    return (
      <div className="timetable-column">{cells}</div>
    );
  }
}

class Timetable extends React.Component {
  state = {
    addModal: false,
    ttData: {
      'monday' : [0, 1, 2, 3, 4],
      'tuesday' : [],
      'wednesday' : [],
      'thursday' : [],
      'friday' : [],
      'saturday' : [],
      'sunday' : []
    },
    mouseDown: false
  }

  toggleCell = (day, id) => {
    const { ttData } = this.state;
    const indexOfData = ttData[day].indexOf(id);
    if (indexOfData > -1) {
      ttData[day].splice(indexOfData, 1);
    } else {
      ttData[day].push(id);
    }

    this.setState({ttData});
  }

  mouseDown = e => {
    e.preventDefault();
    this.setState({mouseDown: true})
  }
  mouseUp = () => this.setState({mouseDown: false})

  render() {
    const { ttData, mouseDown } = this.state;
    const ttCols = [
      <Column key='time' title={true} name={'Time'} />,
      <Column key='monday' name={'Monday'} selected={ttData.monday}
        toggleCell={id => this.toggleCell('monday', id)}
        mouseDown={mouseDown}
      />,
      <Column key='tuesday' name={'Tuesday'} selected={ttData.tuesday}
        toggleCell={id => this.toggleCell('tuesday', id)}
        mouseDown={mouseDown}
      />,
      <Column key='wednesday' name={'Wednesday'} selected={ttData.wednesday}
        toggleCell={id => this.toggleCell('wednesday', id)}
        mouseDown={mouseDown}
      />,
      <Column key='thursday' name={'Thursday'} selected={ttData.thursday}
        toggleCell={id => this.toggleCell('thursday', id)}
        mouseDown={mouseDown}
      />,
      <Column key='friday' name={'Friday'} selected={ttData.friday}
        toggleCell={id => this.toggleCell('friday', id)}
        mouseDown={mouseDown}
      />,
      <Column key='saturday' name={'Saturday'} selected={ttData.saturday}
        toggleCell={id => this.toggleCell('saturday', id)}
        mouseDown={mouseDown}
      />,
      <Column key='sunday' name={'Sunday'} selected={ttData.sunday}
        toggleCell={id => this.toggleCell('sunday', id)}
        mouseDown={mouseDown}
      />
    ]
    return (
      <React.Fragment>
        <div
          className="timetable"
          onMouseDown={this.mouseDown}
          onMouseUp={this.mouseUp}
        >{ttCols}</div>
      </React.Fragment>
    );
  }
}

Timetable.contextType = TokenContext;

export default Timetable;
