var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol valido.'
};

//defino esquema para usuario con un objeto JS
var usuarioSchema = new Schema({

    nombre: {type: String, required: [true, 'El nombre es necesario']},
    email: {type: String, unique: true, required: [true, 'El email es necesario']},
    password: {type: String, required: [true, 'El password es necesario']},
    img: {type: String, required: false},
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: {type: Boolean, default: false}

});

//validacion unique
usuarioSchema.plugin( uniqueValidator, {message: '{PATH} debe ser unico'});

//exporto el modelo
module.exports = mongoose.model('Usuario', usuarioSchema);