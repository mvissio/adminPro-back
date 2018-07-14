var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');
// Rutas
app.get('/:type/:img', (req, res, next) => {

    var type = req.params.type;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${type}/${img}`);

    if(fs.existsSync(pathImagen)){
        res.sendfile(path);
    }else {
        var pathNoImg = path.resolve(__dirname, `../assets/no-img.jpg`);
    }
    res.status(200).json({
        status: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

module.exports = app;