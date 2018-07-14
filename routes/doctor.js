var express = require('express');
var mdAth = require('../middlewares/auth');
var app = express();
var Doctor = require('../models/doctor');

// ======================================================================
// Obtener Todos los Doctores
// ======================================================================
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);
    Doctor.find({}, 'name user hospital')
        .populate('user', 'name email')
        .populate('hospital')
        .skip(from)
        .limit(5)
        .exec(
            (err, doctors) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        mensaje: 'Error cargando los Doctores',
                        errors: err
                    });
                } else {

                    Doctor.count({}, (err, count) => {
                        return res.status(200).json({
                            status: true,
                            doctors: doctors
                        });
                    });
                }
            });
});


// ======================================================================
// Actualizar Doctor
// ======================================================================

app.put('/:id', mdAth.verifyToken, (req, res) => {
    var id = req.params.id;
    let body = req.body;
    console.log(body);
    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al buscar el doctor',
                errors: err
            });
        } else {
            if (!doctor) {
                return res.status(400).json({
                    status: false,
                    mensaje: 'No se encontro el doctor con id: ' + id,
                    errors: {mensaje: 'No existe el doctor con ese ID'}
                });
            } else {
                doctor.name = body.name;
                doctor.img = body.img;
                doctor.user = body.idUser;
                doctor.hospital = body.idHospital;
                doctor.save((err, doctorSave) => {
                    if (err) {
                        return res.status(400).json({
                            status: false,
                            mensaje: 'Error al actualizar el Doctor',
                            errors: err
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            doctor: doctorSave
                        });
                    }
                });
            }
        }
    });
});

// ======================================================================
// Crear Doctores
// ======================================================================

app.post('/', mdAth.verifyToken, (req, res) => {
    let body = req.body;
    let doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: body.idUser,
        hospital: body.idHospital
    });
    doctor.save((err, doctorSave) => {
        if (err) {
            return res.status(400).json({
                status: false,
                mensaje: 'Error al crear el doctor',
                errors: err
            });
        } else {
            res.status(201).json({
                status: true,
                doctor: doctorSave
            });
        }
    });
});

// ======================================================================
// Delete doctor by ID
// ======================================================================
app.delete('/:id', mdAth.verifyToken, (req, res) => {
    var id = req.params.id;
    Doctor.findByIdAndRemove(id, (err, doctorDeleted) => {
        if (err) {
            return res.status(500).json({
                status: false,
                mensaje: 'Error al borrar el doctor',
                errors: err
            });
        } else {
            if (!doctorDeleted) {
                res.status(400).json({
                    status: false,
                    errors: {message: 'No existe el Doctor con el id' + id}
                });
            } else {
                res.status(200).json({
                    status: true,
                    doctor: doctorDeleted,
                    message: 'Doctor Borrado'
                });
            }
        }
    });
});


module.exports = app;
