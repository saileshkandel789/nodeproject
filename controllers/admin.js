
const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

const Product = require('../models/product');



exports.getAddProduct = (req,res,next) => {
    
    res.render('admin/edit-product', {
        doctitle : 'addproduct',
        path: '/admin/addproduct',
        editing: false,
        // isAuthenticated : req.session.isLoggedIn,
        hasError: false,
        errorMessage: null,
        validationErrors : []
    });
}

exports.postAddProduct = (req,res,next) => {
    // console.log(req.body);
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image);

    if (!image) {
        return res.status(422).render('admin/edit-product', {
          doctitle: 'Add Product',
          path: '/admin/addproduct',
          editing: false,
          hasError: true,
          product: {
            title: title,
            price: price,
            description: description
          },
          errorMessage: 'Attached file is not an image.',
          validationErrors: []
        });
      }

      

    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.status(422).render('admin/edit-product', {
            doctitle : 'Add product',
            path: '/admin/addproduct',
            editing:false,
            hasError: true,
            product: {
                title:title,
                imageUrl:imageUrl,
                price:price,
                description:description 
            },
            errorMessage:errors.array()[0].msg,
            validationErrors : errors.array()
        });
    }

    const imageUrl = image.path;
    
    const product  = new Product({
        title:title,
        price:price,
        imageUrl:imageUrl,
        description:description,
        userId: req.user
    });
    product
    .save()
    .then( result => {
        res.redirect('/admin/products');
    })
    .catch( err => {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    
};

exports.getEditProduct = (req,res,next) => {
    const editMode= req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    Product.findById(prodId)
    .then( product => {
        if(!product){
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            doctitle : 'Edit product',
            path: '/admin/edit-product',
            editing:editMode,
            product:product,
            // isAuthenticated : req.session.isLoggedIn,
            hasError: false,
            errorMessage: null,
            validationErrors : []
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    
}
exports.postEditProduct = (req,res,next) => {
    const prodId= req.body.productId;
    const updatedTitle= req.body.title;
    const updatedPrice= req.body.price;
    const updatedImageUrl= req.body.imageUrl;
    const updatedDesc = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.status(422).render('admin/edit-product', {
            doctitle : 'edit product',
            path: '/admin/edit-product',
            editing:true,
            hasError: true,
            product: {
                title:updatedTitle,
                imageUrl:updatedImageUrl,
                price:updatedPrice,
                description:updatedDesc,
                _id:prodId 
            },
            errorMessage:errors.array()[0].msg,
            validationErrors : errors.array()
        });
    }


    Product.findById(prodId)
    .then( product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save().then( result => {
            console.log('updated product');
            res.redirect('/admin/products');
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
    
    

}
exports.getProducts = (req,res,next) => {
    
    Product.find({userId:req.user._id})
    .then( products => {
        console.log(products);
        res.render('admin/products',{
            prods:products ,
            doctitle:'Admin Products',
            path: '/admin/products',
            isAuthenticated : req.session.isLoggedIn
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
exports.deleteProduct = (req,res,next) => {
    const prodId = req.params.productId;
    Product.deleteOne({_id: prodId , userId:req.user._id})
    .then(()=> {
        console.log('destroyed product');
        res.status(200).json({message: 'success'});
    })
    .catch(err => {
        res.status(500).json({ message: 'Deleting product failed.' });
    });
}