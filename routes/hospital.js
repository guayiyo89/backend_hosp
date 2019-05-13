var express = require ('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

//importamos la verificacion del token
var mdAuth = require('../middlewares/autenticacion');

//inicializamos variables
var app = express();

//importamos el esquema de hospital
var Hospital = require('../models/hospital');

// OBTENER TODOS LOS Hospitales
app.get('/', (req, res, next) => {

    //offset para la paginacion
    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    //Realizamos la query de mongo...
    Hospital.find({}, 'nombre img',)
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec(
        (err, hospitales) => {

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error 500: Error en la Datbase',
                errors: err
            });
        }


        Hospital.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                hospitales,
                total: conteo
            });

        });

    });


});


//=====================================================================================
// EDITAR
//=====================================================================================
app.put('/:id', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req, res) => {

    //Inicializo variables locales
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital)=>{

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: {message : 'No existe un hospital con tal id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        //GUARDO LOS CAMBIOS
        hospital.save( (err, hospitalGuardado) => {
        if (err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        });
    });

    });


});


//=====================================================================================
// INGRESAR NUEVO HOSPITAL
//=====================================================================================
app.post('/', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req,res) =>{
    var body = req.body;

    //DEFINIMOS EL HOSPITAL
    var hospital = new Hospital ({
        nombre : body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    //GUARDAMOS EL HOSPITAL
    hospital.save( (err, hospitalGuardado) => {
        if (err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error en el guardado',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        });
    });


});


//=====================================================================================
// ELIMINAR por ID
//=====================================================================================

app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req,res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error borrar hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuariotoken: req.usuario
        });

    })
});

//=====================================================================================

//=====================================================================================
// Buscar HOSPITAL
//=====================================================================================

app.get('/:id', (req,res) => {
    var id = req.params.id;

    Hospital.findById(id, (err,hospital) => {

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error en busqueda de hospital',
                errors: err
            });
        }

        if(!hospital){
            res.status(400).json({
                ok: false,
                mensaje: 'El hospital que buscas no existe.',
                errors: {message: 'Ese ID de hospital no existe.'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospital
        })
    });
});

module.exports = app;