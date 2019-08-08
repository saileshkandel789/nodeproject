const path = require('path');
const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

// /admin/addproduct => GET
router.get('/addproduct',isAuth , adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth , adminController.getProducts);

// // /admin/addproduct => POST
router.post('/addproduct', isAuth , adminController.postAddProduct);
// // module.exports = router;
// // exports.routes = router;
router.get('/edit-product/:productId', isAuth , adminController.getEditProduct);

router.post('/edit-product', isAuth , adminController.postEditProduct);

router.post('/delete-product', isAuth , adminController.postDeleteProduct);

module.exports = router;