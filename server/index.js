const app = require('./app');
const port = process.env.PORT || 3000;
const { sync } = require('./db');

sync()
  .then(()=> {
    app.listen(port, ()=> console.log(`listening on port ${port}`))
  });
  


