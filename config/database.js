var mongoose      = require('mongoose');
//mongodb://<dbuser>:<dbpassword>@ds255309.mlab.com:55309/cars
var url           = 'mongodb://milad:123@ds255309.mlab.com:55309/cars';
mongoose.Promise = global.Promise;
mongoose.connect(url)
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
