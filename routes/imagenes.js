var express = require ('express');
var mongoose = require('mongoose');

var app = express();

//libreria para buscar el path de la imagen
const path = require('path');
//usamos el fs para ver si existe una img (al igual q en el caso de subirlas)
const fs = require('fs');

// Ruta Principal
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    //buscamos el path de la imagen
    var imagePath = path.resolve(__dirname, `../uploads/${ tipo }/${ img }` );

    if ( fs.existsSync( imagePath ) ){
        res.sendFile( imagePath );
    } else {
        var pathNoimage = path.resolve(__dirname,'../assets/no-img.jpg' );
        res.sendFile(pathNoimage);
    }

/*     res.status(200).json({
        ok: true,
        mensaje: 'La peticion esta OK'
    }); */

});

module.exports = app;