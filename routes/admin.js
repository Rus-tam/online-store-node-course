const express = require('express');

const productController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, productController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', isAuth, productController.postAddProduct);

router.get('/products', isAuth, productController.getAdminProducts);

router.get('/edit-product/:productId', isAuth, productController.getEditProduct);

router.post('/edit-product', isAuth, productController.postEditProduct);

router.post('/delete-product/:productId', isAuth, productController.postDeleteProduct);

module.exports = router;
