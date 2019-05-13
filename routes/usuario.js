var express = require ('express');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//importamos la verificacion del token
var mdAuth = require('../middlewares/autenticacion');

//inicializamos variables
var app = express();

//importamos el esquema de usuario
var Usuario = require('../models/usuario');

// OBTENER TODOS LOS USUARIOS
app.get('/', (req, res, next) => {

    //offset para la paginacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Realizamos la query de mongo...
    Usuario.find({}, 'nombre email img role google',)
    .skip(desde)
    .limit(5)
    .exec(
        (err, usuarios) => {

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error 500: Error en la Datbase',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo)=>{

            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });

        });

    });


});



//=====================================================================================
// EDITAR USUARIO
//=====================================================================================
app.put('/:id', [mdAuth.verificaToken, mdAuth.verificaUser], (req, res) => {

    //Inicializo variables locales
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario)=>{

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El user con el id: ' + id + ' no existe',
                errors: {message : 'No existe un usuario con tal id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        //GUARDO LOS CAMBIOS
        usuario.save( (err, usuarioGuardado) => {
        if (err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });

    });


});

//=====================================================================================
// INGRESAR NUEVO USUARIO
//=====================================================================================
app.post('/', (req,res) =>{
    var body = req.body;

    //DEFINIMOS EL USUARIO
    var usuario = new Usuario ({
        nombre : body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //GUARDAMOS EL USUARIO
    usuario.save( (err, usuarioGuardado) => {
        if (err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error en el guardado',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });


})

//=====================================================================================
// ELIMINAR USUARIO por ID
//=====================================================================================

app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req,res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{

        if (err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error borrar usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuariotoken: req.usuario
        });

    })
});


module.exports = app;