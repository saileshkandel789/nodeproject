const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth: {
//         api_key :'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'
//     }
// }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:'saileshkandel789@gmail.com',
        pass:'javaandme789'
    }
});


exports.getLogin = (req,res, next) => {
    // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    // console.log(req.get('Cookie'));

    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    // console.log(req.flash('error'));

    res.render('auth/login', {
        path:'/login',
        doctitle : 'Login',
        errorMessage : message
        
    });
};

exports.postLogin = (req,res, next) => {
    // res.setHeader('Set-Cookie' , 'loggedIn = true;HttpOnly');
    const email = req.body.email;
    const password = req.body.password;

    // User.findById('5d3969543705592facefd0d6')
    User.findOne({ email: email})
    .then(user => {
        if(!user){
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        bcrypt
            .compare(password, user.password)
            .then(domatch => {
                if(domatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    });
                    
                }
                req.flash('error', 'Invalid email or password.');
                 res.redirect('/login');
            })
            .catch(err=> {
            console.log(err);
        })
      
      
      
    })
    .catch(err => console.log(err));
    // req.session.isLoggedIn = true;
    // res.redirect('/');
};

exports.postLogout = (req, res, next) => {
    // res.setHeader('Set-Cookie' , 'loggedIn = true;HttpOnly');
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      doctitle: 'Signup',
      isAuthenticated: false,
      errorMessage:message
    });
  };
  
  exports.postSignup = (req, res, next) => {
      const email = req.body.email;
      const password = req.body.password;
      const confirmPassword = req.body.confirmPassword;

      User.findOne({ email:email })
      .then(userDoc => {
        if(userDoc){
            req.flash('error', 'E-mail already exist,please pick different one');
            return res.redirect('/signup');
        }
        return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email:email,
                password:hashedPassword,
                cart : { items : [] }
            });
            return user.save();
          })
          .then(result => {
              res.redirect('/login');
              var mailOptions = {
                from: 'saileshkandel789@gmail.com',
                to: email,
                subject: 'Signup succeeded',
                text: `<h1> You sucessfully signed up! </h1>`
              };

            //   return transporter.sendMail({
            //       to: email,
            //       from:'saileshkandel789@gmail.com',
            //       subject:'Signup succeeded',
            //       html : '<h1> You sucessfully signed up! </h1>'
            //   }
            return transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              
          })
          .catch(err => {
              console.log(err);
          });
        

      })
      .catch(err=> {
          console.log(err);
      });

  };

  exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
        // console.log(message);
    }else{
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        doctitle: 'Reset Password',
        errorMessage:message
      });
  };

  exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex'); // change to string with ASCII from hex
        console.log(token);
        User.findOne({email: req.body.email})
        .then( user => {
            if(!user){
                req.flash('error' , 'No account with that email found');
                return res.redirect('/reset');
                
            }
            console.log(user);
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            // var mailOptions1 = {
            //     from: 'saileshkandel789@gmail.com',
            //     to: req.body.email,
            //     subject: 'password reset',
            //     text: `
            //         <p>You requested a password reset</p>
            //         <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new Password</p>
            //     `
            //   };
             return transporter.sendMail({
                from: 'saileshkandel789@gmail.com',
                to: req.body.email,
                subject: 'password reset',
                text: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new Password</p>
                `
                 
             });
        })
        .catch(err => {
            console.log(err);
        });

    });
  }

  exports.getNewPassword = (req,res,next) => {
      const token = req.params.token;
      User.findOne({resetToken : token , resetTokenExpiration : { $gt: Date.now() } })
      .then(user => {
        let message = req.flash('error');
        if(message.length > 0){
            message = message[0];
            // console.log(message);
        }else {
            message = null;
        }
        res.render('auth/new-password' , {
          path: '/new-password',
          doctitle : 'New Password',
          errorMessage : message,
          userId : user._id.toString(),
          passwordToken : token
      });
      })
      .catch(err => {
          console.log(err);
      })
    
  }

  exports.postNewPassword = (req, res, next) => {
      let newPassword = req.body.Password;
      const userId = req.body.userId;
      const passwordToken = req.body.passwordToken;
      let resetUser;
    //   let newPassword =  bcrypt.hash(req.body.password , 12);
      User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration : { $gt : Date.now() },
            _id: userId
        })
        .then( user => {
            console.log(user);
            resetUser = user;
            return bcrypt.hash(newPassword , 12);
            // resetUser.password = newPassword;
            // resetUser.resetToken = undefined;
            // resetUser.resetTokenExpiration = undefined;
            // return resetUser.save();
            // console.log(resetUser);
            // console.log(bcrypt.hash('newPassword', 12));
            
            
            // bcrypt.genSalt(12, function(err, salt) {
            //     if (err) return next(err);
            //     bcrypt.hash(newPassword, salt,null, function(err, hash) {
            //         if (err) return next(err);
            //         // Store hash in your password DB.
            //         resetUser.password = hash;
            //         resetUser.resetToken = undefined;
            //         resetUser.resetTokenExpiration = undefined;
            //         return resetUser.save();
            //     });
            // });

            // return bcrypt.hash(newPassword , 12);
            // var salt = bcrypt.genSaltSync(12);
            // var hash = bcrypt.hashSync(newPassword, salt);
            // resetUser.password = hash;
            // resetUser.resetToken = undefined;
            // resetUser.resetTokenExpiration = undefined;
            // return resetUser.save();
        })
        .then(hashedPassword => {
            console.log(hashedPassword);
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        });


  }