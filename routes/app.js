var express = require ('express');
var mongoose = require('mongoose');

var app = express();

// Ruta Principal
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'La peticion esta OK'
    });

});

module.exports = app;