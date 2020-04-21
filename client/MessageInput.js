import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sendMessage } from './store';

class MessageInput extends Component{
  constructor(){
    super();
    this.state = {
      text: ''
    };
    this.sendMessage = this.sendMessage.bind(this);
  }
  sendMessage(ev){
    ev.preventDefault();
    this.props.sendMessage({ toId: this.props.user.id, text: this.state.text })
      .then( ()=> this.setState({ text: ''}));
  }
  render(){
    const { sendMessage } = this;
    const { text } = this.state;
    return (
      <form onSubmit={ sendMessage }>
        <input onChange={ ev => this.setState({ text: ev.target.value }) } value={ text } />
      </form>
    );
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    sendMessage: ({ toId, text})=> {
      return dispatch(sendMessage({ toId, text }));
    }
  };
};

export default connect(null, mapDispatchToProps)(MessageInput);
