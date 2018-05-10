var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var taskSchema = new Schema({
	taskName            :		{	type: String, required: true},
  employeeId          :		{	type: String, required: true},
  startDate           :		{	type: String, required: true},
  EndDate             :		{	type: String, required: true},
});


module.exports = mongoose.model('Task', taskSchema);
