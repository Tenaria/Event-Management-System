import { message, Row, Typography, Button } from 'antd';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Sector
} from 'recharts';

import TokenContext from '../../context/TokenContext';

const { Title } = Typography;

const colourCombo = [
  '#F56565',
  '#ED8936',
  '#ECC94B',
  '#48BB78',
  '#38B2AC',
  '#4299E1',
  '#667EEA',
  '#9F7AEA',
  '#ED64A6'
];
                   
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    payload, percent, value } = props;
  const fill = payload.colour;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

class Dashboard extends React.Component {
  state = {
    activeIndex: 0,
    tagIndex: 0,
    data: null,
    loaded: false
  }

  componentDidMount = async () => {
    const { token } = this.context;
    
    const res = await fetch('http://localhost:8000/get_summary_dashboard', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log(data);
      this.setState({data: data, loaded: true});
    } else {
      message.error(data.error);
    }
  }

  changeTagIndex = id => this.setState({tagIndex: id});

  selectEvent = id => {
    sessionStorage.setItem('event_id', id);
    this.setState({ viewedEvent: true });
  }

  onPieEnter = (data, index) => this.setState({activeIndex: index});

  render() {
    const { tagIndex, data, loaded } = this.state;
    const spinStyle = {
      padding: '2em',
      textAlign: 'center'
    };
    let parsedAttendees = [];
    let parsedTags = [];

    if (loaded) {
      parsedAttendees = [{
        name: 'Attendence',
        'Last Week': data.last_week_attended_count,
        'This Week': data.next_week_attend_count 
      }];

      let tagData = {};
      switch(tagIndex) {
        case 0:
          tagData = data.tags_last_week;
          break;
        case 1:
          tagData = data.tags_this_week;
          break;
        case 2:
          tagData = data.tags_next_week;
          break;
        case 3:
          tagData = data.tags_distribution;
          break;
      }

      let i = 0;
      for (let k in tagData) {
        parsedTags.push({
          name: k,
          value: parseInt(data.tags_last_week[k]),
          colour: colourCombo[i % colourCombo.length]
        });
        i++;
      }
    }

    return (
      <Row type="flex" justify="space-around">
        <div style={{textAlign: 'center', marginBottom: '1em', width: 300}}>
          <Title level={4}>Attendance For Events You Organised</Title>
          <BarChart
            width={300}
            height={300}
            data={parsedAttendees}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Last Week" fill="#8884d8" />
            <Bar dataKey="This Week" fill="#82ca9d" />
          </BarChart>
        </div>
        <div style={{textAlign: 'center', width: 375}}>
          <Title level={4}>Tag Information For Events You Organised</Title>
          <Row>
            <Button.Group>
              <Button
                type={tagIndex === 0 ? 'primary' : ''}
                onClick={() => this.changeTagIndex(0)}
              >Last Week</Button>
              <Button
                type={tagIndex === 1 ? 'primary' : ''}
                onClick={() => this.changeTagIndex(1)}
              >This Week</Button>
              <Button
                type={tagIndex === 2 ? 'primary' : ''}
                onClick={() => this.changeTagIndex(2)}
              >Next Week</Button>
              <Button
                type={tagIndex === 3 ? 'primary' : ''}
                onClick={() => this.changeTagIndex(3)}
              >Overview</Button>
            </Button.Group>
          </Row>
          <PieChart width={375} height={300}>
            <Pie 
              activeIndex={this.state.activeIndex}
              activeShape={renderActiveShape} 
              data={parsedTags} 
              cx={180} 
              cy={125} 
              innerRadius={60}
              outerRadius={80} 
              fill="#8884d8"
              onMouseEnter={this.onPieEnter}
            />
          </PieChart>
        </div>
      </Row>
    );
  }
}

Dashboard.contextType = TokenContext;

export default Dashboard;
