import { createStore, applyMiddleware, combineReducers } from 'redux';

const SET_AUTH = 'SET_AUTH';

const setAuth = (auth)=> {
  return {
    type: SET_AUTH,
    auth
  };
};

const authReducer = (state = { }, action)=> {
  if(action.type === SET_AUTH){
    return action.auth;
  }
  return state;

};

const reducer = combineReducers({
  auth: authReducer
});


const store = createStore(reducer);

export default store;
