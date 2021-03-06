import React from 'react';
import { connect } from 'react-redux';
import MessageInput from './MessageInput';

const Chats = ({ users, messages, auth })=> {
  return (
    <ul className='chat-list'>
      {
        users.map( user => {
          const _messages = messages.filter( message => {
            return message.toId === user.id || message.fromId === user.id;
          })
          return (
            <li key={ user.id } className='chat'>
              Your conversation with { user.username }
              <MessageInput user={ user }/> 
              <ul>
              {
                _messages.map( message => {
                  console.l
                  return (
                    <li key={ message.id } style={{ fontWeight: message.fromId === auth.id ? 'inherit': 'bold'}}>
                      { message.text }
                    </li>
                  );
                })
              }
              </ul>
            </li>
          );
        })
      }
    </ul>
  );
};

const mapStateToProps = ({ users, messages, auth })=> {
  return {
    users,
    messages,
    auth
  };
};


export default connect(mapStateToProps)(Chats);
