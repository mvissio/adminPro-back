var express = require('express');
var app = express();
// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        status: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

module.exports = app;