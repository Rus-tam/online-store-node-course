const path = require('path');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const hbs = require('hbs');
const errorController = require('./controllers/error');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = process.env.DB_URL;

const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',

});

app.engine('hbs', expressHbs({
    layoutsDir: 'views/layouts/',
    defaultLayout: 'mainLayout',
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'views');
hbs.registerPartials(__dirname + '/views/partials');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));

})

// app.use((req, res, next) => {
//
// })

app.use('/admin', adminData);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);



//app.listen(3000);
// mongoConnect(() => {
//     app.listen(3000);
// })

mongoose.connect(MONGODB_URI)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Rustam',
                    email: 'test@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });

        console.log('Connecting with mongoose');
        app.listen(3000);
    })
    .catch(err => console.log(err));
