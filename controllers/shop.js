const Product = require('../models/product');
const Order = require('../models/order');
const {products} = require("../../dynamic-content/routes/admin");
const {log} = require("nodemon/lib/utils");

//New Controllers
exports.getIndexPage = (req, res, next) => {
    Product.find().lean()
        .then(products => {
            console.log(req.session.isLoggedIn)
        res.render('shop/index', {
            prods: products,
            docTitle: 'Shop',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
            isLoggedIn: req.session.isLoggedIn
        });
    })
        .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    let prodId = [];
    let prodQuantity = [];
    req.user.cart.items.forEach(elem => {
        prodId.push(elem.productId);
        prodQuantity.push(elem.quantity);
    })

    Product.find({
        '_id': {
            $in: prodId
        }
    }).then(products => {
        let resultObject = [];
        products.forEach((prod, index) => {
            resultObject.push({
                title: prod.title,
                quantity: prodQuantity[index],
                _id: prodId[index]
            })
        });
        res.render('shop/cart', {
            docTitle: 'Cart',
            formsCss: true,
            cartCSS: true,
            activeCart: true,
            hasProducts: resultObject.length > 0,
            prods: resultObject,
            isLoggedIn: req.session.isLoggedIn
        })
    })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        //console.log(result);
        res.redirect('/shop/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect('/shop/cart');
        })
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.find().lean()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                docTitle: 'Shop',
                hasProducts: products.length > 0,
                activeProductList: true,
                productCSS: true,
                isLoggedIn: req.session.isLoggedIn,
            });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).lean()
        .then(product => {
            res.render('shop/product-detail', {
                product,
                docTitle: product.title,
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

exports.getCheckOut = (req, res, next) => {
    res.render('shop/checkout', {
        docTitle: 'Checkout',
        formsCss: true,
        productCSS: true,
        activeCheckout: true,
        isLoggedIn: req.session.isLoggedIn
    });
};

exports.postOrders = (req, res, next) => {
    let prodId = [];
    let prodQuantity =[];

    // const pr = req.user.cart.items.map(i => {
    //     return { quantity: i.quantity, product: i.productId};
    // });
    // res.send(pr);

    req.user.cart.items.forEach(elem => {
        prodId.push(elem.productId);
        prodQuantity.push(elem.quantity);
    });
    Product.find({'_id':{$in: prodId}})
        .then(DbProducts => {
            let products =[];
            DbProducts.forEach((elem, index) => {
                products.push({
                    productData: elem,
                    quantity: prodQuantity[index]
                });
            });
            const order = new Order({
                products: products,
                user: {
                    name: req.user.name,
                    userId: req.user._id
                }
            });
            return order.save();
        }).then(result => {
            return req.user.clearCart();
    })
        .then(() => {
        res.redirect('/shop/orders');
    })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id}).lean()
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Orders',
                order: orders,
                hasNoOrders: orders.length === 0,
                formsCss: true,
                ordersCSS: true,
                activeOrders: true,
                isLoggedIn: req.session.isLoggedIn
            })
        })
        .catch(err => console.log(err));
};
