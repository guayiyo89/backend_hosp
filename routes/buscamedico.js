var express = require ('express');
var mongoose = require('mongoose');

//importamos los modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

// Ruta Principal
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    //trnsformamos en una expresion regular (i)nsensible a las may o minusculas
    var regex = new RegExp(busqueda, 'i');

    //buscamos por hospital
    Hospital.find({ nombre: regex }, (err, hospitales)=>{

        res.status(200).json({
                ok: true,
                hospitales: hospitales
            });

    });

    
});

module.exports = app;
