var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAth= require('../middlewares/auth');
var app = express();
var User = require('../models/user');

// ======================================================================
// Obtener Todos los Usuarios
// ======================================================================
app.get('/', (req, res, next) => {

    User.find({}, 'name email img role').exec(
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    mensaje: 'Error cargando los ususarios',
                    errors: err
                });
            } else {

                return res.status(200).json({
                    status: true,
                    users: users
                });
            }
        }
    );
});


// ======================================================================
// Actualizar Usuario
// ======================================================================

app.put('/:id',  mdAth.verifyToken, (req, res) => {
    var id = req.params.id;
    let body = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al buscar el ususario',
                errors: err
            });
        } else {
            if (!user) {
                return res.status(400).json({
                    status: false,
                    mensaje: 'No se encontro el usuario con id: ' + id,
                    errors: {mensaje: 'No existe el usuario con ese ID'}
                });
            } else {
                user.name = body.name;
                user.email = body.email;
                user.role = body.role;
                user.save((err, userSave) => {
                    if (err) {
                        return res.status(400).json({
                            status: false,
                            mensaje: 'Error al actualizar el ususario',
                            errors: err
                        });
                    } else {
                        userSave.password = '******';
                        res.status(200).json({
                            status: true,
                            user: userSave
                        });
                    }
                });
            }
        }
    });
});

// ======================================================================
// Crear Todos los Usuarios
// ======================================================================

app.post('/', mdAth.verifyToken, (req, res) => {
    let body = req.body;
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,

    });
    user.save((err, userSave) => {
        if (err) {
            return res.status(400).json({
                status: false,
                mensaje: 'Error al crear el ususario',
                errors: err
            });
        } else {
            res.status(201).json({
                status: true,
                user: userSave
            });
        }
    });
});

// ======================================================================
// Delete User by ID
// ======================================================================
app.delete('/:id', mdAth.verifyToken,  (req, res) => {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, userDeleted) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al borrar el ususario',
                errors: err
            });
        } else {
            if (!userDeleted) {
                res.status(400).json({
                    status: false,
                    errors: {message: 'No existe el usuario con el id' + id}
                });
            } else {
                res.status(200).json({
                    status: true,
                    user: userDeleted,
                    message: 'Usuario Borrado'
                });
            }
        }
    });
});


module.exports = app;
