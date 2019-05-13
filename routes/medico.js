var express = require ('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

//importamos la verificacion del token
var mdAuth = require('../middlewares/autenticacion');

//inicializamos variables
var app = express();

//importamos el esquema de medico
var Medico = require('../models/medico');


//=====================================================
// OBTENER TODOS LOS Medicos
app.get('/', (req, res, next) => {

    //offset para la paginacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Realizamos la query de mongo...
    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuarios', 'nombre email')
    .populate('hospital')
    .exec(
        (err, medicos) => {

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error 500: Error en la Datbase',
                errors: err
            });
        }

        Medico.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                medicos,
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

    Medico.findById(id, (err, medico)=>{

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: {message : 'No existe un medico con tal id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        //GUARDO LOS CAMBIOS
        medico.save( (err, medicoGuardado) => {
        if (err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });

    });


});

//=====================================================================================
// Medico por ID
//=====================================================================================
app.get('/:id', (req,res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medico) => {

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: {message : 'No existe un medico con tal id' }
            });
        }

        res.status(200).json({
            ok:true,
            medico: medico
        })

    })
});

//=====================================================================================
// INGRESAR NUEVO
//=====================================================================================
app.post('/', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req,res) =>{
    var body = req.body;

    //DEFINIMOS 
    var medico = new Medico ({
        nombre : body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    //GUARDAMOS 
    medico.save( (err, medicoGuardado) => {
        if (err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error en el guardado',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });


});

//=====================================================================================
// ELIMINAR por ID
//=====================================================================================

app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req,res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error borrar medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuariotoken: req.usuario
        });

    })
});

//=====================================================================================

module.exports = app;