const Sequelize = require('sequelize');
const { Op, UUID, UUIDV4, STRING } = Sequelize;
const jwt = require('jwt-simple');

const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_chat');

const User = conn.define('user', {
  id: {
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
  },
  username: {
    type: STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

const Message = conn.define('message', {
  id: {
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
  },
  fromId: {
    type: UUID,
    allowNull: false
  },
  toId: {
    type: UUID,
    allowNull: false
  },
  text: {
    type: STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

Message.belongsTo(User, { as: 'from' });
Message.belongsTo(User, { as: 'to' });

Message.forUser = function(id){
  return this.findAll({
    order: [
      ['createdAt', 'ASC'],
    ],
    where: {
      [Op.or]: {
        fromId: id,
        toId: id
      }
    }
  });
}

User.register = function(user){
  return this.create(user)
    .then( user => jwt.encode({ id: user.id}, process.env.JWT))
}

const authError = ()=> {
  const error = Error('not authorized');
  error.status = 401;
  return error;
};

User.findByToken = function(token){
  let id;
  try {
    id = jwt.decode(token, process.env.JWT).id;
  }
  catch(ex){
    throw authError();
  }
  return User.findByPk(id)
    .then( user => {
      if(!user){
        throw authError();
      }
      return user;
    });
}

User.except = function(id){
  return User.findAll({
    where: {
      id: { [Op.ne]: id}
    }
  });
}

User.authenticate = function({ username, password}){
  return User.findOne({ where: { username, password }})
    .then( user => {
      if(!user){
        throw authError();
      }
      return jwt.encode({ id: user.id }, process.env.JWT);
    })
}

const sync = async()=> {
  await conn.sync({ force: true });
  const [tedToken, aliceToken, bobToken ] = await Promise.all([
    User.register({ username: 'Ted', password: 'TED'}),
    User.register({ username: 'Alice', password: 'ALICE'}),
    User.register({ username: 'Bob', password: 'BOB'})
  ]);

  const [ted, alice, bob] = await Promise.all([
    User.findByToken(tedToken),
    User.findByToken(aliceToken),
    User.findByToken(bobToken)
  ]);

  await Promise.all([
    Message.create({ fromId: ted.id, toId: alice.id, text: 'Hi alice'}),
    Message.create({ fromId: ted.id, toId: bob.id, text: 'Hi Bob!'}),
  ]);
  await Message.create({ fromId: bob.id, toId: ted.id, text: 'Hey Ted! How is it going?'});
};

module.exports = {
  sync,
  models: {
    User,
    Message
  }
};


