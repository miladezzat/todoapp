var mongoose      = require('mongoose');
var url           = 'mongodb://localhost:8001/cars';
mongoose.Promise = global.Promise;
mongoose.connect(url)
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
