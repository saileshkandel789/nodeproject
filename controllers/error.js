exports.get404 = (req ,res ,next) => {
    // res.status(404).send('<h1>page not found</h1>');
    // res.status(404).sendfile(path.join(__dirname,'views','error.html'));
    res.status(404).render('error', 
    {
        doctitle:'lando',
         path: '/404',
         isAuthenticated : req.session.isLoggedIn
        });
}

exports.get500 = (req ,res ,next) => {
    res.status(500).render('500', 
    {
        doctitle:'error',
         path: '/500',
         isAuthenticated : req.session.isLoggedIn
        });
}