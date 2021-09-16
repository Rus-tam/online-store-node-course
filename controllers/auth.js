const User = require('../models/user');
const bcrypt = require('bcryptjs');


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
            })
        })

        .then(result => {
            res.redirect('/auth/login');
        })
        .catch(err => console.log(err));
};
