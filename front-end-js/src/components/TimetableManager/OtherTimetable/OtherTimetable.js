import { Button, message, Row, Select, Spin } from 'antd';
import React from 'react';
import moment from 'moment';

import TokenContext from '../../../context/TokenContext';

const { Option } = Select;
const NUM_OF_HOURS = 24;

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 7  // First week of year must contain 1 January (7 + 1 - 1)
}});

class Column extends React.Component {
  render() {
    const { name, title, selected } = this.props;
    const cells = [
      <div key={'title'} className="timetable-cell title">{name}</div>
    ];

    for (let i = 0; i < NUM_OF_HOURS; ++i) {
      if (!title && selected.includes(i)) {
        const cell = (
          <div key={name + '-' + i} className="timetable-cell selected">
          </div>
        );
        cells.push(cell);
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
    relativeWeek: 0,
    users: [],
    selectedUser: null
  }

  componentDidMount = () => this.changeWeek(0);

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
        week: moment().week().valueOf() + relativeWeek + change
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

  handleSearch = value => {
    /*
      Once an user has entered more than 2 characters in the search bar, we will perform an ajax
      request for a list of users that has an email that contains the character specified.
    */
    const { token } = this.context;

    if (value.length <= 2) return;

    fetch('http://localhost:8000/get_emails_exclude_user', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search_term: value,
        token
      })
    }).then(async res => {
      const data = await res.json();
      this.setState({users: data.results});
    });
  }
  handleChange = value => {
    this.setState({ selectedUser: value });
  }

  onSelect = (value, elm) => {
    console.log(value, elm);
  }

  advanceWeek = () => this.changeWeek(1);
  retreatWeek = () => this.changeWeek(-1);

  render() {
    const { users, ttData, loading, relativeWeek, selectedUser } = this.state;
    const ttCols = [
      <Column key='time' title={true} name={'Time'} />,
      <Column key='monday' name={'Mon'} selected={ttData.monday} />,
      <Column key='tuesday' name={'Tue'} selected={ttData.tuesday} />,
      <Column key='wednesday' name={'Wed'} selected={ttData.wednesday} />,
      <Column key='thursday' name={'Thu'} selected={ttData.thursday} />,
      <Column key='friday' name={'Fri'} selected={ttData.friday} />,
      <Column key='saturday' name={'Sat'} selected={ttData.saturday} />,
      <Column key='sunday' name={'Sun'} selected={ttData.sunday} />
    ];
    const startDate = moment().weekday(0).add(relativeWeek, 'w');
    const endDate = moment().weekday(6).add(relativeWeek, 'w');
    const options = users.map(d => <Option key={d.id}>{d.email}</Option>);
  
    return (
      <React.Fragment>
        <Row style={{marginBottom: '1em'}}>
          <Select
            showSearch
            value={selectedUser}
            placeholder="Name of person you want to view"
            style={{ width: '100%' }}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={this.handleSearch}
            onChange={this.handleChange}
            onSelect={this.onSelect}
            notFoundContent={null}
          >
            {options}
          </Select>
        </Row>
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