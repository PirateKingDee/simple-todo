import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Tasks } from '../api/tasks.js';
import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import { Meteor } from 'meteor/meteor';

class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      hideCompleted: false
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    //Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    // Tasks.insert({
    //   text,
    //   createdAt: new Date(),
    //   owner: Meteor.userId(),
    //   username: Meteor.user().username,
    // });

    Meteor.call('tasks.insert', text)
    //clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';

  }

  toggleHideCompleted(){
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if(this.state.hideCompleted){
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }
  render(){
      return (
        <div className="container">
          <header>
            <h1>Todo List({this.props.incompleteCount})</h1>
            <label class="hide-completed">
              <input type="checkbox"
                    readonly
                    checked={this.state.hideCompleted}
                    onClick={this.toggleHideCompleted.bind(this)}/>
              Hide Completed Tasks
            </label>

            <AccountsUIWrapper/>
            { this.props.currentUser ?
              <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Type to add new tasks"
                />
              </form> : ''
            }
            {/* <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
              <input type="text" ref="textInput" placeholder="Type to add new tasks"/>
            </form> */}
          </header>

          <ul>
            {this.renderTasks()}
          </ul>
        </div>
      );
    }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(()=> {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, {sort: {createdAt:-1}}).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true}}).count(),
    currentUser: Meteor.user(),
  };
}, App);

// App component - represents the whole App
// export default class App extends Component {
//   getTasks(){
//     return[
//       {_id: 1, text: 'This is task 1'},
//       {_id: 2, text: 'This is task 2'},
//       {_id: 3, text: 'This is task 3'},
//     ];
//   }
//
//   renderTasks(){
//     return this.getTasks().map((task) => (
//       <Task key={task._id} task={task}  />
//     ));
//
//   }
//
//   render(){
//     return (
//       <div className="container">
//         <header>
//           <h1>Todo List</h1>
//         </header>
//
//         <ul>
//           {this.renderTasks()}
//         </ul>
//       </div>
//     );
//   }
// }
