const path = require('path');

const express = require('express');

const productController = require('../controllers/shop');

const router = express.Router();

router.get('/', productController.getIndexPage);

router.get('/shop/products', productController.getProducts);

router.get('/products/:productId', productController.getProduct);

router.get('/shop/cart', productController.getCart);

router.post('/shop/cart', productController.postCart);

router.post('/cart-delete-item', productController.postCartDeleteProduct);

router.get('/shop/checkout', productController.getCheckOut);

router.post('/create-order', productController.postOrders);

router.get('/shop/orders', productController.getOrders);

module.exports = router;
