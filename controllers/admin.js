// const mongodb = require('mongodb');
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
        isAuthenticated : req.session.isLoggedIn
    });
}

exports.postAddProduct = (req,res,next) => {
    // console.log(req.body);
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    // req.user.createProduct({
    //     title:title,
    //     price:price,
    //     imageUrl:imageUrl,
    //     description:description
    // })
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
        // console.log(result);
        res.redirect('/admin/products');
    })
    .catch( err => {
        console.log(err);
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
        if(!product){
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            doctitle : 'Edit product',
            path: '/admin/edit-product',
            editing:editMode,
            product:product,
            isAuthenticated : req.session.isLoggedIn
        });
    })
    .catch(err => {
        console.log(err);
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
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save();
    })
    .then( result => {
        console.log('updated product');
        res.redirect('/admin/products');
    })
    .catch( err => {
        console.log(err);
        
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
    Product.find()
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
    .catch( err => {
        console.log(err);
    });
}
exports.postDeleteProduct = (req,res,next) => {
    const prodId = req.body.productId;
    
    // Product.findByPk(prodId)
    Product.findByIdAndRemove(prodId)
    // .then( product => {
    //     return product.destroy();
    // })
    .then(()=> {
        console.log('destroyed product');
        res.redirect('/admin/products');
    })
    .catch( err => console.log(err));
    // Product.deleteById(prodId);
    // res.redirect('/admin/products');
}