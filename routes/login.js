var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED= require('../config/config').SEED;

// Google
var CLIENT_ID= require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var app = express();
var User = require('../models/user');

// ======================================================================
// Autentificacion Google
// ======================================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    console.warn(payload)
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
verify().catch(console.error);


app.post('/google', async(req, res, next) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e=>{
            return res.status(400).json({
                status: false,
                mensaje: 'Token no valido'
            });
        });

    User.findOne({email:googleUser.email}, (err, userDB)=>{
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        } else {
            if(userDB){
                if(userDB.google ===false){
                    return res.status(400).json({
                        status: false,
                        mensaje: 'Debe usar autentificacion normal'
                    });
                }else {
                    let token = jwt.sign({user: userDB}, SEED, {expiresIn: 1800});

                    res.status(200).json({
                        status: true,
                        user: userDB,
                        token: token,
                        id: userDB._id
                    });
                }
            } else {
                // El usuario no existe hay que crearlo
                var user = new User();

                user.name = googleUser.name;
                user.email = googleUser.email;
                user.img = googleUser.img;
                user.google = true;
                user.password = ':)';
                user.save(err, userDB=>{
                    let token = jwt.sign({user: userDB}, SEED, {expiresIn: 1800});

                    res.status(200).json({
                        status: true,
                        user: userDB,
                        token: token,
                        id: userDB._id
                    });
                })
            }
        }
    });
    //
    // res.status(200).json({
    //     status: true,
    //     mensaje: 'Peticion realizada correctamente',
    //     googleUser: googleUser
    // });

});


// ======================================================================
// Login User
// ======================================================================

app.post('/', (req, res) => {
    var body = req.body;
    User.findOne({email: body.email}, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        } else {
            if (!userDB) {
                return res.status(400).json({
                    status: false,
                    errors: {mensaje: 'Credenciales incorrectas - EMAIL'}
                });
            } else if (!bcrypt.compareSync(body.password, userDB.password)) {
                return res.status(400).json({
                    status: false,
                    errors: {mensaje: 'Credenciales incorrectas - PASSWORD'}
                });
            } else {
                userDB.password = '******';
                let token = jwt.sign({user: userDB}, SEED, {expiresIn: 1800});
                res.status(200).json({
                    status: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            }
        }
    });
});


module.exports = app;