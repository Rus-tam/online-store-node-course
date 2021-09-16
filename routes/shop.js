const path = require('path');

const express = require('express');

const productController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', productController.getIndexPage);

router.get('/shop/products', productController.getProducts);

router.get('/products/:productId', productController.getProduct);

router.get('/shop/cart', isAuth, productController.getCart);

router.post('/shop/cart', isAuth, productController.postCart);

router.post('/cart-delete-item', isAuth, productController.postCartDeleteProduct);

router.get('/shop/checkout', isAuth, productController.getCheckOut);

router.post('/create-order', isAuth, productController.postOrders);

router.get('/shop/orders', isAuth, productController.getOrders);

module.exports = router;
