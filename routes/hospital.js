var express = require('express');
var mdAth = require('../middlewares/auth');
var app = express();
var Hospital = require('../models/hospital');

// ======================================================================
// Obtener Todos los Hospitales
// ======================================================================
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);

    Hospital.find({}, 'name')
        .populate('user', 'name email')
        .skip(from)
        .limit(5).exec(
        (err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    mensaje: 'Error cargando los Hospitales',
                    errors: err
                });
            } else {

                Hospital.count({}, (err, count) => {
                    return res.status(200).json({
                        status: true,
                        hospitals: hospitals
                    });
                });
            }
        }
    );
});


// ======================================================================
// Actualizar Hospital
// ======================================================================

app.put('/:id', mdAth.verifyToken, (req, res) => {
    var id = req.params.id;
    let body = req.body;
    console.log(body);
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        } else {
            if (!hospital) {
                return res.status(400).json({
                    status: false,
                    mensaje: 'No se encontro el hospital con id: ' + id,
                    errors: {mensaje: 'No existe el hospital con ese ID'}
                });
            } else {
                hospital.name = body.name;
                hospital.img = body.img;
                hospital.user = body.idUser;
                hospital.save((err, hospitalSave) => {
                    if (err) {
                        return res.status(400).json({
                            status: false,
                            mensaje: 'Error al actualizar el hospital',
                            errors: err
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            hospital: hospitalSave
                        });
                    }
                });
            }
        }
    });
});

// ======================================================================
// Crear Hospitales
// ======================================================================

app.post('/', mdAth.verifyToken, (req, res) => {
    let body = req.body;
    let hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: body.idUser
    });
    hospital.save((err, hospitalSave) => {
        if (err) {
            return res.status(400).json({
                status: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        } else {
            res.status(201).json({
                status: true,
                hospital: hospitalSave
            });
        }
    });
});

// ======================================================================
// Delete hospital by ID
// ======================================================================
app.delete('/:id', mdAth.verifyToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        } else {
            if (!hospitalDeleted) {
                res.status(400).json({
                    status: false,
                    errors: {message: 'No existe el Hospital con el id' + id}
                });
            } else {
                res.status(200).json({
                    status: true,
                    hospital: hospitalDeleted,
                    message: 'Hospital Borrado'
                });
            }
        }
    });
});


module.exports = app;
