// const mongodb = require('mongodb');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

// const Cart = require('../models/cart') ;
// const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req,res,next) => {
    // res.send('<form action="/admin/addproduct" method="post"><input type="text" name="title"><button type="submit">add product </button></form>');
    // res.sendfile(path.join(__dirname,'../','views', 'addproduct.html'));

    // res.sendfile(path.join(rootdir,'views', 'addproduct.html'));
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
    // const imageUrl = req.file;
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
    // req.user.createProduct({
    //     title:title,
    //     price:price,
    //     imageUrl:imageUrl,
    //     description:description
    // })
    const product  = new Product({
        // _id: new mongoose.Types.ObjectId('5d52726018537e0430f17578'), to try database crash error
        title:title,
        price:price,
        imageUrl:imageUrl,
        description:description,
        userId: req.user
    });
    product
    .save()
    .then( result => {
        // console.log(result);
        res.redirect('/admin/products');
    })
    .catch( err => {
        // console.log('An error occured');
        // console.log(err);


        // return res.status(500).render('admin/edit-product', {
        //     doctitle : 'Add product',
        //     path: '/admin/add-product',
        //     editing:false,
        //     hasError: true,
        //     product: {
        //         title:title,
        //         imageUrl:imageUrl,
        //         price:price,
        //         description:description 
        //     },
        //     errorMessage:'Database operation failed please try again.',
        //     validationErrors : []
        // });


        // res.redirect('/500');

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    // const product = new Product(null,title, imageUrl, description, price);
    // product.save()
    // .then(()=> { 
    //     res.redirect('/');
    // }).catch( err => console.log(err));





    // products.push({title:req.body.title});
    
};

exports.getEditProduct = (req,res,next) => {
    const editMode= req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;


    // Product.findAll({ where: {id : prodId} }).then( products => {
    //     if(!products){
    //         return res.redirect('/');
    //     }
    //     res.render('admin/edit-product', {
    //         doctitle : 'Edit product',
    //         path: '/admin/edit-product',
    //         editing:editMode,
    //         product:products[0]
    //     });

    // })
    // .catch( err => {
    //     console.log(err);
    // });

    // req.user
    // .getProducts({where : {id : prodId}})
    // Product.findByPk(prodId)
    Product.findById(prodId)
    .then( product => {
        // throw new Error ('Dummy'); for database fail not use in application
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

    // Product.findById(prodId , product => {
    //     if(!product){
    //         return res.redirect('/');
    //     }
    //     res.render('admin/edit-product', {
    //         doctitle : 'Edit product',
    //         path: '/admin/edit-product',
    //         editing:editMode,
    //         product:product
    //     });
    // });
    
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

    // Product.findAll({ where: {id : prodId} }).then( products => {

    //     products[0].title = updatedTitle;
    //     products[0].price = updatedPrice;
    //     products[0].imageUrl = updatedImageUrl;
    //     products[0].description = updatedDesc;
        
        
    //     return products[0].save();
        
        
    //     // console.log(product);
    // })


    // const product = new Product(updatedTitle, updatedPrice , updatedImageUrl, updatedDesc, prodId);

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
    
    
    // Product.findByPk(prodId)
    // .then(product => {
    //     product.title = updatedTitle;
    //     product.price = updatedPrice;
    //     product.imageUrl = updatedImageUrl;
    //     product.description = updatedDesc;
    //      return product.save();
    // })
    // .catch( err => {
    //     console.log(err);
    // });   

    // const updatedProduct = new Product(prodId ,updatedTitle,updatedPrice,updatedImageUrl,updatedDesc);
    // updatedProduct.save();
    

}
exports.getProducts = (req,res,next) => {
    // Product.fetchAll(products => {
    //     res.render('admin/products',{
    //         prods:products ,
    //         doctitle:'Admin Products',
    //         path: '/admin/products',
    //     });
    // });


    // Product.findAll()
    // req.user.getProducts()
    Product.find({userId:req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
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
exports.postDeleteProduct = (req,res,next) => {
    const prodId = req.body.productId;
    
    // Product.findByPk(prodId)
    Product.deleteOne({_id: prodId , userId:req.user._id})
    // .then( product => {
    //     return product.destroy();
    // })
    .then(()=> {
        console.log('destroyed product');
        res.redirect('/admin/products');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    // Product.deleteById(prodId);
    // res.redirect('/admin/products');
}