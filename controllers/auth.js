const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.mailTransporterUser,
        pass: process.env.mailTransporterPassword
    }
});

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        docTitle: 'Login',
        formsCss: true,
        ordersCSS: true,
        activeLogin: true,
        loginCSS: true,
        formCss: true,
        isLoggedIn: false,
        errorMessage: req.flash('error')
    })
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/auth/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    res.redirect('/auth/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/auth/login');
                })

            //next();
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    //console.log(req.session);
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/')
        }
    })
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        docTitle: 'Signup',
        formsCss: true,
        ordersCSS: true,
        loginCSS: true,
        formCss: true,
        activeSignup: true,
        isLoggedIn: false,
        errorMessage: req.flash('error')
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    //Проверку отсутствия повторяющихся почтовых адресов можно сделать через модель в mongoose. Ниже приводится альтернативный способ
    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'E-Mail exists already');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                });
            return user.save();
            }).then(result => {
                return transporter.sendMail({
                    to: email,
                    from: 'shop@node-complete.com',
                    subject: 'Signup succeeded!',
                    html: '<h1>You successfully signed up!</h1>'
                })
            })
        })
        .catch(err => console.log(err));
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        docTitle: 'Reset Password',
        formsCss: true,
        ordersCSS: true,
        activeLogin: true,
        loginCSS: true,
        formCss: true,
        isLoggedIn: false,
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('auth/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found');
                    console.log('No such email in DB')
                    return res.redirect('auth/reset');
                } else {
                    user.resetToken = token;
                    user.resetTokenExpiration = Date.now() + 3600000;

                    transporter.sendMail({
                        to: req.body.email,
                        from: 'shop@node-complete.com',
                        subject: 'Password reset',
                        html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/auth/reset/${token}">link</a> to set a new password</p>`
                    })

                    return user.save();
                }
            })
            .then(result => {
                res.redirect('/auth/reset');
        })

            .catch(err => console.log(err))
    })
};

exports.getNewPassword =(req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                docTitle: 'New Password',
                formsCss: true,
                ordersCSS: true,
                activeLogin: true,
                loginCSS: true,
                formCss: true,
                isLoggedIn: false,
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(err => console.log(err))
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        }).then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            resetUser.save();
    }).then(() => {
        res.redirect('/auth/login');
    })
        .catch(err => console.log(err))

};