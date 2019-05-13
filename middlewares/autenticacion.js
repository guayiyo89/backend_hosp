var jwt = require('jsonwebtoken');

//importamos el SEED desde config
var SEED = require('../config/config').SEED;

//=====================================================================================
// MIDDLEWARE (de aqui en adelante las peticiones lo usasn)
//=====================================================================================

//=====================================================================================
// Verifica Token
//=====================================================================================
exports.verificaToken = function (req, res, next) {

    var token = req.query.token;
    jwt.verify( token, SEED, (err, decoded) => {

        if (err){
            return res.status(401).json({
                ok: false,
                mensaje: 'ACCESO DENEGADO',
                errors: err
            });
        }

        //obtenemos la info del usuario q efectua los cambios
        req.usuario = decoded.usuario;
        next();
    });
}

//=====================================================================================
// Verifica si es Admin
//=====================================================================================
exports.verificaAdmin = function (req, res, next) {

    var usuario = req.usuario; // obtenemos el usuario del metodo anterior

    if(usuario.role === 'ADMIN_ROLE'){
        next();
        return;
    } else {
            return res.status(401).json({
                ok: false,
                mensaje: 'No tienes los permisos necesarios',
                errors: {message: 'No es Administrador.'}
            });
        }
    }

//=====================================================================================
// Admin o User pueden editarse a si mismo.
//=====================================================================================
exports.verificaUser = function (req, res, next) {

    var usuario = req.usuario; // obtenemos el usuario del metodo anterior
    var id = req.params.id;

    if(usuario.role === 'ADMIN_ROLE' || usuario._id === id){
        next();
        return;
    } else {
            return res.status(401).json({
                ok: false,
                mensaje: 'No tienes los permisos necesarios',
                errors: {message: 'No es Administrador ni el usuario a modificar.'}
            });
        }
    }