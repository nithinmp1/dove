var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var userHelper = require('../helpers/user-helpers');

const verfyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    let user = req.session.user;
    console.log('fffffffffffffffffffffff', user);
    productHelper.getAllProducts().then((products) => {
        console.log(products);
        res.render('user/view-products', { admin: false, products, user });
    })

    // res.render('index', { products, admin: false });
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        console.log('if');
        res.redirect('/');
    } else {
        console.log('esle');

        res.render('user/login', { "loginErr": req.session.loginErr });
        req.session.loginErr = false;
    }

})

router.get('/signup', (req, res) => {
    res.render('user/signup');
})

router.post('/signup', (req, res) => {
    userHelper.doSignup(req.body).then((response) => {
        console.log(response);
        if (response) {
            res.redirect('/login');
        } else {
            res.redirect('/signup')
        }
    })
})

router.post('/login', (req, res) => {
    userHelper.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true
            req.session.user = response.user
            res.redirect('/')
        } else {
            req.session.loginErr = true;
            res.redirect('/login')
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})


router.get('/cart', verfyLogin, async(req, res) => {
    let products = await userHelper.getCartProducts(req.session.user._id).
    res.render('user/cart');
})



router.get('/add-tot-cart/:id', (req, res) => {
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
        res.redirect('/')
    })
})




module.exports = router;