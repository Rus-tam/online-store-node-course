const mongodb = require('mongodb');
const Product = require('../models/product');

const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true,
        editing: false,
        isLoggedIn: req.session.isLoggedIn
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.session.user._id
    });

    product
        .save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId).lean()
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                product,
                docTitle: 'Edit product',
                formsCSS: true,
                productCSS: true,
                //activeAddProduct: true,
                editing: editMode,
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;

    Product.findById(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDescription;
        return product.save();
    })
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
};

exports.getAdminProducts = (req, res, next) => {
    Product.find().lean().populate('userId')
        .then(products => {
            res.render('admin/products', {
                prods: products,
                docTitle: 'Admin products',
                hasProducts: products.length > 0,
                activeAdminProducts: true,
                productCSS: true,
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findByIdAndDelete(prodId)
        .then(result => {
            console.log('Destroyed product!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}