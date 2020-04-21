import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './Login';
import Users from './Users';
import { connect } from 'react-redux';
import { loginWithToken, logout } from './store';

class App extends Component{
  componentDidMount(){
    window.addEventListener('hashchange', ()=> {
      const hash = window.location.hash.slice(1);
    });
    const token = window.location.hash.slice(1);
    this.props.loginWithToken(token);

  }
  render(){
    const { auth, logout } = this.props;
    return (
      <Router>
      {
        !auth.id && <Login />
      }
      {
        auth.id && <button onClick={ logout }>Welcome { auth.username } (Click to Logout)</button>
      }
      {
        auth.id && <Users /> 
      }
      </Router>
    );
  }
}

const mapStateToProps = ({ auth, users })=> {
  return {
    auth,
    users
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    loginWithToken: (token)=> dispatch(loginWithToken(token)),
    logout: ()=> dispatch(logout())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
