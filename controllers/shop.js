const Product = require('../models/product');
// const Cart = require('../models/cart');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    // res.send('<h1>Welcome to our product</h1>');
    // res.sendFile(path.join(__dirname,'../','views','shop.html'));

    // res.sendFile(path.join(rootdir,'views','shop.html'));
    // console.log('shop',admindata.products);


    //  Product.fetchAll(products => {
    //     res.render('shop/product-list',{
    //         prods:products ,
    //         doctitle:'All Products',
    //         path: '/products'
    //     });
    // });


    // Product.fetchAll()
    // .then(([rows,fieldData]) => {
    //     res.render('shop/product-list',{
    //         prods:rows ,
    //         doctitle:'All Products',
    //         path: '/products'
    //     });
    // })
    // .catch( err =>  console.log(err));

    Product.find()
    .then( products => {
        console.log(products);
        res.render('shop/product-list',{
            prods:products ,
            doctitle:'All Products',
            path: '/products',
            isAuthenticated : req.session.isLoggedIn
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
        
};
exports.getProduct = (req,res,next) => {
    const prodId = req.params.productId;
    // Product.findAll({ where: {id : prodId} })
    // .then(products => {
    //     res.render('shop/product-detail',{
    //         product:products[0] ,
    //         doctitle: products[0].title,
    //         path: '/products'
    //     });

    // }).catch( err => {
    //     console.log(err);
    // })

    Product.findById(prodId)
    .then(product => {
        res.render('shop/product-detail', {
            product:product ,
            doctitle: product.title,
            path: '/products',
            isAuthenticated : req.session.isLoggedIn
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
};

// exports.getProduct = (req,res,next) => {
//     const prodId = req.params.productId;
//     // console.log(prodId);
//     Product.findById(prodId).then(([product]) => {
//         res.render('shop/product-detail',{
//             product:product[0] ,
//             doctitle: product.title,
//             path: '/products'
//         });
//     }).catch(err => console.log(err));
    
// };

// exports.getIndex = (req,res,next) => {
//     Product.fetchAll(products => {
//         res.render('shop/index',{
//             prods:products ,
//             doctitle:'shop',
//             path: '/'
//         });
//     });
// };

exports.getIndex = (req,res,next) => {
    Product.find()
    .then( products => {
        res.render('shop/index',{
            prods:products ,
            doctitle:'shop',
            path: '/'
            // isAuthenticated : req.session.isLoggedIn,
            // csrfToken: req.csrfToken()
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });


    // Product.fetchAll()
    // .then( ([rows , fieldData]) => {
    //     res.render('shop/index',{
    //         prods:rows ,
    //         doctitle:'shop',
    //         path: '/'
    //     });  
    // }).catch( err => console.log(err));
};

exports.getCart = (req,res,next) => {
        // console.log(req.user.cart); 
        req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then( user => {
            // console.log(user.cart.items);
            const products = user.cart.items;
            res.render('shop/cart',{
                doctitle:'Your Cart',
                path: '/cart',
                products: products,
                isAuthenticated : req.session.isLoggedIn
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        
        // Cart.getCart(cart => {
        //     Product.fetchAll(products => {
        //         const cartProducts = [];
        //         for(product of products){
        //             const cartProductData = cart.products.find(prod => prod.id === product.id);
        //             if(cartProductData ){
        //                 cartProducts.push({productData: product, qty:cartProductData.qty});

        //             }
        //         }
        //         res.render('shop/cart',{
        //             doctitle:'Your Cart',
        //             path: '/cart',
        //             products: cartProducts
        //         });
        //     })
        // }) 
        
};

exports.postCart = (req,res,next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        console.log(result);
        res.redirect('/cart');
    });
    // let fetchedCart;
    // let newQuantity = 1;
    // req.user
    // .getCart()
    // .then( cart => {
    //     fetchedCart = cart;
    //     return cart.getProducts({ where: { id : prodId}});
    // })
    // .then( products => {
    //     let product;
    //     if(products.length > 0 ){
    //         product = products[0];
    //     }
        
    //     if(product){
    //         const oldQuantity = product.cartItem.quantity;
    //         newQuantity = oldQuantity + 1;
    //         return product;
    //     }
    //     return Product.findByPk(prodId);
        
    // })
    // .then( product => {
    //     return fetchedCart.addProduct(product , {
    //         through : { quantity:newQuantity}
    //     });

    // })
    // .then( () => {
    //     res.redirect('/cart');
    // })
    // .catch( err => { console.log(err)}); 







    // Product.findById(prodId , product => {
    //     Cart.addProduct(prodId , product.price);
    // });
    // res.redirect('/cart');
}

exports.postCartDeleteProduct = (req,res,next) => {
    const prodId = req.body.productId;
    req.user
    .removeFromCart(prodId)
    .then( () => {
        res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    // Product.findById(prodId,product => {
    //     Cart.deleteProduct(prodId,product.price);
    //     res.redirect('/cart');
    // });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then( user => {
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity , product: { ...i.productId._doc }};
            });
            const order = new Order({
                user: {
                    email:req.user.email,
                    userId: req.user
                },
                products: products
            });

             return order.save();
         })
    .then( result => {
        return req.user.clearCart();
    })
    .then( () => {
        res.redirect('/orders');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};
exports.getOrders = (req ,res ,next) => {
    Order.find({'user.userId':req.user._id })
    // req.user.getOrders()
    .then(orders => {
        res.render('shop/orders',{
            doctitle:'Your Orders',
            path: '/orders',
            orders:orders,
            isAuthenticated : req.session.isLoggedIn
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
};

exports.getCheckout = (req,res,next) => {
    res.render('shop/checkout',{
        doctitle:'Checkout',
        path: '/checkout'
    });
};