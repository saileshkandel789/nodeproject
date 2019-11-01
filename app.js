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
const MONGODB_URI = 'mongodb+srv://sailesh:B8WXvyo4RFcs2HrB@cluster0-i5aqn.mongodb.net/shop';


const app = express();




const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();


app.set('view engine', 'ejs');
app.set('views' , 'views');





    
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyparser.urlencoded({extended:false}));
app.use(multer({ dest: 'images' }).single('image'));
app.use(express.static(path.join(__dirname , 'public')));
app.use(
    session({
        secret:'my secret',
        resave: false,
        saveUninitialized:false,
        store:store 
    })
    );



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
        next(new Error(err));

    });
    
    
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
    app.listen(3000);
})
.catch (err => {
    console.log(err);
});





