import {} from 'antd';
import React from 'react';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import TokenContext from '../../context/TokenContext';

class Timetable extends React.Component {
  state = {
    events: {
      'event-1' : {
        id: 'event-1',
        length: '2'
      }
    },
    days: {
      'monday' : {
        id: 'monday',
        title: 'Monday',
        'event-id': ['event-1']
      }
    }
  };

  onDragEnd = result => {
    // TODO: Reorder column
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="test">
          {(provided) => 
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <Draggable draggableId="test">
                {(provided) => 
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    Hello
                  </div>
                }
              </Draggable>
              <Draggable draggableId="test2">
                {(provided) => 
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    Hello2
                  </div>
                }
              </Draggable>
              <Draggable draggableId="test3">
                {(provided) => 
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    Hello3
                  </div>
                }
              </Draggable>
              {provided.placeholder}
            </div>
          }
        </Droppable>
      </DragDropContext>
    );
  }
}

Timetable.contextType = TokenContext;

export default Timetable;
