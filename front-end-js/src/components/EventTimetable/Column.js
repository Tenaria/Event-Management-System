import React from 'react';

const NUM_OF_HOURS = 24;

class Column extends React.Component {
  render() {
    const { name, title, time, data } = this.props;
    const cells = [
      <div key={'title'} className="timetable-cell title">{name}</div>
    ];

    for (let i = 0; i < NUM_OF_HOURS; ++i) {
      let overlay = 0;
      for (let k in data) {
        console.log(name, i, data[k][time]);
        if (data[k][time].indexOf(i) >= 0) {
          overlay += 1;
        }
        console.log(overlay);
      }
      if (overlay > 1) {
        const cell = (
          <div key={name + '-' + i} className="timetable-cell selected-overlay">
          </div>
        );
        cells.push(cell);
        continue;
      }
      if (!title) {
        let triggered = false;
        for (let k in data) {
          if (data[k][time].indexOf(i) >= 0) {
            const cell = (
              <div key={name + '-' + i} className="timetable-cell" style={{backgroundColor: data[k].colour}}>
              </div>
            );
            cells.push(cell);
            triggered = true;
            break;
          }
        }
        if (!triggered) {
          const cell = (
            <div key={name + '-' + i} className="timetable-cell">
            </div>
          );
          cells.push(cell);
        }
        triggered = false;
      } else {
        const cell = (
          <div key={name + '-' + i} className={"timetable-cell " + (title ? 'label' : '')}>
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

export default Column;
