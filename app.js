const path = require('path');
const express = require('express');

const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');
// const expressHbs = require('express-handlebars');
const MONGODB_URI = 'mongodb+srv://sailesh:B8WXvyo4RFcs2HrB@cluster0-i5aqn.mongodb.net/shop';


const app = express();




const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null , 'images');
    },
    filename : (req ,file, cb) => {
        cb(null , new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req , file , cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }else{
        cb(null, false);
    }
}
// app.engine('hbs', expressHbs({layoutsDir:'views/layout/',defaultLayout:'mainlayout'}));
app.set('view engine', 'ejs');
// app.set('view engine','pug');
app.set('views' , 'views');





    
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');



// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');



app.use(bodyparser.urlencoded({extended:false}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// app.use(multer({ dest: 'images' }).single('image'));
app.use(express.static(path.join(__dirname , 'public')));
app.use(
    session({
        secret:'my secret',
        resave: false,
        saveUninitialized:false,
        store:store 
    })
    );


// db.execute('SELECT * FROM products')
// .then(result => {
//     console.log(result[0], result[1]);
// })
// .catch(err => {
//     console.log(err);
// });
app.use(csrfProtection);

app.use(flash()); // use after session midlleware (app.use session)

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    // throw new Error('Dummy');
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        // throw new Error('Dummy');
        if(!user){
            return next();
        }
      req.user= user;
      next();
    })
    .catch(err => {
        // throw new Error(err); inside callback ,promise or then catch we can't use this instead use below code
        next(new Error(err));

    });
    // next();
    // User.findByPk(1)
    // .then( user => {
    //     req.user = user;
    //     next();
    // })
    // .catch( err => {
    //     console.log(err);
    // })
    // next();
    
});

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', 
    {
        doctitle:'error',
         path: '/500',
         isAuthenticated : req.session.isLoggedIn
        });
});

mongoose
.connect(
    MONGODB_URI
)
.then(result => {
    // User.findOne().then(user => {
    //     if(!user){
    //         const user = new User({
    //             name: 'sailesh',
    //             email: 'saileshkandel789@gmail.com',
    //             cart: {
    //                 items : []
    //             }
    //         });
    //         user.save();
    //     }
    // });
    
    app.listen(3000);
})
.catch (err => {
    console.log(err);
});





// kkk
// const path = require('path');

// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const csrf = require('csurf');
// const flash = require('connect-flash');
// const multer = require('multer');

// const errorController = require('./controllers/error');
// const User = require('./models/user');

// const MONGODB_URI =
//   'mongodb+srv://sailesh:B8WXvyo4RFcs2HrB@cluster0-i5aqn.mongodb.net/shop';

// const app = express();
// const store = new MongoDBStore({
//   uri: MONGODB_URI,
//   collection: 'sessions'
// });
// const csrfProtection = csrf();

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/png' ||
//     file.mimetype === 'image/jpg' ||
//     file.mimetype === 'image/jpeg'
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// app.set('view engine', 'ejs');
// app.set('views', 'views');

// const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');
// const authRoutes = require('./routes/auth');

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(
//   session({
//     secret: 'my secret',
//     resave: false,
//     saveUninitialized: false,
//     store: store
//   })
// );
// app.use(csrfProtection);
// app.use(flash());

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

// app.use((req, res, next) => {
//   // throw new Error('Sync Dummy');
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then(user => {
//       if (!user) {
//         return next();
//       }
//       req.user = user;
//       next();
//     })
//     .catch(err => {
//       next(new Error(err));
//     });
// });

// app.use('/admin', adminRoutes);
// app.use(shopRoutes);
// app.use(authRoutes);

// app.get('/500', errorController.get500);

// app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   // res.status(error.httpStatusCode).render(...);
//   // res.redirect('/500');
//   res.status(500).render('500', {
//     doctitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   });
// });

// mongoose
//   .connect(MONGODB_URI)
//   .then(result => {
//     app.listen(3000);
//   })
//   .catch(err => {
//     console.log(err);
//   });



// kkkk









// mongoConnect(() => {
//     app.listen(3000);
// });




// Product.belongsTo(User , { constraints : true , onDelete : 'CASCADE'});
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product , { through: CartItem });
// Product.belongsToMany(Cart , { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem , timestamps: false});


// sequelize
// // .sync({ force: true })
// .sync()
// .then(result => {
//     return User.findByPk(1);
//     // console.log(result);
    
// })
// .then(user => {
//     if(!user){
//         return User.create({name:'max',email:'test@test.com'});
//     }
//     return user;
// })
// .then( user =>{
//     // console.log(user);
//     return user.createCart();
// })
// .then( cart => {
//     app.listen(3000);

// })
// .catch(err => {
//     console.log(err);
// })

