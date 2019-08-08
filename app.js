const path = require('path');
const express = require('express');

const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
// const expressHbs = require('express-handlebars');
const MONGODB_URI = 'mongodb+srv://sailesh:B8WXvyo4RFcs2HrB@cluster0-i5aqn.mongodb.net/shop';
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const app = express();

const csrfProtection = csrf();

// app.engine('hbs', expressHbs({layoutsDir:'views/layout/',defaultLayout:'mainlayout'}));
app.set('view engine', 'ejs');
// app.set('view engine','pug');
app.set('views' , 'views');





    
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');
const User = require('./models/user');

// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');



app.use(bodyparser.urlencoded({extended:false}));
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
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
      req.user= user;
      next();
    })
    .catch(err => console.log(err));
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

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

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

