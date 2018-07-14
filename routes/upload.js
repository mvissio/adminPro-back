var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var Hospital = require('../models/hospital');
var User = require('../models/user');
var Doctor = require('../models/doctor');
var fs = require('fs');


app.use(fileUpload());

// Rutas
app.put('/:tab/:id', (req, res, next) => {
    var tab = req.params.tab;
    var id = req.params.id;
    if (!req.files) {
        return res.status(400).json({
            status: false,
            message: "No se selecciono ningun archivo",
            errors: {message: "Debe seleccionar un archivo"}
        });
    }

    // search filename
    var file = req.files.img;
    var fileCut = file.name.split('.');
    var fileExt = fileCut[fileCut.length - 1];

    var extValid = ['png', 'jpg', 'gif', 'jpeg'];
    var tabValid = ['hospitals', 'doctors', 'users'];

    if (tabValid.indexOf(tab) < 0) {
        return res.status(400).json({
            status: false,
            message: "Tab no valida",
            errors: {message: "Los tabs validos son " + tabValid.join(', ')}
        });
    }
    if (extValid.indexOf(fileExt) < 0) {
        return res.status(400).json({
            status: false,
            message: "Extension no valida",
            errors: {message: "Las extensiones validas son " + extValid.join(', ')}
        });
    }

    var fileName = `${id}-${new Date().getMilliseconds()}.${fileExt}`;

    var path = `./uploads/${tab}/${fileName}`;
    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Error al mover el archivo",
                errors: err
            });
        } else {
            uploadForTab(tab, id, fileName, res);
        }
    });
});

function uploadForTab(tab, id, fileName, res) {

    switch (tab) {
        case 'users':
            User.findById(id, (err, user) => {
                if (user.img.length > 0) {
                    let pathOld = `./uploads/${tab}/${user.img}`;
                    if (fs.existsSync(pathOld)) {
                        fs.unlinkSync(pathOld);
                    }
                }
                user.img = fileName;
                user.save((err, userSave) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: "Error al cargar el usuario",
                            errors: {message: "No se pudo cargar el usuario"}
                        })
                    } else {
                        return res.status(200).json({
                            status: true,
                            message: "usuario actualizado",
                            user: userSave
                        });
                    }
                })
            });
            break;
        case 'doctors':
            Doctor.findById(id, (err, doctor) => {
                if (doctor.img.length > 0) {
                    let pathOld = `./uploads/${tab}/${doctor.img}`;
                    if (fs.existsSync(pathOld)) {
                        fs.unlinkSync(pathOld);
                    }
                }
                doctor.img = fileName;
                doctor.save((err, doctorSave) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: "Error al cargar el doctor",
                            errors: {message: "No se pudo cargar el doctor"}
                        })
                    } else {
                        return res.status(200).json({
                            status: true,
                            message: "Doctor actualizado",
                            doctor: doctorSave,
                        });
                    }
                })
            });
            break;
        case 'hospitals':
            Hospital.findById(id, (err, hospitalCarge) => {
                if (hospitalCarge.img.length > 0) {
                    let pathOld = `./uploads/${tab}/${hospitalCarge.img}`;
                    if (fs.existsSync(pathOld)) {
                        fs.unlinkSync(pathOld);
                    }
                }
                hospitalCarge.img = fileName;
                hospitalCarge.save((err, hospitalSave) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: "Error al cargar el Hospital",
                            errors: {message: "No se pudo cargar el doctor"}
                        })
                    } else {
                        return res.status(200).json({
                            status: true,
                            message: "Hospital actualizado",
                            hospital: hospitalSave,
                        });
                    }
                });

            });
            break;
    }


}

module.exports = app;