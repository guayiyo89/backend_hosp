var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var medicoSchema = new Schema ({

    nombre: {type: String, required: [true, 'El nombre es necesario']},
    img: {type: String, required: false},
    usuario: {type: Schema.Types.ObjectId, ref: 'Usuario'},
    hospital: {type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'Necesita el id de un Hospital']}

});

module.exports = mongoose.model('Medico', medicoSchema);