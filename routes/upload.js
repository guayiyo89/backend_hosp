var express = require ('express');
var mongoose = require('mongoose');
//libreria para cargar archivos*
var fileUpload = require('express-fileupload');
//libreria para borrar archivos!
var fs = require('fs');

var app = express();

//default options
app.use(fileUpload());

//importamos modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Ruta (tipo es si es medio usuario o hospital), id del elemento a modificar
app.put('/:tipo/:id', (req, res, next) => {

    //los recibo desde la URL
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion validos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if( tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({

            ok: false,
            message: 'La ruta asignada no existe',
            errors: {message: 'Debe ser una de estos tres:'}
        });
    }

    if(!req.files){
        return res.status(400).json({

            ok: false,
            message: 'No selecciono Nada',
            errors: {message: 'Debe seleccionar un archivo'}
        });

    }


    //OBTENER NOMBRE DEL ARCHIVO
    var archivo = req.files.imagen;

    //seccionamos el nombre de la imagen para obtener la extension
    var nombreCut = archivo.name.split('.');
    var extension = nombreCut.pop('.');

    //extenciones aceptadas
    var extensionesValidas = ['jpg','png','gif','jpeg','bmp'];

    //buscamos si la extension coincide con el archivo
    if( extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({

            ok: false,
            message: 'La extension del archivo no es permitida',
            errors: {message: 'Debe seleccionar otro archivo'}
        });
    }

    //Nombre de archivo personalizado en el server
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    //mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if(err){
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar archivo',
                errors: err
            }); 
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        /* res.status(200).json({
            ok: true,
            mensaje: 'La peticion esta OK',
            extension
        }); */

    });

});


function subirPorTipo(tipo, id, nombreArchivo, res){
    
    if (tipo === 'usuarios'){

        Usuario.findById(id, (err, usuario) =>{

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //consultamos si existe un archivo antes...
            if(fs.existsSync(pathViejo)){
                //lo borra
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, userRefresh) =>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen Usuario Refresh',
                    usuario: userRefresh
                });

            });
        });
    }

    if (tipo === 'medicos'){

        Medico.findById(id, (err, medico) =>{

            var pathViejo = './uploads/medicos/' + medico.img;

            //consultamos si existe un archivo antes...
            if(fs.existsSync(pathViejo)){
                //lo borra
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medRefresh) =>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen Medico Refresh',
                    medico: medRefresh
                });

            });
        });
        
    }

    if (tipo === 'hospitales'){

        Hospital.findById(id, (err, hospital) =>{

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //consultamos si existe un archivo antes...
            if(fs.existsSync(pathViejo)){
                //lo borra
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospRefresh) =>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen Medico Refresh',
                    hospital: hospRefresh
                });

            });
        });
        
    }
        
    }



module.exports = app;