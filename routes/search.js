var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var User = require('../models/user');
var Doctor = require('../models/doctor');


// Rutas
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
        findHospitals(search, regex),
        findDoctors(search, regex),
        findUsers(search, regex)
    ])
        .then(values => {
            res.status(200).json({
                status: true,
                hospitals: values[0],
                doctors: values[1],
                users: values[2]
            });
        });
});

app.get('/collection/:tab/:search', (req, res, next) => {
    var search = req.params.search;
    var tab = req.params.tab;
    var regex = new RegExp(search, 'i');
    var promese;
    switch (tab) {
        case 'hospitals':
            promese = findHospitals(search, regex);
            break;
        case 'doctors':
            promese = findDoctors(search, regex);
            break;
        case 'users':
            promese = findUsers(search, regex);
            break;
        default:
            res.status(400).json({
                status: false,
                message: "Error al buscar por tipo " + tab + ", tipos soportados: users, doctors, hospitals",
                errors: {message: "Error al buscar los" + tab}
            });
    }
    promese.then(value => {
        res.status(200).json({
            status: true,
            [tab]: value
        });
    });
});

function findHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({name: regex})
            .populate('user', 'name email')
            .limit(5)
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error al cargar hospitales', err)
                } else {
                    resolve(hospitals);
                }
            });
    })
}

function findDoctors(search, regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({name: regex})
            .populate('user', 'name email')
            .populate('hospital', 'name')
            .limit(5)
            .exec((err, doctors) => {
                    if (err) {
                        reject('Error al cargar doctores', err)
                    } else {
                        resolve(doctors);
                    }
                }
            )
        ;
    })
}

function findUsers(search, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email role')
            .or([{name: regex}, {email: regex}])
            .limit(5)
            .exec((err, users) => {
                    if (err) {
                        reject('Error al cargar doctores', err)
                    } else {
                        resolve(users);
                    }
                }
            );
    });
}


module.exports = app;