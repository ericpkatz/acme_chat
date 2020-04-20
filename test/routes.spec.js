const app = require('supertest')(require('../server/app'));
const { expect } = require('chai');
const db = require('../server/db');
const { User } = db.models;
const jwt = require('jwt-simple');

describe('Routes', ()=> {
  beforeEach(()=> db.sync());
  describe('POST /api/auth', ()=> {
    describe('correct credentials', ()=> {
      it('logs in user', ()=> {
        return app.post('/api/auth')
          .send({ username: 'Ted', password: 'TED'})
          .expect(200);
      });
    });
    describe('in-correct credentials', ()=> {
      it('return 401', ()=> {
        return app.post('/api/auth')
          .send({ username: 'Ted', password: 'TEDD'})
          .expect(401);
      });
    });
  });
  describe('GET /api/auth', ()=> {
    let token;
    beforeEach(async()=> {
      const alice = await User.findOne({ where: { username: 'Alice'}});
      token = jwt.encode({ id: alice.id}, process.env.JWT); 
    });
    describe('with valid token', ()=> {
      it('returns user', ()=> {
        return app.get('/api/auth')
          .set('authorization', token)
          .expect(200)
          .then( response => {
            expect(response.body.username).to.equal('Alice');
          });
      });
    });
    describe('with invalid token', ()=> {
      it('return 401', ()=> {
        return app.get('/api/auth')
          .set('authorization', token + '!')
          .expect(401);
      });
    });
  });

  describe('GET /api/users', ()=> {
    let token;
    beforeEach(async()=> {
      const alice = await User.findOne({ where: { username: 'Alice'}});
      token = jwt.encode({ id: alice.id}, process.env.JWT); 
    });
    it('returns all users except logged in user', ()=> {
      return app.get('/api/users')
        .set('authorization', token)
        .expect(200)
        .then( response => {
          expect(response.body.length).to.equal(2);
        });
    });
  });
  describe('GET /api/messages', ()=> {
    let aliceToken;
    let bobToken;
    let tedToken;
    beforeEach(async()=> {
      const [bob, alice, ted] = await Promise.all([
        User.findOne({ where: { username: 'Alice'}}),
        User.findOne({ where: { username: 'Bob'}}),
        User.findOne({ where: { username: 'Ted'}})
      ]);
      aliceToken = jwt.encode({ id: alice.id}, process.env.JWT); 
      bobToken = jwt.encode({ id: bob.id}, process.env.JWT); 
      tedToken = jwt.encode({ id: ted.id}, process.env.JWT); 
    });
    it('returns all of a alices messages for alice', ()=> {
      return app.get('/api/messages')
        .set('authorization', aliceToken)
        .expect(200)
        .then( response => {
          expect(response.body.length).to.equal(1);
        });
    });
    it('returns all of bobs messages for bob', ()=> {
      return app.get('/api/messages')
        .set('authorization', bobToken)
        .expect(200)
        .then( response => {
          expect(response.body.length).to.equal(1);
        });
    });
    it('returns all of teds messages for ted', ()=> {
      return app.get('/api/messages')
        .set('authorization', tedToken)
        .expect(200)
        .then( response => {
          expect(response.body.length).to.equal(2);
        });
    });
  });
  describe('POST /api/messages/:toId', ()=> {
    let aliceToken;
    let bobToken;
    let tedToken;
    let _bob;
    beforeEach(async()=> {
      const [bob, alice, ted] = await Promise.all([
        User.findOne({ where: { username: 'Alice'}}),
        User.findOne({ where: { username: 'Bob'}}),
        User.findOne({ where: { username: 'Ted'}})
      ]);
      _bob = bob;
      aliceToken = jwt.encode({ id: alice.id}, process.env.JWT); 
      bobToken = jwt.encode({ id: bob.id}, process.env.JWT); 
      tedToken = jwt.encode({ id: ted.id}, process.env.JWT); 
    });
    it('generates a new message', ()=> {
      return app.post(`/api/messages/${_bob.id}`)
        .set('authorization', aliceToken)
        .send({ text: 'hi Bob'})
        .expect(200)
        .then( response => {
          expect(response.body.text).to.equal('hi Bob');
        });
    });
  });
});
