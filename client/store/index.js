import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';


const SET_AUTH = 'SET_AUTH';
const SET_USERS = 'SET_USERS';
const SET_MESSAGES = 'SET_MESSAGES';
const ADD_MESSAGE = 'ADD_MESSAGE';

const setAuth = (auth)=> {
  return {
    type: SET_AUTH,
    auth
  };
};

const setMessages = (messages)=> {
  return {
    type: SET_MESSAGES,
    messages
  };
};

const addMessage = (message)=> {
  return {
    type: ADD_MESSAGE,
    message
  };
};

const setUsers = (users)=> {
  return {
    type: SET_USERS,
    users
  };
};

const authReducer = (state = { }, action)=> {
  if(action.type === SET_AUTH){
    return action.auth;
  }
  return state;
};

const usersReducer = (state = [], action)=> {
  if(action.type === SET_USERS){
    return action.users;
  }
  return state;
};

const messagesReducer = (state = [], action)=> {
  if(action.type === SET_MESSAGES){
    return action.messages;
  }
  if(action.type === ADD_MESSAGE){
    return [...state, action.message];
  }
  return state;
};

const reducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  messages: messagesReducer
});

const getUsers = ()=> {
  const token = window.location.hash.slice(1);
  return (dispatch)=> {
    return axios.get('/api/users', { 
      headers: {
        authorization: token
      }
    })
    .then( response => {
      return dispatch(setUsers(response.data));
    })
  };
};

const getMessages = ()=> {
  const token = window.location.hash.slice(1);
  return (dispatch)=> {
    return axios.get('/api/messages', { 
      headers: {
        authorization: token
      }
    })
    .then( response => {
      return dispatch(setMessages(response.data));
    })
  };
};

const sendMessage = ({ toId, text})=> {
  const token = window.location.hash.slice(1);
  return (dispatch)=> {
    return axios.post(`/api/messages/${toId}`, {
      text
    }, { 
      headers: {
        authorization: token
      }
    })
    .then( response => {
      return dispatch(addMessage(response.data));
    })
  };
};

const login = (credentials)=> {
  return (dispatch)=> {
    return axios.post('/api/auth', credentials)
      .then( response => {
        window.location.hash = response.data.token;
        return dispatch(loginWithToken());
      })
  };
};

const loginWithToken = ()=> {
  const token = window.location.hash.slice(1);
  return (dispatch)=> {
    if(!token){
      return;
    }
    return axios.get('/api/auth', {
      headers: {
        authorization: token
      }
    })
    .then( response => {
      return dispatch(setAuth(response.data));
    })
    .then( ()=> {
      return Promise.all([
        dispatch(getUsers()),
        dispatch(getMessages())
      ]);
    })
    .catch(ex => {
      if(ex.response && ex.response.status === 401){
        window.location.hash = '';
      }
      else{
        throw ex;
      }
    })
  };
};

const logout = ()=> {
  window.location.hash = '';
  return setAuth({});
};


const store = createStore(reducer, applyMiddleware(thunk));

export default store;
export { login, logout, loginWithToken, sendMessage };
