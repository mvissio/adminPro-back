var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var roleValides = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var userSchema = new Schema({
    name: {type: String, required: [true, 'El nombre es requerido']},
    email: {type: String, unique: true, required: [true, 'El email es requerido']},
    password: {type: String, required: [true, 'La contraseña es requerida']},
    img: {type: String, required: false, default:""},
    role: {type: String, required: [true], default: 'USER_ROLE', enum: roleValides},
});

userSchema.plugin(uniqueValidator, {message: '{PATH} esta asociado a un usuario'});

module.exports = mongoose.model('User', userSchema);