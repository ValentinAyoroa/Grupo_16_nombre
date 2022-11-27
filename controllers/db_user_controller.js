const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const db = require('../database/models');
const sequelize = db.sequelize;

const User = db.users;

const db_user_controller = {
    login: (req, res) => {
        res.render('login');
    },
    processLogin: (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.render('login', {
                errors: error.mapped(),
                old: req.body
            });
        };
        const userFound = User.findOne({
            where: {
                email: req.body.email && bcrypt.compareSync(req.body.password, user.password)
            }
        });
        if (userFound == null) {
            res.render('login', { errorLogin: 'credenciales invalidas' })
        } else {
            req.session.usuarioLogueado = {
                id: userFound.id,
                first_name: userFound.nombre,
                last_name: userFound.apellido,
                email: userFound.email,
                avatar: userFound.image,
                cellphone: userFound.celular
            };
            if (req.body.remember) {
                res.cookie('recordame', userFound.id);
            }
            res.redirect('/');
        }
    },
    logout: (req, res) => {
        req.session.destroy();
        res.clearCookie('recordame');
        res.redirect('/');
    },
    register: function (req, res) {
        res.render('register');
    },
    registerUser: function (req, res) {
        const errors = validationResult(req);
        console.log(errors); // llamamos la funcion para observar como salen los resultados.
        if (!errors.isEmpty()) {
            // si tenemos errores, los mostramos en pantalla.
            res.render('register', { errors: errors.mapped(), old: req.body });
        } else {
            // si no tenemos errores, creamos el usuario.
            User.create({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                firstname: req.body.name,
                last_name: req.body.surname,
                phone: req.body.phone,
            }).then(() => {
                res.redirect('/users/register');
            }).catch(error => res.send(error))
        }
    },
    profile: (req, res) => {
        if (req.session.usuarioLogueado) {
            res.render('perfil', { usuario: req.session.usuarioLogueado });
        } else {
            res.render('login');
        };
    },
    avatar: function (req, res) {
        let userId = req.session.usuarioLogueado.id;
        User.update({
            avatar: req.body.file
        }, {
            where: {
                id: userId
            }
        })
    },
    edit: function (req, res) {
        if (req.session.usuarioLogueado) {
            res.render('editar-perfil', { usuario: req.session.usuarioLogueado });
        } else {
            res.render('login');
        }
    },
    upload: (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            let userId = req.session.usuarioLogueado.id;
            User.update({
                email: req.body.email,
                firstname: req.body.nombre,
                last_name: req.body.apellido,
                phone: req.body.celular,
            },
                {
                    where: {
                        id: userId
                    }
                }).then((req, res) => {
                    req.session.usuarioLogueado = {
                        nombre: req.body.nombre,
                        apellido: req.body.apellido,
                        email: userFound.email,
                        celular: req.body.celular,
                        //falta imagen, estoy medio perdido en este punto con sesssion y como
                        //editarlo para adaptarlo a db
                    };
                }).then(() => {
                    res.redirect('/users/profile')
                }).catch(error => res.send(error))
        } else {
            res.render('editar-perfil', { errors: errors.mapped(), old: req.body });
        }
    }
}
module.exports = db_user_controller;