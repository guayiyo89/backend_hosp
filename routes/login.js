var express = require ('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//importamos el CLIENT_ID desde config
var CLIENT_ID = require('../config/config').CLIENT_ID;
//librerias Google OAuth
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//inicializamos variables
var app = express();

//importamos el SEED desde config
var SEED = require('../config/config').SEED;
//importamos el esquema de usuario
var Usuario = require('../models/usuario');

//============================================================
// SIGN IT NORMAL
//============================================================
app.post('/', (req,res) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB)=>{

        if (err){
            return res.status(500).json({
                ok:false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB){
            return res.status(400).json({
                ok:false,
                message: 'No coinciden las credenciales - email',
                errors: err
            });
        }

        //comparamos las contraseñas insertadas con las de la DB
        if (!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok:false,
                message: 'No coinciden las credenciales - passwd',
                errors: err
            });
        }

        //TOKEN
        usuario.password = ':)'; //para no enviar el psswd en el token
        var token = jwt.sign({usuario: usuarioDB}, SEED,{ expiresIn: 14400}); //4hrs

        res.status(200).json({
            ok:true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });

    });


});

//============================================================
// SIGN IT by Google
//============================================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return{
      nombre: payload.name,
      email: payload.email,
      img: payload.picture,
      google: true
  }
}

app.post('/google', async(req,res) =>{

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e =>{
            res.status(403).json({
                ok: false,
                message: 'Token no Valido',
                errors: e
            });
        })

    //Buscamos si el correo q viene ya existe en la BD
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) =>{

        if (err){
            return res.status(500).json({
                ok:false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if(usuarioDB){
            //verificamos si se auth por Google po medio de un flag
            if ( usuarioDB.google === false){
                return res.status(400).json({
                    ok:false,
                    message: 'El user se autenticado con este correo',
                    errors: err
                });
            }
            else{
                //Generamos un nuevo token y lo armitimos
                var token = jwt.sign({usuario: usuarioDB}, SEED,{ expiresIn: 14400}); //4hrs

                res.status(200).json({
                    ok:true,
                    message: 'Hola Hola',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        }
        else {
            //el usuario no existe en el registro
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.img = googleUser.img;
            usuario.email = googleUser.email;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save( (err, usuarioGuardado) => {
                if (err){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }

                var token = jwt.sign({usuario: usuarioDB}, SEED,{ expiresIn: 14400});

                res.status(200).json({
                    ok:true,
                    message: 'Hola Hola',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });

            });

        }
    });




    function obtenerMenu(ROLE) {
        var menu = [
            {
                titulo: 'Principal',
                icono: 'mdi mdi-gauge',
                submenu: [
                    {titulo: 'Dashboard', url: '/dashboard'},
                  {titulo: 'ProgressBar', url: '/progress'},
                  {titulo: 'Graficas', url: '/graficas1'},
                  {titulo: 'Promesas', url: '/promesas'},
                  {titulo: 'Observame', url: '/rxjs'}
                ]
            }
            ];
        
        if(ROLE === 'ADMIN_ROLE') {
            // menu[1].submenu.unshift({titulo:'Usuarios', url:'/usuarios'});
            menu.unshift({
                titulo: 'Management',
                icono: 'mdi mdi-folder-lock-open',
                submenu: [
                    {titulo:'Usuarios', url:'/usuarios'},
                    {titulo:'Hospitales', url:'/hospitales'},
                    {titulo:'Medicos', url:'/medicos'}
                ]
            })
        }
        return menu;
    }

    /* res.status(200).json({
        ok: true,
        message: 'Oh Yeah!',
        googleUser
    }); */

});

module.exports = app;
