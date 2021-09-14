const User = require('../models/user')


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        docTitle: 'Login',
        formsCss: true,
        ordersCSS: true,
        activeLogin: true,
        loginCSS: true,
        formCss: true,
        isLoggedIn: false
    })
};

exports.postLogin = (req, res, next) => {
    User.findById('61334ee299888d33e6e53bf7')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect('/');
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
}