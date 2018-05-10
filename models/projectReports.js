var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var projectReportsSchema = new Schema({
	reportName            :		{	type: String, required: true},
  ManagerId             :		{	type: String, required: true},
  text                  :		{	type: String, required: true},
});


module.exports = mongoose.model('ProjectReports', projectReportsSchema);
