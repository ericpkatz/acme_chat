import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from './store';

class Login extends Component{
  constructor(){
    super();
    this.state = {
      username: '',
      password: '',
      error: ''
    };
    this.login = this.login.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  login(ev){
    ev.preventDefault();
    const credentials = {...this.state };
    delete credentials.error;
    this.props.login(this.state)
      .catch( ex => {
        this.setState({ error: ex.response.data.message })
      })
  }
  onChange(ev){
    this.setState({ [ev.target.name]: ev.target.value });

  }
  render(){
    const { login, onChange } = this;
    const { username, password, error } = this.state;
    return (
      <form onSubmit={ login }>
        { error }
        <input name='username' onChange={ onChange } value={ username }/>
        <input name='password' onChange={ onChange } value={ password }/>
        <button>Login</button>
      </form>
    );
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    login: (credentials)=> dispatch(login(credentials)) 
  };
};

export default connect(null, mapDispatchToProps)(Login);
