var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED= require('../config/config').SEED;


var app = express();
var User = require('../models/user');

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