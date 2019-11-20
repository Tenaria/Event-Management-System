import { Button, message, Row, Spin } from 'antd';
import React from 'react';

import moment from 'moment';

import TokenContext from '../../context/TokenContext';

const NUM_OF_HOURS = 24;
const NUM_OF_DAYS = 7;

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 7  // First week of year must contain 1 January (7 + 1 - 1)
}});

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
            onMouseDown={!title ? e => this.props.onMouseDown(e, i) : null}
            onMouseEnter={!title & mouseDown ? () => toggleCell(i) : null}
            onMouseUp={this.props.onMouseUp}
          >
          </div>
        );
        cells.push(cell);
      } else {
        const cell = (
          <div
            key={name + '-' + i}
            className={"timetable-cell " + (title ? 'label' : '')}
            onMouseDown={!title ? e => this.props.onMouseDown(e, i) : null}
            onMouseEnter={!title & mouseDown ? () => toggleCell(i) : null}
            onMouseUp={this.props.onMouseUp}
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
      'monday' : [],
      'tuesday' : [],
      'wednesday' : [],
      'thursday' : [],
      'friday' : [],
      'saturday' : [],
      'sunday' : []
    },
    loading: true,
    mouseDown: false,
    relativeWeek: 0
  }

  componentDidMount = () => {
    this.changeWeek(0);
    window.addEventListener('mouseup', this.mouseUp, false);
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

  mouseDown = (e, day, id) => {
    e.preventDefault();
    const { ttData } = this.state;
    const indexOfData = ttData[day].indexOf(id);
    if (indexOfData > -1) {
      ttData[day].splice(indexOfData, 1);
    } else {
      ttData[day].push(id);
    }
    this.setState({mouseDown: true, ttData});
  }
  mouseUp = () => this.setState({mouseDown: false});

  changeWeek = async (change) => {
    const { token } = this.context;
    const { relativeWeek } = this.state;

    this.setState({loading: true});

    const res = await fetch('http://localhost:8000/get_ah_timetable', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        week: moment().week().valueOf() + this.state.relativeWeek + change
      })
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log(data);
      this.setState({
        ttData: (data[0] ? JSON.parse(data[0].week_data) : {
          'monday' : [],
          'tuesday' : [],
          'wednesday' : [],
          'thursday' : [],
          'friday' : [],
          'saturday' : [],
          'sunday' : []
        }),
        relativeWeek: this.state.relativeWeek + change,
        loading: false
      });
    } else {
      message.error(data.error);
    }
  }

  setWeek = async () => {
    const { token } = this.context;
    const { relativeWeek, ttData } = this.state;

    const res = await fetch('http://localhost:8000/set_ah_timetable', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        data: ttData,
        week: moment().week().valueOf() + relativeWeek
      })
    });

    const data = await res.json();
    if (res.status === 200) {
      message.success('Successfully updated timetable!');
    } else {
      message.error(data.error);
    }
  }

  advanceWeek = () => this.changeWeek(7);
  retreatWeek = () => this.changeWeek(-7);
  resetWeek = () => {
    this.setState({
      ttData : {
        'monday' : [],
        'tuesday' : [],
        'wednesday' : [],
        'thursday' : [],
        'friday' : [],
        'saturday' : [],
        'sunday' : []
      }
    });
  }

  render() {
    const { ttData, loading, mouseDown, relativeWeek } = this.state;
    const ttCols = [
      <Column key='time' title={true} name={'Time'} />,
      <Column key='monday' name={'Mon'} selected={ttData.monday}
        toggleCell={id => this.toggleCell('monday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'monday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />,
      <Column key='tuesday' name={'Tue'} selected={ttData.tuesday}
        toggleCell={id => this.toggleCell('tuesday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'tuesday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />,
      <Column key='wednesday' name={'Wed'} selected={ttData.wednesday}
        toggleCell={id => this.toggleCell('wednesday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'wednesday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />,
      <Column key='thursday' name={'Thu'} selected={ttData.thursday}
        toggleCell={id => this.toggleCell('thursday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'thursday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />,
      <Column key='friday' name={'Fri'} selected={ttData.friday}
        toggleCell={id => this.toggleCell('friday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'friday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />,
      <Column key='saturday' name={'Sat'} selected={ttData.saturday}
        toggleCell={id => this.toggleCell('saturday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'saturday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />,
      <Column key='sunday' name={'Sun'} selected={ttData.sunday}
        toggleCell={id => this.toggleCell('sunday', id)}
        onMouseDown={(e, id) => this.mouseDown(e, 'sunday', id)}
        onMouseUp={this.mouseUp}
        mouseDown={mouseDown}
      />
    ];

    const startDate = moment().weekday(relativeWeek);
    const endDate = moment().weekday(relativeWeek + 6);
    return (
      <React.Fragment>
        <Row
          type="flex"
          align="middle"
          justify="center"
          style={{margin: '0em 0em 1em 0em', position: 'relative'}}
        >
          <Button
            icon="left"
            shape="circle"
            type="primary"
            onClick={this.retreatWeek}
            disabled={loading}
          />
          <div className="timetable-dates" style={{margin: '0em 1em'}}>
            {startDate.format('DD/MM/YYYY')} - {endDate.format('DD/MM/YYYY')}
          </div>
          <Button
            icon="right"
            shape="circle"
            type="primary"
            onClick={this.advanceWeek}
            disabled={loading}
          />
        </Row>
        <Row
          type="flex"
          align="middle"
          justify="center"
          style={{margin: '0em 0em 1em 0em'}}
        >
          <Button.Group>
            <Button
              type="primary"
              onClick={this.setWeek}
            >Update Timetable</Button>
            <Button
              type="danger"
              onClick={this.resetWeek}
            >Reset Timetable</Button>
          </Button.Group>
        </Row>
        <div className="timetable">
          {ttCols}
          {loading ?
            <div className="timetable-loader">
              <Spin tip="Loading..." />
            </div> :
            null
          }
        </div>
      </React.Fragment>
    );
  }
}

Timetable.contextType = TokenContext;

export default Timetable;
