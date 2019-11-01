const path = require('path');
const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();
const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

// /admin/addproduct => GET
router.get('/addproduct',isAuth , adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth , adminController.getProducts);

// // /admin/addproduct => POST
router.post(
    '/addproduct',
     [
    body('title')
        .isString()
        .isLength({ min:3 })
        .trim(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({ min:5, max:200 })
        .trim()
    
    ] ,
    isAuth ,
    adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth , adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title')
            .isString()
            .isLength({ min:3 })
            .trim(),
        body('imageUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({ min:5, max:200 })
            .trim()
    
    ],
    isAuth ,
    adminController.postEditProduct);


router.delete('/product/:productId', isAuth , adminController.deleteProduct);

module.exports = router;