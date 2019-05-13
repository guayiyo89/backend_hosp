var express = require ('express');
var mongoose = require('mongoose');

//importamos los modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

//==========================================================================================================
//BUSQUEDA POR COLECCION
//==========================================================================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    //trnsformamos en una expresion regular (i)nsensible a las may o minusculas
    var regex = new RegExp(busqueda, 'i');

    //bandera de promesa
    var promesa;

    //validacion de busqueda por tabla
    switch(tabla){
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
        break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
        break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
        break;

        default:
            res.status(400).json({
                ok: false,
                message: 'El parametro de la busqueda no existe',
                error: { message: 'Tipo de tabla no valido'}
            })
    }

    promesa.then( data =>{
        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});


//==========================================================================================================
//BUSQUEDA GENERAL
//==========================================================================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    //trnsformamos en una expresion regular (i)nsensible a las may o minusculas
    var regex = new RegExp(busqueda, 'i');

    //En ES6 puedo llamar todas las promesas para efectuarlas de forma simultanea y encontrar un resultado
    //Buscar tanto hospitales, medicos o users y devuelve resultaods
    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
        ]).then(respuestas =>{

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        });


   
});

//Se deben efectuar funciones asincronas para hacer la busqueda simultanea

//BUSCAR HOSPITAL
function buscarHospitales (busqueda, regex){
    return new Promise((resolve, reject)=>{
        Hospital.find({ nombre: regex }, (err, hospitales)=>{

            if(err){
                reject('Error al cargar hospitales', err);
            }else{
                resolve(hospitales);
            }
        });
    });
}

function buscarMedicos (busqueda, regex){
    return new Promise((resolve, reject)=>{
        Medico.find({ nombre: regex })
        .populate('usuario', 'nombre email role img')
        .populate('hospital', 'nombre img')
        .exec((err, medicos)=>{

            if(err){
                reject('Error al cargar medicos', err);
            }else{
                resolve(medicos);
            }
        });
    });
}

function buscarUsuarios (busqueda, regex){
    //se va hacer una busqueda por cada una de las columnas (nombre o email)
    return new Promise((resolve, reject)=>{
        Usuario.find({}, 'nombre email role img')
            .or([ {'nombre': regex}, {'email': regex} ])
            .exec((err, usuarios) => {

                if(err){
                    reject('Error al cargar users', err);
                }else{
                    resolve(usuarios);
                }

            });
    });
}



module.exports = app;
