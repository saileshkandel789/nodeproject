const Product = require('../models/product');
const Order = require('../models/order');
const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
    

    const page = +req.query.page || 1;
    let totalItems; 

    Product.find()
        .countDocuments().then( numProducts => {
            totalItems = numProducts;
            return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        })
        .then( products => {
            res.render('shop/product-list',{
                prods:products ,
                doctitle:'Products',
                path: '/products',
                currentPage : page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage : page > 1 ,
                nextPage : page + 1 ,
                previousPage : page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
                
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


exports.getIndex = (req,res,next) => {
    const page = +req.query.page || 1;
    let totalItems; 

    Product.find()
        .countDocuments().then( numProducts => {
            totalItems = numProducts;
            return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        })
        .then( products => {
            res.render('shop/index',{
                prods:products ,
                doctitle:'shop',
                path: '/',
                currentPage : page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage : page > 1 ,
                nextPage : page + 1 ,
                previousPage : page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
                
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });


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