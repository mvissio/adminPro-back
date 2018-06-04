var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var hospitalSchema = new Schema({
    name: {type: String, required: [true, 'El	nombre	es	requerido']},
    img: {type: String, required: false, default:""},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});
module.exports = mongoose.model('Hospital', hospitalSchema);