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
    let cartCount = null
    if (req.session.user) {
        userHelper.getCartCount(req.session.user._id).then((response) => {
            cartCount = response
        })
    }
    
    productHelper.getAllProducts().then((products) => {
        res.render('user/view-products', { admin: false, products, user, cartCount});
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
    let products = await userHelper.getCartProducts(req.session.user._id)
    console.log(products);
    res.render('user/cart', {products,user:req.session.user});
})



router.get('/add-to-cart/:id', (req, res) => {
    console.log('api call');
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
        // res.redirect('/')
        res.json({status:true})
    })
})

router.post('/change-product-quantity', (req, res, next) => {
    console.log('ddddddd',req.body);
    userHelper.changeProductQuantity(req.body).then((response) => {

        console.log('ffffffffffffffffffffffffffffffffffffff', response);
        res.json(response)
    })
})

router.get('/remove/:cartId/:productId', (req, res) => {
     userHelper.removeItemFromCart(req.params.cartId,req.params.productId).then((response) => {
        if (response) {
            res.redirect('/cart')
        }
    })
})


router.get('/place-order', verfyLogin, async(req, res) => {
    let total = await userHelper.getTotalAmount(req.session.user._id)
    res.render('user/place-order');
})




module.exports = router;