const express = require('express');
const path = require('path');
const { User, Message } = require('./db').models;
const app = express();

app.use('/dist', express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

const isLoggedIn = (req, res, next)=> {
  if(req.user){
    return next();
  }
  const error = Error('not authorized');
  error.status = 401;
  next(error);
};

app.engine('html', require('ejs').renderFile);

app.use(express.json());

app.use((req, res, next)=> {
  if(!req.headers.authorization){
    return next();
  }
  User.findByToken(req.headers.authorization)
    .then( user => {
      req.user = user;
      next();
    })
    .catch(next);
});


module.exports = app;

app.get('/', (req, res, next)=> res.render('index.html'));

app.post('/api/register', (req, res, next)=> {
  User.register({ username, password })
    .then( token => res.send({ token })) 
    .catch(next);
});

app.post('/api/auth', (req, res, next)=> {
  return User.authenticate(req.body)
    .then( token => res.send({ token }))
    .catch(next);
});

app.get('/api/auth', isLoggedIn, (req, res, next)=> {
  res.send(req.user);
});

app.get('/api/users', isLoggedIn, (req, res, next)=> {
  User.except(req.user.id)
  .then( users => res.send(users))
  .catch(next);
});

app.get('/api/messages', isLoggedIn, (req, res, next)=> {
  Message.forUser(req.user.id)
  .then( messages => res.send(messages))
  .catch(next);
});

app.post('/api/messages/:toId', isLoggedIn, (req, res, next)=> {
  Message.create({ ...req.body, fromId: req.user.id, toId: req.params.toId})
  .then( message => res.send(message))
  .catch(next);
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ message: err.message });
});
